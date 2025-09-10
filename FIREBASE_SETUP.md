# Firebase Authentication Setup Guide

## Prerequisites
1. A Google account
2. Access to [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "optedu-ai-tutor")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Google" provider:
   - Click on "Google"
   - Toggle "Enable"
   - Add your project support email
   - Click "Save"

## Step 3: Get Firebase Configuration

1. Go to "Project Settings" (gear icon in left sidebar)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>)
4. Register your app with a nickname (e.g., "optedu-web")
5. Copy the Firebase configuration object

## Step 4: Create Environment File

Create a `.env.local` file in your project root with the following content:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the placeholder values with your actual Firebase configuration values.

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to "Authentication" > "Settings" > "Authorized domains"
2. Add your development domain: `localhost`
3. Add your production domain when ready

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Go to the login page
3. Click "Continue with Google"
4. You should see a Google sign-in popup

## Troubleshooting

### Common Issues

1. **"Popup blocked" error**
   - Allow popups for your localhost domain
   - Try using a different browser

2. **"Operation not allowed" error**
   - Make sure Google sign-in is enabled in Firebase Console
   - Check that your domain is in the authorized domains list

3. **"Invalid API key" error**
   - Verify your `.env.local` file has the correct values
   - Make sure the file is in the project root
   - Restart your development server after adding the file

4. **"Network request failed" error**
   - Check your internet connection
   - Verify Firebase project is active
   - Check browser console for detailed error messages

### Debug Mode

The app includes a debug component that shows:
- Firebase initialization status
- Authentication state
- Configuration status
- Current user information

To enable debug mode, the component is automatically shown in development mode.

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Use different Firebase projects for development and production
- Regularly rotate your API keys in production

## Next Steps

Once authentication is working:
1. Set up user profiles and preferences
2. Configure database rules
3. Set up production environment
4. Configure custom domains
