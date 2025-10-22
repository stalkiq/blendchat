import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export interface AuthStackProps extends StackProps {
  readonly domainPrefix?: string; // e.g. chatstalkiq
  readonly callbackUrls: string[]; // e.g. https://chatstalkiq.com, https://www.chatstalkiq.com
  readonly logoutUrls: string[];
  readonly googleClientId?: string;
  readonly googleClientSecret?: string;
}

export class AuthStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain?: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: { 
        email: { required: true, mutable: false },
        fullname: { required: false, mutable: true },
        profilePicture: { required: false, mutable: true },
      },
      passwordPolicy: { minLength: 8, requireLowercase: true, requireUppercase: true, requireDigits: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    // Add Google as an identity provider if credentials are provided
    if (props.googleClientId && props.googleClientSecret) {
      const googleProvider = new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
        userPool: this.userPool,
        clientId: props.googleClientId,
        clientSecretValue: props.googleClientSecret,
        scopes: ['profile', 'email', 'openid'],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          fullname: cognito.ProviderAttribute.GOOGLE_NAME,
          profilePicture: cognito.ProviderAttribute.GOOGLE_PICTURE,
        },
      });

      this.userPoolClient = this.userPool.addClient('WebClient', {
        authFlows: { userSrp: true },
        oAuth: {
          flows: { authorizationCodeGrant: true, implicitCodeGrant: true },
          scopes: [
            cognito.OAuthScope.EMAIL,
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.PROFILE,
          ],
          callbackUrls: props.callbackUrls,
          logoutUrls: props.logoutUrls,
        },
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.GOOGLE,
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
        preventUserExistenceErrors: true,
        generateSecret: false,
      });

      // Must add dependency so the client is created after the provider
      this.userPoolClient.node.addDependency(googleProvider);
    } else {
      this.userPoolClient = this.userPool.addClient('WebClient', {
        authFlows: { userSrp: true },
        oAuth: {
          flows: { authorizationCodeGrant: true },
          callbackUrls: props.callbackUrls,
          logoutUrls: props.logoutUrls,
        },
        preventUserExistenceErrors: true,
        generateSecret: false,
      });
    }

    if (props.domainPrefix) {
      this.userPoolDomain = this.userPool.addDomain('HostedDomain', {
        cognitoDomain: { domainPrefix: props.domainPrefix },
      });
    }

    new CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
    if (this.userPoolDomain) {
      new CfnOutput(this, 'UserPoolDomain', { value: `${props.domainPrefix}.auth.${this.region}.amazoncognito.com` });
    }
  }
}

