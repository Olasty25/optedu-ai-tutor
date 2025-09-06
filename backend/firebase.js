import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJkIkX-OAe5yy1-UYOtdygF4bcvWDRqQs",
  authDomain: "optedu-ai.firebaseapp.com",
  projectId: "optedu-ai",
  storageBucket: "optedu-ai.firebasestorage.app",
  messagingSenderId: "975685010394",
  appId: "1:975685010394:web:e57fbfd677dd52b16c36e3",
  measurementId: "G-LS88Z4DF8Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
