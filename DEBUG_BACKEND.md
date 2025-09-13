# Backend Debugging Guide

## Quick Test
1. Visit: `https://your-app.vercel.app/api/test`
2. Should return: `{"message":"Backend is working!","timestamp":"...","method":"GET","url":"/api/test","environment":"production"}`

## Common Issues & Solutions

### 1. Environment Variables Missing
**Check in Vercel Dashboard > Settings > Environment Variables:**
- `OPENAI_API_KEY` - Required for AI functionality
- `KV_REST_API_URL` - Required for database
- `KV_REST_API_TOKEN` - Required for database
- `KV_REST_API_READ_ONLY_TOKEN` - Required for database

### 2. API Endpoints Not Working
**Test each endpoint:**
- `GET /api/health` - Basic health check
- `GET /api/test` - Simple test endpoint
- `POST /api/chat` - AI chat (needs OPENAI_API_KEY)

### 3. Database Connection Issues
**If using Vercel KV:**
1. Go to Vercel Dashboard > Storage
2. Create a new KV database
3. Copy the connection details to environment variables
4. Redeploy

### 4. CORS Issues
All API functions include CORS headers, but if you still have issues:
- Check if frontend URL is correct
- Verify API calls are going to the right domain

### 5. Function Timeout
- All functions are set to 30 seconds max
- Check Vercel function logs for timeout errors

## Debug Steps
1. Check Vercel function logs in dashboard
2. Test `/api/test` endpoint first
3. Verify environment variables are set
4. Check if Vercel KV database is connected
5. Test individual API endpoints

## Current API Endpoints
- `POST /api/chat` - AI chat
- `POST /api/generate-plan-with-sources` - Study plan generation
- `POST /api/upload-file` - File upload
- `POST /api/scrape-url` - Web scraping
- `POST /api/create-checkout-session` - Stripe payments
- `POST /api/generated-content` - Save content
- `GET /api/generated-content?userId=X&studyPlanId=Y` - Get content
- `DELETE /api/generated-content?contentId=X&action=delete` - Delete content
- `GET /api/messages?userId=X&studyPlanId=Y` - Get messages
- `GET /api/messages?userId=X&studyPlanId=Y&action=count` - Get message count
- `DELETE /api/messages?userId=X&studyPlanId=Y` - Delete messages
- `POST /api/study-plan` - Save study plan
- `GET /api/study-plan?planId=X&userId=Y` - Get study plan
- `GET /api/study-plan?userId=X&action=count` - Get user's plans count
- `DELETE /api/study-plan?planId=X&userId=Y` - Delete study plan
- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint
