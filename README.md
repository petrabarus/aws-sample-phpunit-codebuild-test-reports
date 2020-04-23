# AWS Sample for Showing PHP Unit Test Reports in CodeBuild

This repo contains sample PHP project that will use Test Report feature in CodeBuild to show PHPUnit execution results.

## Running Locally

To run locally, execute following command,

```bash
docker build -t phpunit-codebuild-test-reports .
docker run -v ${PWD}:/app phpunit-codebuild-test-reports \
    ./vendor/bin/phpunit
```

## Deploying on Cloud

To deploy in AWS, first you need to set the **Github OAuth token** in Secret Manager with name `GITHUB_OAUTH_TOKEN`. Here is how you [get your Github OAuth token](https://help.github.com/en/github/extending-github/git-automation-with-oauth-tokens#step-1-get-an-oauth-token). Let's say you have token with value `abcdefg1234abcdefg56789abcdefg`. You need execute the following command. Replace the string with your real token.

```bash
aws secretsmanager create-secret \
    --name GITHUB_OAUTH_TOKEN \
    --secret-string abcdefg1234abcdefg56789abcdefg
```

and **username** and **repo name** in the Parameter Store with names `GITHUB_REPO` and `GITHUB_OWNER` respectively.

```bash
aws ssm put-parameter \
    --name GITHUB_OWNER \
    --type String \
    --value owner

aws ssm put-parameter \
    --name GITHUB_REPO \
    --type String \
    --value repo
```

After you store it, execute following with permission to create resources.

```bash
cdk deploy
```

## Clean Up

To avoid additional cost, you may want to clean up the resources by executing the following code.

```bash
cdk destroy
```
