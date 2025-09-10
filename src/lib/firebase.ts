import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from "firebase/auth";

// Firebase configuration is expected to be provided via Vite env variables
// Create a .env.local with your values, e.g.:
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_STORAGE_BUCKET=...
// VITE_FIREBASE_MESSAGING_SENDER_ID=...
// VITE_FIREBASE_APP_ID=...

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missingKeys.length > 0) {
    console.error('Missing Firebase configuration:', missingKeys);
    console.error('Please create a .env.local file with your Firebase configuration');
    return false;
  }
  return true;
};

// Initialize Firebase
let app;
try {
  if (!validateConfig()) {
    throw new Error('Invalid Firebase configuration');
  }
  console.log('Initializing Firebase with config:', {
    apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId ? 'Set' : 'Missing'
  });
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  // Fallback configuration for development
  app = initializeApp({
    apiKey: "demo-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
  });
}

export const auth = getAuth(app);

// Ensure auth state persists across reloads and tabs
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Failed to set auth persistence:', error);
});

// Connect to auth emulator in development if available
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, "http://localhost:9099");
  } catch (error) {
    console.warn('Failed to connect to auth emulator:', error);
  }
}

export default app;


