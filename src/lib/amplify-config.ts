import { ResourcesConfig } from 'aws-amplify';

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
          scopes: ['email', 'profile', 'openid'],
          redirectSignIn: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'],
          redirectSignOut: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'],
          responseType: 'code',
        },
      },
    },
  },
};

