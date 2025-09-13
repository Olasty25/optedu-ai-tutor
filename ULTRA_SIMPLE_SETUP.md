# 🚀 ULTRA SIMPLE SETUP - Just 2 Steps!

## Step 1: Get OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up → API Keys → Create new secret key
3. Copy the key (starts with `sk-`)

## Step 2: Add to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Your project → Settings → Environment Variables
3. Add:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-your-key-here`
   - **Check all:** Production, Preview, Development
4. Click "Save"
5. Go to Deployments → Redeploy

## ✅ DONE! Your backend is now 24/7!

### Test URLs:
- `https://your-app.vercel.app/api/test` ← Basic test
- `https://your-app.vercel.app/api/chat-simple` ← AI chat
- `https://your-app.vercel.app/api/generate-plan-simple` ← Study plans

### What works:
- ✅ AI Chat (GPT-3.5)
- ✅ Study Plan Generation
- ✅ File Upload & Processing
- ✅ Web Content Scraping
- ✅ All AI features work perfectly!

### What doesn't persist:
- ❌ Chat history (resets each session)
- ❌ Saved study plans (generates but doesn't save)
- ❌ Generated content (creates but doesn't save)

**The app works 100% for AI features! Data just doesn't save between sessions.**

---

## Optional: Add Database Later
If you want to save data, add these 3 more environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN` 
- `KV_REST_API_READ_ONLY_TOKEN`

But the app works perfectly without them!
