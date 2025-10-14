# Complete Vercel Deployment Guide

This guide will help you deploy your Optedu AI Tutor to Vercel with a fully working backend.

## What Was Fixed

Your backend has been updated to work on Vercel's serverless platform:

1. ✅ **Removed better-sqlite3** (not compatible with serverless)
2. ✅ **Added Vercel KV** (Redis-based database for serverless)
3. ✅ **Updated all database functions** to work asynchronously
4. ✅ **Fixed vercel.json** configuration
5. ✅ **Configured API routing** for serverless functions

## Prerequisites

1. **GitHub Account** with your code pushed
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com)

## Step 1: Push Your Updated Code to GitHub

```bash
git add .
git commit -m "Fix backend for Vercel deployment with KV storage"
git push origin main
```

## Step 2: Create a Vercel KV Database

Before deploying, you need to set up Vercel KV (Redis):

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click on **"Storage"** in the top navigation
3. Click **"Create Database"**
4. Select **"KV (Redis)"**
5. Name it `optedu-kv` or any name you prefer
6. Select your region (closest to your users)
7. Click **"Create"**

**Important:** Keep this tab open - you'll need the environment variables later!

## Step 3: Deploy Your Project to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will detect it's a Vite project automatically
5. **Don't deploy yet!** Continue to Step 4 first.

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (but don't deploy yet)
vercel link
```

## Step 4: Connect KV Database to Your Project

1. In your Vercel dashboard, go to your project
2. Click on **"Storage"** tab
3. Click **"Connect Store"**
4. Select your KV database (`optedu-kv`)
5. Click **"Connect"**

This automatically adds these environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

## Step 5: Add OpenAI API Key

1. Still in your project settings, go to **"Settings"** → **"Environment Variables"**
2. Add a new variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (starts with `sk-`)
   - **Environments:** Check all three (Production, Preview, Development)
3. Click **"Save"**

## Step 6: Deploy

### If using Dashboard:
1. Go to the **"Deployments"** tab
2. Click **"Redeploy"** (if you already deployed)
   - OR -
3. Click **"Deploy"** (if this is your first deployment)

### If using CLI:
```bash
vercel --prod
```

## Step 7: Test Your Deployment

Your app will be live at: `https://optedu-ai-tutor.vercel.app` (or your custom domain)

### Test these features:

1. **Health Check:** Visit `https://optedu-ai-tutor.vercel.app/api/`
   - Should show: `{"message":"Optedu AI Backend Server is running!","status":"ok"}`

2. **Frontend:** Visit `https://optedu-ai-tutor.vercel.app`
   - Should load the React app

3. **Create a Study Plan:** Try creating a new study plan
   - Test chat functionality
   - Upload files
   - Generate content

## Troubleshooting

### Issue: "KV not available" warnings in logs

**Solution:** Make sure you completed Step 4 to connect the KV database to your project.

### Issue: API returns 500 errors

**Solution:** Check the function logs:
1. Go to your project in Vercel
2. Click **"Deployments"**
3. Click on your latest deployment
4. Click **"Functions"** tab
5. Click on `/api/index` to see logs

### Issue: "Missing OpenAI API key"

**Solution:** 
1. Verify the environment variable is set in Vercel settings
2. Make sure it's named exactly `OPENAI_API_KEY`
3. Redeploy after adding it

### Issue: Frontend loads but backend doesn't work

**Solution:**
1. Check browser console for errors
2. Test the API directly: `curl https://your-app.vercel.app/api/`
3. Verify environment variables are set correctly

## Understanding Your New Architecture

### Before (Not Working on Vercel):
```
Backend: Node.js server with better-sqlite3
❌ better-sqlite3 requires native compilation
❌ File system not available in serverless
```

### After (Working on Vercel):
```
Backend: Serverless functions with Vercel KV
✅ All database operations use Redis (KV)
✅ No native modules needed
✅ Scales automatically
✅ Data persists across function calls
```

## Data Storage with Vercel KV

Your app now stores data in Vercel KV (Redis):

- **Users:** `users:{userId}`
- **Study Plans:** `study_plans:{planId}`
- **Messages:** `messages:{userId}:{studyPlanId}`
- **Generated Content:** `generated_content:{userId}:{studyPlanId}`
- **User's Plans List:** `user_study_plans:{userId}`

### Vercel KV Free Tier Limits:
- **Storage:** 256 MB
- **Requests:** 3,000 commands per day
- **Bandwidth:** 100 MB per day

For production use with more users, consider upgrading to Pro.

## View Your Data in Vercel KV

1. Go to Vercel dashboard
2. Click **"Storage"**
3. Click on your KV database
4. Click **"Data Browser"** tab
5. You can view and manage your data here

## Important Notes

### About Vercel Free Tier:
- **Serverless Function Timeout:** 10 seconds
- **Deployment Limit:** 100 deployments per day
- **Bandwidth:** 100 GB per month

For production apps, consider Vercel Pro for:
- 60-second function timeout
- More bandwidth
- Better KV limits

### About Data Persistence:
- ✅ Data is now persistent (unlike the old SQLite in-memory)
- ✅ Data survives function restarts
- ✅ Available across all serverless functions

### Security:
- ✅ KV credentials are automatically secured
- ✅ Never commit API keys to git
- ✅ Environment variables are encrypted

## Next Steps

Once deployed successfully:

1. **Set up a custom domain** (optional)
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Set up monitoring**
   - Enable Vercel Analytics
   - Set up error tracking

3. **Configure CORS** (if needed)
   - Already configured in the code for your domain

4. **Add Firebase Authentication**
   - Your app is ready for Firebase Auth integration

## Need Help?

### Check Logs:
```bash
# If using CLI
vercel logs

# Or view in dashboard:
# Project → Deployments → [Latest] → Functions → /api/index
```

### Common Commands:
```bash
# View deployment status
vercel ls

# View environment variables
vercel env ls

# Pull environment variables locally for development
vercel env pull
```

## Your Backend is Now Live! 🚀

Your Optedu AI Tutor is now fully deployed on Vercel with:
- ✅ Working serverless backend
- ✅ Persistent Redis database
- ✅ OpenAI integration
- ✅ File upload and processing
- ✅ Study plan generation
- ✅ Chat functionality

Visit your live app at: `https://optedu-ai-tutor.vercel.app`
