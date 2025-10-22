# 🔐 Google OAuth Setup for BlendChat

Follow these steps to enable Google sign-in for your BlendChat application.

## 📋 Prerequisites

- Google Cloud Platform account
- AWS account with Cognito access
- BlendChat infrastructure deployed

---

## 🚀 Quick Setup Steps

### 1️⃣ Create Google OAuth Credentials

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create or select a project**

3. **Navigate to**: APIs & Services → Credentials

4. **Click**: Create Credentials → OAuth 2.0 Client IDs

5. **Configure OAuth consent screen** (if first time):
   - User Type: **External**
   - App name: **BlendChat**
   - User support email: `your-email@example.com`
   - Add scopes: `email`, `profile`, `openid`
   - Test users: Add your email for testing

6. **Create OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Name: **BlendChat**
   
   **Authorized JavaScript origins**:
   ```
   http://localhost:9002
   https://chatbudi.com
   https://www.chatbudi.com
   ```
   
   **Authorized redirect URIs**:
   ```
   http://localhost:9002
   https://chatbudi.com
   https://www.chatbudi.com
   https://chatstalkiq.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   ```

7. **Copy** your Client ID and Client Secret

---

### 2️⃣ Set Up Infrastructure Environment Variables

Create `infrastructure/.env`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

### 3️⃣ Deploy Updated Auth Stack

```bash
cd infrastructure
npm install
npx cdk deploy BlendChatAuthStack
```

**Note the outputs**:
- UserPoolId
- UserPoolClientId  
- UserPoolDomain

---

### 4️⃣ Configure Next.js App

Create `.env.local` in the root directory:

```bash
NEXT_PUBLIC_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_DOMAIN=chatstalkiq.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_SITE_URL=http://localhost:9002
```

Replace the values with the outputs from step 3.

---

### 5️⃣ Configure Amplify Environment Variables

1. Go to **AWS Amplify Console**
2. Select **blendchat** app
3. Navigate to: **App settings** → **Environment variables**
4. Add these variables:

```
NEXT_PUBLIC_USER_POOL_ID = <from CDK output>
NEXT_PUBLIC_USER_POOL_CLIENT_ID = <from CDK output>
NEXT_PUBLIC_COGNITO_DOMAIN = chatstalkiq.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_SITE_URL = https://www.chatbudi.com
```

5. **Trigger a new deployment** (App settings → Build settings → Redeploy)

---

### 6️⃣ Test Locally

```bash
npm run dev
```

1. Open `http://localhost:9002`
2. Click **"Start now"**
3. You should be redirected to sign in with Google
4. After signing in, you'll be redirected back to `/chat`

---

## ✅ Verification Checklist

- [ ] Google OAuth credentials created
- [ ] Authorized redirect URIs include Cognito callback URL
- [ ] Infrastructure `.env` file created with Google credentials
- [ ] CDK AuthStack deployed successfully
- [ ] Next.js `.env.local` created with Cognito details
- [ ] Amplify environment variables configured
- [ ] Local testing successful
- [ ] Production deployment working

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match Google Cloud Console settings.

**Solution**: 
1. Check Google Console → Credentials → OAuth 2.0 Client IDs
2. Ensure `https://chatstalkiq.auth.us-east-1.amazoncognito.com/oauth2/idpresponse` is in Authorized redirect URIs
3. Remove any trailing slashes

---

### Error: "Invalid client"

**Problem**: Google Client ID/Secret incorrect or CDK deployment failed.

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `infrastructure/.env`
2. Re-deploy: `cd infrastructure && npx cdk deploy BlendChatAuthStack`
3. Check AWS Console → Cognito → User Pools → Identity providers

---

### User not authenticated after redirect

**Problem**: Environment variables not set correctly in Next.js app.

**Solution**:
1. Check `.env.local` file exists and has correct values
2. Restart dev server: `npm run dev`
3. Clear browser cache and cookies
4. Check browser console for errors

---

### Can't see "Sign in with Google" button

**Problem**: Cognito not configured properly or environment variables missing.

**Solution**:
1. Verify all `NEXT_PUBLIC_*` variables are set
2. Check Cognito User Pool → App integration → Identity providers → Google is enabled
3. Verify Cognito domain is configured

---

## 🔒 Security Notes

- **Never commit** `.env` or `.env.local` files to version control
- Keep your Google Client Secret secure
- Use different OAuth credentials for development and production
- Regularly rotate secrets
- Enable 2FA on your Google Cloud account

---

## 📚 Additional Resources

- [AWS Cognito + Google OAuth](https://docs.aws.amazon.com/cognito/latest/developerguide/google.html)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [AWS Amplify Authentication](https://docs.amplify.aws/javascript/build-a-backend/auth/)

---

## 💡 What's Next?

After Google OAuth is working:

1. ✨ Customize the Cognito Hosted UI (add your logo, colors)
2. 🔐 Add more identity providers (Facebook, Apple, GitHub)
3. 👤 Implement user profile management
4. 🛡️ Add role-based access control (RBAC)
5. 📧 Set up email verification and password reset flows

---

**Need help?** Check the [main README](./README.md) or create an issue in the repository.

