#!/bin/bash
# Bootstrap this AL2 EC2 instance using assets creating during CDK synthesis

set -eu

### Install stuff ###

# Install Node (https://github.com/nodesource/distributions)
yum update -y
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# Install up-to-date AWS CLI (https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
pushd /tmp
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
popd

# Set up region (needed for secrets and assets I guess)
AWS_REGION=$AWS_REGION
aws configure set region ${AWS_REGION}

# Install jq for processing AWS CLI output
yum install -y jq

### CDK stuff ###

# Inserted state from CDK synthesis
APP_SOURCE_S3_OBJ_URL=$APP_SOURCE_S3_OBJ_URL
APP_SYSTEMD_SERVICE_S3_OBJ_URL=$APP_SYSTEMD_SERVICE_S3_OBJ_URL
APP_DB_PASSWORD_SECRET_ARN=$APP_DB_PASSWORD_SECRET_ARN
# Create EnvironmentFile for systemd service
# FIXME: fetching this and storing stuff in the EnvironmentFile is probably a bad idea
#        (security issues, and secrets can rotate if you enable that)
# For reference, Postgres SecretsManager secrets format
# https://docs.aws.amazon.com/secretsmanager/latest/userguide/reference_secret_json_structure.html#reference_secret_json_structure_rds-postgres
DB_SECRETS_JSON="$(aws secretsmanager get-secret-value --secret-id ${APP_DB_PASSWORD_SECRET_ARN} | jq -r .SecretString)"
cat << EOF > /etc/sysconfig/app
DB_PASSWORD=$(printf ${DB_SECRETS_JSON} | jq -r .password)
$INSERT_ENVIRONMENTFILE_HERE
EOF

### App setup ###

# Fetch assets
aws s3 cp ${APP_SOURCE_S3_OBJ_URL} /tmp/app.zip
aws s3 cp ${APP_SYSTEMD_SERVICE_S3_OBJ_URL} /etc/systemd/system/app.service

# Unpack app
mkdir /usr/src/app
unzip -d /usr/src/app /tmp/app.zip
pushd /usr/src/app
rm -rf node_modules
npm i
popd

# systemd stuff
systemctl daemon-reload
systemctl enable app
systemctl start app
