# BlendChat – Dev and Deploy

This is a Next.js app. You can run locally and deploy to AWS Amplify Hosting for backend (SSR/server actions) and static hosting.

## Local development

1. Install deps: `npm ci`
2. Run: `npm run dev` → http://localhost:9002
3. To use AI features, set an API key in your shell before starting:
   - `export GEMINI_API_KEY=YOUR_KEY` (or `GOOGLE_API_KEY`)

## Deploy to AWS Amplify Hosting

We include an `amplify.yml` for consistent builds.

1. In AWS Console → Amplify → Hosting → New app → Host a web app
2. Connect your Git provider and select this repo/branch
3. Environment variables (required):
   - `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)
   - `NODE_ENV=production`
   - `AMPLIFY_NODEJS_VERSION=20` (ensures Node 20 for Next.js 15)
4. Build settings: accept defaults (Amplify auto-detects Next.js). The provided `amplify.yml` runs `npm ci` and `npm run build`.
5. Deploy. After build, open the Amplify domain and visit `/chat`.

### Troubleshooting

- 500 on `/chat`: Ensure `GEMINI_API_KEY` is set in Amplify environment variables and redeploy.
- Logs: Amplify → App → Monitoring → View logs (CloudWatch) for SSR/server actions.

## Project layout

See `src/app` for routes and `src/ai` for Genkit flows.
