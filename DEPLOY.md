# Deploy

## Prereqs
- Node 20
- AWS account with Route53 hosted zone for chatstalkiq.com
- GitHub repo connected

## One-time OIDC CDK Role
1. Create an IAM role (replace placeholders):
```bash
ACCOUNT_ID=<account-id>
ROLE_NAME=GithubCdkDeployRole
cat > trust.json <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<owner>/<repo>:ref:refs/heads/main"
        },
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
JSON
cat > policy.json <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {"Effect":"Allow","Action":[
      "cloudformation:*","iam:PassRole","ssm:*","secretsmanager:*","lambda:*","apigateway:*","dynamodb:*","s3:*","route53:*","acm:*","events:*"
    ],"Resource":"*"}
  ]
}
JSON
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust.json
aws iam put-role-policy --role-name $ROLE_NAME --policy-name CdkInline --policy-document file://policy.json
```
2. Put the role ARN into GitHub Secrets as `AWS_CDK_ROLE_ARN` and add `OPENAI_API_KEY`.

## CI/CD
- CI runs on PRs and main: typecheck, build, `cdk synth`.
- Deploy workflow deploys stacks from `infrastructure/` on push to main.

## Local deploy (optional)
```bash
cd infrastructure
npm ci && npm run build && npm run bootstrap
OPENAI_API_KEY=sk-... npm run deploy
```

## App env vars
- Amplify Hosting: set `CHAT_API_URL` to the output HttpApiUrl

