#!/usr/bin/env node
/*********************************
 * AWS CDK script to provision the resources.
 */

import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import codebuild = require('@aws-cdk/aws-codebuild');
import iam = require('@aws-cdk/aws-iam');
import ssm = require("@aws-cdk/aws-ssm");

class AppStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.createBuild();
    }

    createBuild() {
        const source = this.createSource();
        const project = this.createProject(source);

        this.addTestReportPermissionToProject(project);
    }

    createSource(): codebuild.Source {
        const secret = cdk.SecretValue.secretsManager('GITHUB_OAUTH_TOKEN');
        new codebuild.GitHubSourceCredentials(this, 'GithubCredentials', {
            accessToken: secret,
        })
        const repo = ssm.StringParameter.valueForStringParameter(this, 'GITHUB_REPO');
        const owner = ssm.StringParameter.valueForStringParameter(this, 'GITHUB_OWNER');
        const source = codebuild.Source.gitHub({
            owner: owner,
            repo: repo,
            webhook: true,
            webhookFilters: [
                codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('master'),
            ]
        });

        return source;
    }

    createProject(source: codebuild.Source): codebuild.Project {
        return new codebuild.Project(this, 'Build', {
            source: source,
        });
    }

    addTestReportPermissionToProject(project: codebuild.IProject) {
        //"arn:aws:codebuild:your-region:your-aws-account-id:report-group/my-project-*";
        const pattern = {
            partition: 'aws',
            service: 'codebuild',
            resource: `report-group/${project.projectName}-*`
        };
        const reportArn = cdk.Arn.format(pattern, cdk.Stack.of(this));

        project.addToRolePolicy(new iam.PolicyStatement({
            resources: [
                reportArn,
            ],
            effect: iam.Effect.ALLOW,
            actions: [
                "codebuild:CreateReportGroup",
                "codebuild:CreateReport",
                "codebuild:UpdateReport",
                "codebuild:BatchPutTestCases"
            ]
        }));
    }
}

const app = new cdk.App();
new AppStack(app, 'PHPUnitCodeBuildStack');
app.synth();
