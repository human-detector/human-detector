#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";
import config from "../config";

const app = new cdk.App();
new CdkStack(app, "CdkStack", config, {
  // Using a custom domain with Cognito's hosted UI requires deploying your
  // ACM certificate to 'us-east-1' (see https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-add-custom-domain.html)
  // and cross-region referencing is painful without using Route53 or hacks (https://github.com/aws/aws-cdk/issues/9274),
  // so let's just deploy to 'us-east-1'
  env: { region: "us-east-1" },
});
