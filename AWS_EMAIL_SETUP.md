# AWS Email Integration Setup Guide

This guide will help you set up the AWS infrastructure to enable **email-to-chat** functionality in BlendChat.

## 🎯 What This Does

Once set up, each chat gets a unique email address like `chat-abc123@chatbudi.com`. Anyone can email that address and their message will appear in the chat instantly.

---

## 📋 Prerequisites

1. ✅ AWS Account with access to:
   - SES (Simple Email Service)
   - Lambda
   - IAM
2. ✅ Domain `chatbudi.com` already configured in Route 53
3. ✅ AWS CLI configured with credentials
4. ✅ CDK CLI installed (`npm install -g aws-cdk`)

---

## 🚀 Step-by-Step Setup

### Step 1: Verify Domain in SES

**Important**: SES must be configured to receive emails for your domain.

```bash
# Navigate to infrastructure directory
cd infrastructure

# Deploy the email stack (this will create resources but won't activate receiving yet)
npx cdk deploy BlendChatEmailStack
```

**Then, in AWS Console:**

1. Go to **Amazon SES** → **Verified identities**
2. Click **"Create identity"**
3. Select **"Domain"**
4. Enter: `chatbudi.com`
5. Check **"Assign a default configuration set"** (optional)
6. Click **"Create identity"**

**Add DNS Records:**
SES will provide DNS records (TXT, CNAME, MX). Add these to Route 53:

```bash
# The CDK output will show the required MX record
# You need to add it to Route 53 manually or via CDK
```

**Verify Status:**
- Wait 10-15 minutes for DNS propagation
- Check SES console until status shows **"Verified"**

---

### Step 2: Move SES Out of Sandbox Mode

By default, SES is in sandbox mode (can only send/receive to verified emails).

**To move to production:**

1. Go to **SES** → **Account dashboard**
2. Click **"Request production access"**
3. Fill out the form:
   - **Use case**: Transactional
   - **Website URL**: https://chatbudi.com
   - **Describe how you'll use SES**: "Receive emails for group chat invitations. Users can email chat rooms to participate."
4. Submit and wait for approval (usually 24 hours)

---

### Step 3: Activate SES Receipt Rule Set

After domain verification:

```bash
# Get the rule set name from CDK output
aws ses set-active-receipt-rule-set --rule-set-name blendchat-email-rules --region us-east-1
```

Or via AWS Console:
1. Go to **SES** → **Email receiving** → **Rule sets**
2. Find `blendchat-email-rules`
3. Click **"Set as active"**

---

### Step 4: Add MX Record to Route 53

Add an MX record for email receiving:

```bash
# Replace Z02161133F7WAYTLBWS3K with your hosted zone ID
aws route53 change-resource-record-sets --hosted-zone-id Z02161133F7WAYTLBWS3K --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "chatbudi.com",
      "Type": "MX",
      "TTL": 300,
      "ResourceRecords": [{"Value": "10 inbound-smtp.us-east-1.amazonaws.com"}]
    }
  }]
}'
```

---

### Step 5: Set Lambda Secret Key

Generate and set the secret key for Lambda authentication:

```bash
# Generate a secure key
export LAMBDA_SECRET_KEY=$(openssl rand -hex 32)
echo $LAMBDA_SECRET_KEY

# Add to .env file
echo "LAMBDA_SECRET_KEY=$LAMBDA_SECRET_KEY" >> .env
```

**For Amplify (Production):**
1. Go to **AWS Amplify Console**
2. Select your app → **Environment variables**
3. Add:
   - Key: `LAMBDA_SECRET_KEY`
   - Value: `[the generated key]`
4. Redeploy your app

---

### Step 6: Test the Setup

1. **Create a test chat** at https://chatbudi.com
2. **Note the chat email** shown at the top (e.g., `chat-abc123@chatbudi.com`)
3. **Send a test email** to that address from your verified email
4. **Check the chat** - your email should appear as a message!

---

## 🔧 Troubleshooting

### Emails Not Showing Up

1. **Check CloudWatch Logs**:
   ```bash
   aws logs tail /aws/lambda/BlendChatEmailStack-EmailReceiver --follow
   ```

2. **Verify SES is receiving**:
   - Go to SES → Email receiving → Rule sets
   - Check if rule is active and has actions

3. **Check Lambda permissions**:
   - Lambda must have permission to be invoked by SES
   - Check IAM role attached to Lambda

### "Domain Not Verified" Error

- DNS records may not have propagated yet
- Wait 15-30 minutes and check again
- Verify DNS records in Route 53 match SES requirements

### Lambda Timeout

- Increase Lambda timeout in `email-stack.ts`:
  ```typescript
  timeout: Duration.seconds(60), // Increase from 30
  ```

---

## 🎨 How It Works

```
┌─────────────────────────────────────────────────────────┐
│ User sends email to: chat-abc123@chatbudi.com          │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Amazon SES receives email                               │
│ - Checks MX record                                      │
│ - Matches receipt rule: chat-*@chatbudi.com            │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Triggers Lambda Function                                │
│ - Parses email content                                  │
│ - Extracts: chatId, sender, message                     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Calls API: POST /api/chat/{chatId}/email               │
│ - With Lambda secret key                                │
│ - Adds message to chat                                  │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Message appears in chat                                 │
│ - Visible to all participants                           │
│ - GPT can respond if enabled                            │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Estimate

- **SES**: $0.10 per 1,000 emails (first 1,000/month free)
- **Lambda**: $0.20 per 1M requests (first 1M/month free)
- **Data transfer**: Minimal

**Expected monthly cost for 1,000 chats**: < $1

---

## 🔒 Security

- ✅ TLS required for incoming emails
- ✅ Lambda authenticated with secret key
- ✅ Only emails matching `chat-*@chatbudi.com` are processed
- ✅ Spam/virus scanning enabled in SES

---

## 📝 Next Steps

Once this is working:
1. Add real-time updates (WebSocket) for instant message delivery
2. Store chat history in DynamoDB for persistence
3. Add email reply threading
4. Support attachments (store in S3)

---

## 🆘 Need Help?

- Check CloudWatch Logs: `/aws/lambda/BlendChatEmailStack-EmailReceiver`
- SES Metrics: SES Console → Account dashboard → Sending statistics
- Test SES receiving: Send email to mailbox-simulator@example.com

---

**Ready to deploy?**
```bash
cd infrastructure
npx cdk deploy BlendChatEmailStack
```

