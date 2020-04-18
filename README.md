# AWS Sample for Showing PHP Unit Test Reports in CodeBuild

This repo contains sample PHP project that will use Test Report feature in CodeBuild to show PHPUnit execution results.

## Running Locally

To run locally, execute following

```bash
docker build -t phpunit-codebuild-test-reports .
docker run phpunit-codebuild-test-reports ./vendor/bin/phpunit
```

## Running on Cloud

To deploy in AWS, first you need to set the **Github OAuth token** in Secret Manager with name `GITHUB_OAUTH_TOKEN` 
and **username** and **repo name** in the Parameter Store with names `GITHUB_REPO` and `GITHUB_OWNER` respectively.

After you store it, execute following with permission to create resources.

```bash
cdk deploy
```

## Clean Up

To avoid additional cost, you may want to clean up the resources by executing the following code.

```bash
cdk destroy
```
