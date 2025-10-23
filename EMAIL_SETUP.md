# Email Invitation Setup

BlendChat uses email invitations to notify participants when they're added to a group chat. Here's how to set it up with different email services.

## Current Status

Currently, email invitations are **logged to the console** for development. To enable actual email sending, follow one of the integration options below.

## Option 1: Resend (Recommended)

[Resend](https://resend.com) is a modern email API that's easy to set up.

### Setup Steps:

1. **Create a Resend account** at https://resend.com
2. **Add and verify your domain** (or use their testing domain)
3. **Get your API key** from the dashboard
4. **Install Resend SDK:**
   ```bash
   npm install resend
   ```

5. **Add environment variable** to `.env.local`:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

6. **Update `/src/app/api/chat/create/route.ts`:**
   Uncomment the Resend code block and remove the console.log statements:
   
   ```typescript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   await Promise.all(
     emails.map(email =>
       resend.emails.send({
         from: 'BlendChat <noreply@chatbudi.com>',
         to: email,
         subject: `${creatorName} invited you to a group chat`,
         html: `
           <h2>You've been invited to a group chat!</h2>
           <p>${creatorName} (${creatorEmail}) invited you to join a conversation.</p>
           <p><strong>First message:</strong> "${firstMessage.substring(0, 200)}..."</p>
           <p><a href="${chatUrl}">Join the conversation →</a></p>
         `,
       })
     )
   );
   ```

## Option 2: SendGrid

### Setup Steps:

1. **Create a SendGrid account** at https://sendgrid.com
2. **Verify your domain** and create an API key
3. **Install SendGrid SDK:**
   ```bash
   npm install @sendgrid/mail
   ```

4. **Add environment variable:**
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   ```

5. **Update the sendInvitations function:**
   ```typescript
   import sgMail from '@sendgrid/mail';
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
   
   await Promise.all(
     emails.map(email =>
       sgMail.send({
         to: email,
         from: 'noreply@chatbudi.com',
         subject: `${creatorName} invited you to a group chat`,
         html: `...`,
       })
     )
   );
   ```

## Option 3: AWS SES

### Setup Steps:

1. **Set up AWS SES** and verify your domain
2. **Install AWS SDK:**
   ```bash
   npm install @aws-sdk/client-ses
   ```

3. **Add environment variables:**
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

4. **Update the sendInvitations function:**
   ```typescript
   import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
   const ses = new SESClient({ region: process.env.AWS_REGION });
   
   // Implementation here
   ```

## Testing Emails Locally

For local development, you can use:
- **Resend's testing domain** (no domain verification needed)
- **Mailhog** (local SMTP server)
- **Console logging** (current default)

## Email Template Customization

The email template is in `/src/app/api/chat/create/route.ts` in the `sendInvitations` function. You can customize:
- Subject line
- HTML content
- From address
- Reply-to address

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://chatbudi.com

# Email service (choose one)
RESEND_API_KEY=re_xxxxx
# OR
SENDGRID_API_KEY=SG.xxxxx
# OR
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
```

## Production Deployment

For Amplify deployment, add environment variables in the AWS Amplify Console:
1. Go to your app in Amplify Console
2. Click "Environment variables" in the left sidebar
3. Add the required variables
4. Redeploy your app

## Notes

- Email invitations are sent when a chat is created
- Links expire when the server restarts (ephemeral chat design)
- No emails are stored in the database
- Rate limits apply based on your email service plan

