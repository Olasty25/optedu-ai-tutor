# 🚀 QUICK START - 3 Steps to 24/7 Backend!

## ⚡ Step 1: Get OpenAI Key (1 minute)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up → API Keys → Create new secret key
3. Copy the key (starts with `sk-`)

## ⚡ Step 2: Add to Vercel (2 minutes)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Your project → Settings → Environment Variables
3. Add:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-your-key-here`
   - **Check all boxes:** Production, Preview, Development

## ⚡ Step 3: Redeploy (30 seconds)
1. Deployments tab → Redeploy
2. Wait 2 minutes

## ✅ DONE! Your AI backend is now 24/7!

### Test it:
- `https://your-app.vercel.app/api/test` ← Should work
- `https://your-app.vercel.app/api/chat-simple` ← AI chat works
- `https://your-app.vercel.app/api/generate-plan-simple` ← Study plans work

### What works:
- ✅ AI Chat
- ✅ Study Plan Generation  
- ✅ File Upload
- ✅ Web Scraping
- ✅ All AI features

### What doesn't save (but still works):
- ❌ Chat history (resets each session)
- ❌ Study plans (generates but doesn't save)
- ❌ Generated content (creates but doesn't save)

**The app works perfectly for AI features! Data just doesn't persist between sessions.**
