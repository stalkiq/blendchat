# Architecture

- Frontend: Next.js (SSR) via Amplify Hosting
- Backend: API Gateway (HTTP) + Lambda (Node 20) wrapping OpenAI
- Auth: Amazon Cognito (Hosted UI, auth code grant)
- Data: DynamoDB single-table (pk, sk). S3 for attachments (30-day TTL)
- DNS/TLS: Route 53 hosted zone chatstalkiq.com, ACM cert for apex + www
- CI/CD: GitHub Actions CI and deploy-infra with OIDC CDK role

## Data model
- User: pk=USER#<id>, sk=PROFILE
- Chat: pk=CHAT#<id>, sk=META
- Message: pk=CHAT#<id>, sk=MSG#<timestamp>

## Security
- Least-privilege IAM for Lambda to read/write specific table and bucket
- Secrets in Secrets Manager (OpenAI key)
- CORS limited to prod domains and localhost dev

## Observability
- CloudWatch logs; add dashboards/alarms and X-Ray as next steps

