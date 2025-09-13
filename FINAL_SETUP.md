# 🚀 FINAL SETUP - Under 12 Functions!

## ✅ Current Status: 9 Functions (Under Limit!)

**Functions:**
- `api/chat.js` - AI chat
- `api/generate-plan-with-sources.js` - Study plans
- `api/upload-file.js` - File upload
- `api/scrape-url.js` - Web scraping
- `api/create-checkout-session.js` - Payments
- `api/generated-content.js` - Content management
- `api/messages.js` - Messages
- `api/study-plan.js` - Study plans
- `api/health.js` - Health check + debug

## Step 1: Set Environment Variable
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Your project → Settings → Environment Variables
3. Add:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-your-key-here`
   - **Check all:** Production, Preview, Development
4. Click "Save"

## Step 2: Redeploy
1. Go to Deployments tab
2. Click "Redeploy"
3. Wait 3-5 minutes

## Step 3: Test
Visit: `https://your-app.vercel.app/api/health`

**Should show:**
```json
{
  "status": "ok",
  "debug": {
    "hasOpenAIKey": true,
    "openAIKeyLength": 51,
    "openAIKeyStart": "sk-proj-abc...",
    "allEnvVars": ["OPENAI_API_KEY"]
  }
}
```

## Step 4: Test AI Chat
Visit: `https://your-app.vercel.app/api/chat`

**Send POST request with:**
```json
{
  "type": "chat",
  "message": "Hello, are you working?",
  "userId": "test",
  "studyPlanId": "test"
}
```

## ✅ What Works:
- ✅ AI Chat (GPT-3.5)
- ✅ Study Plan Generation
- ✅ File Upload
- ✅ Web Scraping
- ✅ All AI features!

**You're now under the 12 function limit and should deploy successfully!** 🎉
