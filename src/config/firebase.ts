import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration - using import.meta.env for Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCgnswzwmQotd6h0Bm4hRqWBX4bLtBzEyY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fitvision-318e5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fitvision-318e5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fitvision-318e5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "209082967266",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:209082967266:web:f5f4902a3dc06121b2eabb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2XS2B9LMJH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
