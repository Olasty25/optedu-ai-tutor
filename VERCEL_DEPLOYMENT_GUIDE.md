# Vercel Deployment Guide

This guide will help you deploy your Optedu AI Tutor app to Vercel with both frontend and backend working on the internet.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com)

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with all the changes we made:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Vite project
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

## Step 3: Configure Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
   - **Environments**: Production, Preview, Development

## Step 4: Redeploy

After adding environment variables, redeploy your project:

1. Go to the Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"

## Step 5: Test Your Deployment

Your app will be available at: `https://your-project-name.vercel.app`

### Test the following:

1. **Frontend**: Visit the main page
2. **API Health**: Visit `https://your-project-name.vercel.app/api/`
3. **Chat Function**: Try the chat feature
4. **Study Plan Generation**: Create a new study plan

## Project Structure After Deployment

```
your-app.vercel.app/
├── / (Frontend - React app)
├── /api/ (Backend - Serverless functions)
│   ├── /chat
│   ├── /generate-plan-with-sources
│   ├── /upload-file
│   ├── /scrape-url
│   └── ... (other endpoints)
```

## How It Works

### Frontend
- Built with Vite and deployed as static files
- Automatically served from Vercel's CDN
- Uses the same domain for API calls

### Backend
- Converted from Express server to Vercel serverless functions
- All API routes are in `/api/` directory
- Each function runs independently
- Database uses in-memory SQLite (data resets on each function call)

## Important Notes

### Database Limitations
- The current setup uses in-memory SQLite
- Data will be lost when functions restart
- For production, consider using:
  - Vercel KV (Redis)
  - PlanetScale (MySQL)
  - Supabase (PostgreSQL)
  - MongoDB Atlas

### File Uploads
- Files are processed in memory
- No persistent storage
- Consider using Vercel Blob or AWS S3 for file storage

### API Limits
- Vercel has execution time limits
- Free tier: 10 seconds per function
- Pro tier: 60 seconds per function

## Troubleshooting

### Common Issues

1. **API not working**: Check environment variables
2. **Build errors**: Check console for specific errors
3. **CORS issues**: Already handled in the code
4. **Database errors**: Expected with in-memory database

### Debug Steps

1. Check Vercel function logs:
   - Go to Functions tab in Vercel dashboard
   - Click on a function to see logs

2. Check browser console for errors

3. Test API endpoints directly:
   ```bash
   curl https://your-app.vercel.app/api/
   ```

## Next Steps

1. **Set up a proper database** for data persistence
2. **Add authentication** (Firebase Auth, Auth0, etc.)
3. **Set up file storage** for uploads
4. **Add monitoring** (Vercel Analytics, Sentry)
5. **Set up custom domain** if needed

## Support

If you encounter issues:
1. Check Vercel documentation
2. Check function logs in Vercel dashboard
3. Verify environment variables are set correctly
4. Test API endpoints individually

Your app should now be live on the internet! 🚀
