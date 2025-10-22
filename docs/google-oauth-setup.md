# Google OAuth Setup Guide

This guide will help you set up Google OAuth for BlendChat authentication.

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen if you haven't already:
   - User Type: **External** (or Internal if using Google Workspace)
   - App name: **BlendChat**
   - User support email: Your email
   - Developer contact email: Your email
   - Add scopes: `email`, `profile`, `openid`
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: **BlendChat Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:9002` (for local development)
     - `https://www.chatbudi.com` (for production)
     - `https://chatbudi.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:9002` (for local development)
     - `https://www.chatbudi.com` (for production)
     - `https://chatbudi.com` (for production)
     - `https://chatstalkiq.auth.us-east-1.amazoncognito.com/oauth2/idpresponse` (Cognito callback)

7. Click **Create**
8. Copy your **Client ID** and **Client Secret**

## Step 2: Update AWS CDK Infrastructure

1. Open `infrastructure/bin/blendchat-infra.ts`
2. Update the AuthStack instantiation to include your Google credentials:

```typescript
const auth = new AuthStack(app, 'BlendChatAuthStack', {
  env,
  domainPrefix: 'chatstalkiq',
  callbackUrls: ['https://chatbudi.com', 'https://www.chatbudi.com', 'http://localhost:9002'],
  logoutUrls: ['https://chatbudi.com', 'https://www.chatbudi.com', 'http://localhost:9002'],
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
});
```

3. Create a `.env` file in the `infrastructure` directory:

```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 3: Deploy the Updated Stack

```bash
cd infrastructure
npm install
npm run cdk deploy BlendChatAuthStack
```

After deployment, note the following outputs:
- `UserPoolId`
- `UserPoolClientId`
- `UserPoolDomain`

## Step 4: Update Next.js Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_DOMAIN=chatstalkiq.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_SITE_URL=http://localhost:9002
```

For production (Amplify), add these as environment variables in the Amplify Console:
- Go to **AWS Amplify Console**
- Select your app
- Go to **App settings** > **Environment variables**
- Add the variables above (replace `NEXT_PUBLIC_SITE_URL` with your production URL)

## Step 5: Update Google OAuth Redirect URIs

After deploying, you need to add the Cognito hosted UI callback URL to Google:

1. Go back to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to Authorized redirect URIs:
   - `https://chatstalkiq.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
4. Click **Save**

## Step 6: Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:9002`
3. Click **Start now**
4. You should be redirected to Cognito's hosted UI
5. Click **Continue with Google**
6. Sign in with your Google account
7. You should be redirected back to the app and logged in!

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches the Cognito callback URL
- Check that there are no trailing slashes

### "Invalid client" error
- Verify that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure the CDK stack was deployed successfully

### User not authenticated after redirect
- Check browser console for errors
- Verify environment variables are set correctly
- Make sure the Cognito domain is correct

## Next Steps

- Customize the Cognito hosted UI to match your brand
- Add additional identity providers (Facebook, Apple, etc.)
- Implement user profile management
- Add user roles and permissions

