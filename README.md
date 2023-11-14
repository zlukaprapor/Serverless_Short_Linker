# This project was created for a test task

## Project Setup

### Prerequisites

1. **Create an AWS Account:**
  - Follow the instructions in this [article](https://repost.aws/knowledge-center/create-and-activate-aws-account).

2. **Create an AWS Admin IAM user:**
  - Refer to the [official documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-set-up.html#create-an-admin).

3. **Install and Configure AWS CLI:**
  - Install AWS CLI by following the steps [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
  - Configure AWS CLI using [this guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html#cli-configure-quickstart-config). You'll need the AWS Access Key ID and Secret Key obtained during IAM user creation.

4. **Install Node.js:**
  - Download the latest version from [nodejs.org/en](https://nodejs.org/en).

5. **Install Serverless Framework:**
  - Install Serverless Framework globally with npm:

   
    npm install -g serverless
   

### Installation

Run:


npm install

### Deployment

Run:

serverless deploy


Note: For email notifications about deactivation to be sent, 
create a secret in SecretManager named "EMAIL_FROM" with the 
email value from which letters will be sent. After deployment, 
you will receive a notification to the provided email from 
Amazon to verify identity.

### Endpoints

| Endpoint              | Description                     |
| --------------------- | ------------------------------- |
| POST /auth/signup     | register new user               |
| POST /auth/signin     | login user                      |
| POST /link            | create short link (protected\*) |
| GET /links            | list links (protected\*)        |
| POST /link/deactivate | deactivate link (protected\*)   |
| GET /{shortAlias}     | redirect to link by shortAlias  |

protected\*: in Headers

- authorizationToken - Bearer \\token\\

### SwaggerHub

[Short Linker API](https://app.swaggerhub.com/apis-docs/PashokSy/shot-linker-api/1.0.0#/)

