# cdk

This package manages our AWS deployment in code. This allows us to do code review
for infrastructure changes. Read more about the AWS CDK [here](https://aws.amazon.com/cdk/).

## Useful commands

- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Setup

### Prerequisites
- A domain name with `api2` and `auth2` registered as subdomains. You can get
  a free domain name through services like [Duck DNS](https://www.duckdns.org/).
  It doesn't have to be a nice domain name; these domains are just used by the backend
  and mobile app, and are never visible to users.
- Grab the Expo access token from our Expo project
- Grab the OAuth2 client secret from the `eyespy-login` Google Cloud project
- Copy `config/index.example.ts` to `config/index.ts` and enter your configuration
  details there

The [Getting Started](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
guide in the AWS docs covers pretty much everything. There are a few things to keep
in mind when deploying:

- Bootstrapping is only needed when you deploy for the first time (probably during project handoff)
- Due to free tier limitations and how Cognito works, our stack only deploys to `us-east-1`
- We don't have something like `lerna` set up yet, so make sure to build
  the `backend` and `sync-user-lambda` packages before deploying!
- Database setup isn't automated yet, so you'll need to create the `usersync` user [with IAM login](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.DBAccounts.html)
  manually, run the init scripts in `server/database/init` (you can use EC2 instance connect to
  connect to the database), and grant `usersync` permissions to insert data into the `user` table
  we create
- Use the generated `CDKDeployer` user for deployments rather than your root account
- Consider [enabling console access](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_passwords_admin-change-user.html)
  for the `Dev` user to enable log access for everyone on the team
