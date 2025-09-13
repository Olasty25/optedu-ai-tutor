# Environment Variables Setup

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

### 1. OpenAI API Key
- **Variable Name**: `OPENAI_API_KEY`
- **Value**: Your OpenAI API key (starts with `sk-`)
- **Required**: Yes

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the variables listed above
5. Make sure to set them for Production, Preview, and Development environments

## Local Development

For local development, create a `.env.local` file in your project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## API Endpoints

After deployment, your API will be available at:
- Production: `https://your-app-name.vercel.app/api`
- Local: `http://localhost:3000/api`

Make sure to update your frontend code to use the production API URL when deployed.
