# 🚀 SIMPLE 24/7 Backend Setup - 3 Steps Only!

## Step 1: Get OpenAI API Key (2 minutes)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/Login
3. Go to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

## Step 2: Set Environment Variables in Vercel (3 minutes)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project → "Settings" → "Environment Variables"
3. Add these 2 variables:

**Variable 1:**
- Name: `OPENAI_API_KEY`
- Value: `sk-your-key-here` (paste from step 1)
- Check: Production, Preview, Development

**Variable 2:**
- Name: `NODE_ENV`
- Value: `production`
- Check: Production, Preview, Development

## Step 3: Redeploy (1 minute)
1. Go to "Deployments" tab
2. Click "Redeploy" on latest deployment
3. Wait 2 minutes

## ✅ DONE! Your backend is now 24/7!

### Test it works:
- Visit: `https://your-app.vercel.app/api/test`
- Should show: `{"message":"Backend is working!"}`

### What works without database:
- ✅ AI Chat (`/api/chat`)
- ✅ Study Plan Generation (`/api/generate-plan-with-sources`)
- ✅ File Upload (`/api/upload-file`)
- ✅ Web Scraping (`/api/scrape-url`)
- ✅ Health Check (`/api/health`)

### What needs database (optional):
- ❌ Saving study plans (will work locally only)
- ❌ Saving chat history (will work locally only)
- ❌ Saving generated content (will work locally only)

**The app will work perfectly for AI features, just won't save data between sessions!**
