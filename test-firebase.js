// Simple Firebase connection test
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCgnswzwmQotd6h0Bm4hRqWBX4bLtBzEyY",
  authDomain: "fitvision-318e5.firebaseapp.com",
  projectId: "fitvision-318e5",
  storageBucket: "fitvision-318e5.firebasestorage.app",
  messagingSenderId: "209082967266",
  appId: "1:209082967266:web:f5f4902a3dc06121b2eabb",
  measurementId: "G-2XS2B9LMJH"
};

try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}
