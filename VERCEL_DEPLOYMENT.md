# Vercel Deployment Guide for Optedu AI Tutor

This guide will help you deploy your Optedu AI Tutor application to Vercel with 24/7 functionality.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **OpenAI API Key**: Get one from [OpenAI](https://platform.openai.com)
4. **Stripe Account**: For payment processing (optional)
5. **Vercel KV Database**: For data persistence

## Step 1: Set up Vercel KV Database

1. Go to your Vercel dashboard
2. Navigate to the "Storage" tab
3. Create a new "KV" database
4. Note down the connection details

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts to link to your GitHub repository
```

### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Vite project

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add:

### Required Variables:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Vercel KV Variables (Auto-generated):
```
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token
```

### Optional Variables (for Stripe payments):
```
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_PRO_PRICE_ID=your_stripe_price_id
```

## Step 4: Update Frontend Environment Variables

Create a `.env.local` file in your project root for local development:

```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_PRO_PRICE_ID=your_stripe_price_id
```

## Step 5: Database Migration

The application now uses Vercel KV instead of SQLite. All data will be automatically migrated when users start using the new version.

## Step 6: Test Your Deployment

1. Visit your deployed URL
2. Test the following features:
   - User registration/login
   - Study plan creation
   - Chat functionality
   - File uploads
   - Web scraping
   - Generated content (flashcards, summaries, reviews)

## Architecture Overview

### Frontend (Vercel Static Hosting)
- React + Vite application
- Served from Vercel's CDN
- Automatic HTTPS and global distribution

### Backend (Vercel Serverless Functions)
- All API endpoints in `/api` directory
- Automatic scaling based on demand
- 24/7 availability with no server management

### Database (Vercel KV)
- Redis-based key-value store
- Persistent data storage
- Global replication for low latency

## API Endpoints

All endpoints are now serverless functions:

- `POST /api/chat` - AI chat functionality
- `POST /api/generate-plan-with-sources` - Study plan generation
- `POST /api/upload-file` - File upload and processing
- `POST /api/scrape-url` - Web content scraping
- `POST /api/create-checkout-session` - Stripe payment processing
- `GET /api/messages/:userId/:studyPlanId` - Get chat messages
- `DELETE /api/messages/:userId/:studyPlanId` - Delete chat messages
- `POST /api/generated-content` - Save generated content
- `GET /api/generated-content/:userId/:studyPlanId` - Get generated content
- `DELETE /api/generated-content/:contentId/:userId` - Delete generated content
- `POST /api/study-plan` - Save study plan
- `GET /api/study-plan/:planId/:userId` - Get study plan
- `DELETE /api/study-plan/:planId/:userId` - Delete study plan
- `GET /api/study-plans/count/:userId` - Get user's study plans count
- `GET /api/messages/count/:userId/:studyPlanId` - Get message count

## Benefits of This Setup

1. **24/7 Availability**: Serverless functions are always available
2. **Automatic Scaling**: Handles traffic spikes automatically
3. **Global Performance**: CDN distribution for fast loading
4. **No Server Management**: Vercel handles all infrastructure
5. **Cost Effective**: Pay only for what you use
6. **Easy Deployment**: Git-based deployments with previews

## Monitoring and Analytics

- Vercel provides built-in analytics
- Monitor function performance in the Vercel dashboard
- Set up alerts for errors and performance issues

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Working**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding new variables

2. **Database Connection Issues**
   - Verify Vercel KV credentials
   - Check if KV database is properly linked to project

3. **Function Timeouts**
   - Check function timeout settings in vercel.json
   - Optimize function performance

4. **CORS Issues**
   - All API functions include CORS headers
   - Check if frontend URL is correct

## Support

For issues specific to this deployment:
1. Check Vercel function logs in the dashboard
2. Verify environment variables are set correctly
3. Test API endpoints individually
4. Check Vercel KV database connectivity

Your app is now ready for 24/7 production use on Vercel! 🚀


