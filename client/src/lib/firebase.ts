import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase configuration using environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC2tsIWxPxM7Sh708pWnmfvlOxZRJjP7Hs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eccapp-fcc81.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eccapp-fcc81",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eccapp-fcc81.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "553021425596",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:553021425596:web:c760c1683ef7d104ed8db9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WB98XFT5L6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;