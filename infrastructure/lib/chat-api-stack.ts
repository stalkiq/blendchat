import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';

export interface ChatApiStackProps extends StackProps {
  table: dynamodb.ITable;
  bucket: s3.IBucket;
}

export class ChatApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ChatApiStackProps) {
    super(scope, id, props);

    const openAiSecret = new secrets.Secret(this, 'OpenAIKey');

    const chatHandler = new lambda.Function(this, 'ChatHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/chat'),
      timeout: Duration.seconds(29),
      environment: {
        OPENAI_API_KEY: openAiSecret.secretValue.unsafeUnwrap().toString(),
        OPENAI_MODEL: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        TABLE_NAME: props.table.tableName,
        BUCKET_NAME: props.bucket.bucketName,
      },
    });

    props.table.grantReadWriteData(chatHandler);
    props.bucket.grantReadWrite(chatHandler);
    openAiSecret.grantRead(chatHandler);

    const httpApi = new apigwv2.HttpApi(this, 'ChatApi', {
      apiName: 'blendchat-chat-api',
      corsPreflight: {
        allowHeaders: ['content-type', 'authorization'],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowOrigins: ['https://chatbudi.com', 'https://www.chatbudi.com', 'http://localhost:9002'],
      },
    });

    httpApi.addRoutes({
      path: '/chat',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('ChatIntegration', chatHandler),
    });

    new CfnOutput(this, 'HttpApiUrl', { value: httpApi.apiEndpoint });
    new CfnOutput(this, 'OpenAISecretName', { value: openAiSecret.secretName });
  }
}

