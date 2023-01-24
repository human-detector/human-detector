import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as assets from "aws-cdk-lib/aws-s3-assets";
import { readFileSync } from "fs";
import { cwd } from "process";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TODO: setup cognito (user pools, clients, domain names etc.)
    // TODO: write sync-user lambda
    // TODO: add simple API gateway routes directed at EC2 instance

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
      DB_NAME: "TODO",
      DB_USER: "postgres",
      AUTH_HOST: "TODO",
      EXPO_ACCESS_TOKEN: "TODO how we gonna do this one? CDK config file?",
    };
    const userData = readFileSync(path.join(cwd(), "assets", "userdata.sh"))
      .toString()
      .replace("$APP_SOURCE_S3_OBJ_URL", appSourceBundle.s3ObjectUrl)
      .replace("$APP_SYSTEMD_SERVICE_S3_OBJ_URL", appSystemdUnit.s3ObjectUrl)
      .replace("$APP_DB_PASSWORD_SECRET_ARN", db.secret?.secretFullArn!)
      .replace(
        "$INSERT_ENVIRONMENTFILE_HERE",
        "cat << EOF\n" +
          Array.from(Object.entries(appEnvironment))
            .map(([key, val]) => `${key}=${val}`)
            .join("\n") +
          "\nEOF\n"
      );

    const app = new ec2.Instance(this, "AppServer", {
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
    });
    app.connections.allowFromAnyIpv4(
      ec2.Port.tcp(443),
      "Allow inbound HTTPS from anyone"
    );
    // FIXME: this is hardcoded for us-west-2's Instance Connect range
    app.connections.allowFrom(
      ec2.Peer.ipv4("18.237.140.160/29"),
      ec2.Port.tcp(22),
      "EC2 Instance Connect"
    );
    db.connections.allowFrom(
      app,
      ec2.Port.tcp(dbPort),
      "Allow database connections from webserver"
    );
    // Permissions needed for bootstrapping in userdata
    db.secret?.grantRead(app.role);
    appSourceBundle.grantRead(app.role);
    appSystemdUnit.grantRead(app.role);

    /* Cognito */
    const syncLambda = new lambda.Function(this, "SyncUsersLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromInline(""), // TODO: write this lambda + bundle properly here
      handler: "handler",
    });
    new cognito.UserPool(this, "CustomerPool", {
      userPoolName: "customer-userpool",
      signInCaseSensitive: false, // recommended in AWS docs
      selfSignUpEnabled: true,
      // userVerification: TODO
      signInAliases: {
        username: true,
        email: true,
      },
      lambdaTriggers: {
        postConfirmation: syncLambda,
      },
    });
  }
}
