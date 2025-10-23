import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as sesActions from 'aws-cdk-lib/aws-ses-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface EmailStackProps extends StackProps {
  readonly domain: string;
  readonly apiEndpoint: string;
  readonly lambdaSecretKey: string;
}

export class EmailStack extends Stack {
  public readonly emailReceiverFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: EmailStackProps) {
    super(scope, id, props);

    // Create Lambda function to process incoming emails
    this.emailReceiverFunction = new NodejsFunction(this, 'EmailReceiver', {
      entry: 'lambda/email-receiver/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 512,
      environment: {
        API_ENDPOINT: props.apiEndpoint,
        LAMBDA_SECRET_KEY: props.lambdaSecretKey,
      },
      bundling: {
        externalModules: [],
        nodeModules: ['mailparser'],
      },
    });

    // Grant Lambda permission to be invoked by SES
    this.emailReceiverFunction.grantInvoke(
      new iam.ServicePrincipal('ses.amazonaws.com')
    );

    // Create SES receipt rule set
    const ruleSet = new ses.ReceiptRuleSet(this, 'ChatEmailRuleSet', {
      receiptRuleSetName: 'blendchat-email-rules',
    });

    // Create receipt rule for chat emails
    ruleSet.addRule('ChatEmailRule', {
      recipients: [`chat-*@${props.domain}`],
      actions: [
        new sesActions.Lambda({
          function: this.emailReceiverFunction,
          invocationType: sesActions.LambdaInvocationType.EVENT,
        }),
      ],
      enabled: true,
      scanEnabled: true,
      tlsPolicy: ses.TlsPolicy.REQUIRE,
    });

    // Outputs
    new CfnOutput(this, 'EmailReceiverFunctionArn', {
      value: this.emailReceiverFunction.functionArn,
      description: 'ARN of the email receiver Lambda function',
    });

    new CfnOutput(this, 'RuleSetName', {
      value: ruleSet.receiptRuleSetName,
      description: 'SES receipt rule set name',
    });

    new CfnOutput(this, 'EmailPattern', {
      value: `chat-*@${props.domain}`,
      description: 'Email pattern for chat invitations',
    });
  }
}

