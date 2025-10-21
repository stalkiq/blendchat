#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ChatApiStack } from '../lib/chat-api-stack';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { DnsStack } from '../lib/dns-stack';

const app = new cdk.App();
const region = 'us-east-1';
const env = { account: '016442247702', region };

const dns = new DnsStack(app, 'BlendChatDnsStack', {
  env,
  domainName: 'chatbudi.com',
  hostedZoneId: 'Z02161133F7WAYTLBWS3K',
});

const auth = new AuthStack(app, 'BlendChatAuthStack', {
  env,
  domainPrefix: 'chatstalkiq',
  callbackUrls: ['https://chatbudi.com', 'https://www.chatbudi.com', 'http://localhost:9002'],
  logoutUrls: ['https://chatbudi.com', 'https://www.chatbudi.com', 'http://localhost:9002'],
});

const data = new DataStack(app, 'BlendChatDataStack', { env });

new ChatApiStack(app, 'BlendChatApiStack', {
  env,
  table: data.table,
  bucket: data.attachmentsBucket,
});

