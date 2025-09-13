# 🔍 DEBUG STEPS - Let's Fix This!

## Step 1: Test Basic API
Visit: `https://your-app.vercel.app/api/debug`

**Should show:**
```json
{
  "message": "Debug endpoint working",
  "hasOpenAIKey": true,
  "openAIKeyLength": 51,
  "openAIKeyStart": "sk-proj-abc...",
  "allEnvVars": ["OPENAI_API_KEY"]
}
```

**If `hasOpenAIKey: false`** → Environment variable not set correctly

## Step 2: Test OpenAI API
Visit: `https://your-app.vercel.app/api/test-openai`

**Should show:**
```json
{
  "success": true,
  "message": "OpenAI API is working!",
  "aiResponse": "Hello from OpenAI API!"
}
```

**If error** → OpenAI key is wrong or API is down

## Step 3: Check Vercel Environment Variables

### In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Make sure you see `OPENAI_API_KEY` in the list
3. Click on it to verify the value starts with `sk-`
4. Make sure it's enabled for "Production"

### Common Issues:
- ❌ Variable name is wrong (should be exactly `OPENAI_API_KEY`)
- ❌ Value is wrong (should start with `sk-`)
- ❌ Not enabled for Production environment
- ❌ Didn't redeploy after adding the variable

## Step 4: Force Redeploy
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Wait 3-5 minutes for complete deployment

## Step 5: Check Vercel Logs
1. Go to Functions tab in Vercel dashboard
2. Click on any function (like `/api/debug`)
3. Check the logs for errors

## Common Fixes:

### Fix 1: Environment Variable Not Working
- Delete the variable and recreate it
- Make sure name is exactly `OPENAI_API_KEY`
- Make sure value starts with `sk-`
- Enable for Production, Preview, Development

### Fix 2: Still Not Working
- Try adding `NODE_ENV` variable with value `production`
- Redeploy after adding any new variables

### Fix 3: API Key Issues
- Get a new API key from OpenAI
- Make sure you have credits in your OpenAI account
- Check if the key has proper permissions

## Test URLs:
- `https://your-app.vercel.app/api/debug` ← Check environment
- `https://your-app.vercel.app/api/test-openai` ← Test OpenAI
- `https://your-app.vercel.app/api/test` ← Basic test

**Tell me what you see when you visit these URLs!**
