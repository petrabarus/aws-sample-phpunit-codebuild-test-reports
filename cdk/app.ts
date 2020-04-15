#!/usr/bin/env node
/*********************************
 * AWS CDK script to provision the resources.
 */

import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipelineActions = require('@aws-cdk/aws-codepipeline-actions');
import ssm = require("@aws-cdk/aws-ssm");

class AppStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        new Pipeline(this, 'Pipeline');
    }
}

class Pipeline extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);
        this.createPipeline();
    }

    private createPipeline() {
        const sourceOutput = new codepipeline.Artifact();
        const buildOutput = new codepipeline.Artifact();
        new codepipeline.Pipeline(this, 'Pipeline', {
            stages: [
                this.createSourceStage('Source', sourceOutput),
                this.createTestStage('Build', sourceOutput, buildOutput),
            ]
        });
    }

    private createSourceStage(stageName: string, output: codepipeline.Artifact): codepipeline.StageProps {
        const prefix = '/repos/aws-sample-phpunit-codebuild-test-reports';
        const secret = cdk.SecretValue.secretsManager(prefix + '/GITHUB_OAUTH_TOKEN');
        const repo = ssm.StringParameter.valueForStringParameter(this, prefix + '/GITHUB_REPO');
        const owner = ssm.StringParameter.valueForStringParameter(this, prefix + '/GITHUB_OWNER');
        const githubAction = new codepipelineActions.GitHubSourceAction({
            actionName: 'Github_Source',
            owner: owner,
            repo: repo,
            oauthToken: secret,
            output: output,
        });
        return {
            stageName: stageName,
            actions: [githubAction],
        };
    }

    private createTestStage(
        stageName: string,
        input: codepipeline.Artifact,
        output: codepipeline.Artifact): codepipeline.StageProps {
        const props = {
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
                privileged: true,
            },
        };
        const project = new codebuild.PipelineProject(this, 'Project', props);
        const concat = new cdk.StringConcat();
        //"arn:aws:codebuild:your-region:your-aws-account-id:report-group/my-project-*";
        const reportArn = cdk.Arn.format({
            partition: 'aws',
            service: 'codebuild',
            resource: `report-group/${project.projectName}-*`
        }, cdk.Stack.of(this));
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
        const codebuildAction = new codepipelineActions.CodeBuildAction({
            actionName: 'CodeBuild_Action',
            input: input,
            outputs: [output],
            project: project,
            
        });

        return {
            stageName: stageName,
            actions: [codebuildAction],
        };
    }
}

const app = new cdk.App();
new AppStack(app, 'PHPUnitCodeBuildStack');
app.synth();