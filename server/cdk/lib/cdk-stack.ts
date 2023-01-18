import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as codedeploy from "aws-cdk-lib/aws-codedeploy";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TODO: figure out how the webapp is going to be deployed to EC2 (manual? bundle here and upload at deploy-time?)
    //       Solution: might need to push to S3 anyways for database endpoint, so maybe push bundled code as well?
    // TODO: figure out how the webapp is going to refer to the DB by hostname (if it even can) (db.dbInstanceEndpointAddress gives IP!)
    //       Solution: push endpoint to S3 bucket, pull during userdata init script in EC2 instance?
    //       Better solution: Make the database it's own Cloudformation Stack, output the database endpoint (CfnOutput), import in app stack?
    // TODO: setup cognito (user pools, clients, domain names etc.)
    // TODO: write sync-user lambda
    // TODO: add simple API gateway routes directed at EC2 instance

    const vpc = new ec2.Vpc(this, "Vpc", {
      natGateways: 0, // NAT Gateways are billed by the hour, so we don't want any
    });

    // Deployment assets needed on app instance creation. There's probably a
    // better way to do this that I'm not seeing right now.
    const appDeployAssets = new s3.Bucket(this, "AppDeployAssets");

    const appDeployment = new codedeploy.ServerApplication(
      this,
      "AppDeployment",
      {}
    );

    /* App webserver */
    const app = new ec2.Instance(this, "AppServer", {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
    });
    app.connections.allowFromAnyIpv4(
      ec2.Port.tcp(443),
      "Allow inbound HTTPS from anyone"
    );

    /* Database */
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
    db.connections.allowFrom(
      app,
      ec2.Port.tcp(dbPort),
      "Allow database connections from webserver"
    );

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
