import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as assets from "aws-cdk-lib/aws-s3-assets";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling";
import * as iam from "aws-cdk-lib/aws-iam";
import * as custom from "aws-cdk-lib/custom-resources";
import { readFileSync } from "fs";
import { cwd } from "process";

export interface CdkStackConfig {
  // Top-level domain name (ex. example.com) for the app
  rootDomainName: string;
  expoAccessToken: string;
  // IDP clients for Cognito third-party login
  auth?: {
    google?: {
      clientId: string;
      clientSecret: string;
    };
  };
}

// grantConnect is broken right now, so we need this instead
// https://github.com/aws/aws-cdk/issues/11851
// Code taken from this comment: https://github.com/aws/aws-cdk/issues/11851#issuecomment-901346090
function grantIamAuth(
  scope: cdk.Stack,
  db: rds.DatabaseInstance,
  grantPrincipal: iam.IPrincipal,
  user: string
) {
  const dbResourceIdName = "DBInstances.0.DbiResourceId";
  const dbResourceId = new custom.AwsCustomResource(
    scope,
    `PostgresDBResourceIdCR-${grantPrincipal}`,
    {
      onCreate: {
        service: "RDS",
        action: "describeDBInstances",
        parameters: {
          DBInstanceIdentifier: db.instanceIdentifier,
        },
        physicalResourceId:
          custom.PhysicalResourceId.fromResponse(dbResourceIdName),
        outputPaths: [dbResourceIdName],
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: custom.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    }
  );
  const resourceId = dbResourceId.getResponseField(dbResourceIdName);

  const dbUserArn = `arn:aws:rds-db:${scope.region}:${scope.account}:dbuser:${resourceId}/${user}`;
  iam.Grant.addToPrincipal({
    grantee: grantPrincipal,
    actions: ["rds-db:connect"],
    resourceArns: [dbUserArn],
  });
}

export class CdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    config: CdkStackConfig,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      natGateways: 0, // NAT Gateways are billed by the hour, so we don't want any
    });

    /* Database */
    // TODO: upload database schema ("../database/init/01-create.sql") as an S3 asset, then,
    //       pull it in a lambda function custom resource (https://docs.aws.amazon.com/cdk/v2/guide/cfn_layer.html#cfn_layer_custom)
    //       at deploy-time to initialize the database. (might also need some mechanism for verifying the database
    //       is empty *before* nuking the entire thing?)
    const dbPort = 5432;
    const db = new rds.DatabaseInstance(this, "Database", {
      vpc,
      port: dbPort,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO
      ),
      iamAuthentication: true,
    });

    /* Cognito */
    const dbSyncUser = "usersync";
    const syncLambdaCode = new assets.Asset(this, "SyncUsersLambdaSource", {
      path: path.resolve(cwd(), "..", "sync-users-lambda", "dist"),
    });
    const syncLambda = new lambda.Function(this, "SyncUsersLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromBucket(
        syncLambdaCode.bucket,
        syncLambdaCode.s3ObjectKey
      ),
      handler: "main.handler",
      environment: {
        DB_NAME: "postgres",
        DB_USER: dbSyncUser,
        DB_HOST: db.dbInstanceEndpointAddress,
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });
    grantIamAuth(this, db, syncLambda.grantPrincipal, dbSyncUser);
    db.connections.allowFrom(syncLambda, ec2.Port.tcp(5432));
    const authDomain = `auth2.${config.rootDomainName}`;
    const authCert = new acm.Certificate(this, "AuthCert", {
      domainName: authDomain,
      validation: acm.CertificateValidation.fromDns(),
    });
    const userPool = new cognito.UserPool(this, "AppUserPool", {
      userPoolName: "app-userpool",
      signInCaseSensitive: false, // recommended in AWS docs
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
      lambdaTriggers: {
        postAuthentication: syncLambda,
      },
    });
    const supportedIdentityProviders: cognito.UserPoolClientIdentityProvider[] =
      [cognito.UserPoolClientIdentityProvider.COGNITO];
    if (config.auth?.google !== undefined) {
      new cognito.UserPoolIdentityProviderGoogle(this, "GoogleIDP", {
        clientId: config.auth.google.clientId,
        clientSecretValue: cdk.SecretValue.unsafePlainText(
          config.auth.google.clientSecret
        ),
        userPool,
      });
      supportedIdentityProviders.push(
        cognito.UserPoolClientIdentityProvider.GOOGLE
      );
    }
    userPool.addDomain("AppUserPoolDomain", {
      customDomain: {
        domainName: authDomain,
        certificate: authCert,
      },
    });
    userPool.addClient("AppUserPoolClient", {
      userPoolClientName: "eyespy-mobile",
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        callbackUrls: ["myapp://redirect", "eyespy://redirect"],
      },
      preventUserExistenceErrors: true,
      supportedIdentityProviders,
    });

    /* App webserver */
    const appSourceBundle = new assets.Asset(this, "AppSource", {
      path: path.join(cwd(), "..", "backend"),
    });
    const appSystemdUnit = new assets.Asset(this, "AppSystemdUnit", {
      path: path.join(cwd(), "assets", "app.service"),
    });

    const appEnvironment = {
      DB_HOST: db.dbInstanceEndpointAddress,
      DB_NAME: "postgres",
      DB_USER: "postgres",
      // https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html
      OIDC_ENDPOINT: `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`,
      EXPO_ACCESS_TOKEN: config.expoAccessToken ?? "",
    };
    const userData = readFileSync(path.join(cwd(), "assets", "userdata.sh"))
      .toString()
      .replace("$AWS_REGION", cdk.Stack.of(this).region)
      .replace("$APP_SOURCE_S3_OBJ_URL", appSourceBundle.s3ObjectUrl)
      .replace("$APP_SYSTEMD_SERVICE_S3_OBJ_URL", appSystemdUnit.s3ObjectUrl)
      .replace("$APP_DB_PASSWORD_SECRET_ARN", db.secret?.secretFullArn!)
      .replace(
        "$INSERT_ENVIRONMENTFILE_HERE",
        Array.from(Object.entries(appEnvironment))
          .map(([key, val]) => `${key}=${val}`)
          .join("\n")
      );

    const appScalingGroup = new autoscaling.AutoScalingGroup(
      this,
      "AppAutoScalingGroup",
      {
        // We really only want an ASG at the moment for NLB's TLS termination, so only create 1 EC2 instance
        minCapacity: 1,
        desiredCapacity: 1,
        maxCapacity: 1,

        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
          userData: ec2.UserData.custom(userData),
        }),
      }
    );
    // FIXME: this is hardcoded for us-east-1's Instance Connect range
    appScalingGroup.connections.allowFrom(
      ec2.Peer.ipv4("18.206.107.24/29"),
      ec2.Port.tcp(22),
      "EC2 Instance Connect"
    );
    db.connections.allowFrom(
      appScalingGroup,
      ec2.Port.tcp(dbPort),
      "Allow database connections from webserver"
    );
    // Permissions needed for bootstrapping in userdata
    db.secret?.grantRead(appScalingGroup.role);
    appSourceBundle.grantRead(appScalingGroup.role);
    appSystemdUnit.grantRead(appScalingGroup.role);

    // Set up a load balancer for TLS termination
    const loadBalancer = new elb.ApplicationLoadBalancer(this, "AppALB", {
      vpc,
      internetFacing: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });
    const appCert = new acm.Certificate(this, "AppCert", {
      domainName: `api2.${config.rootDomainName}`,
      validation: acm.CertificateValidation.fromDns(),
    });
    const tlsListener = loadBalancer.addListener("TLSListener", {
      port: 443,
      certificates: [appCert],
    });
    tlsListener.addTargets("TLSListenerTargets", {
      port: 3000,
      protocol: elb.ApplicationProtocol.HTTP,
      targets: [appScalingGroup],
    });

  }
}
