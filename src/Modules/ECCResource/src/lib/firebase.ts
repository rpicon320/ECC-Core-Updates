import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase configuration using environment variables from the core app
const firebaseConfig = {
  apiKey: "AIzaSyC2tsIWxPxM7Sh708pWnmfvlOxZRJjP7Hs",
  authDomain: "eccapp-fcc81.firebaseapp.com",
  projectId: "eccapp-fcc81",
  storageBucket: "eccapp-fcc81.firebasestorage.app",
  messagingSenderId: "553021425596",
  appId: "1:553021425596:web:c760c1683ef7d104ed8db9",
  measurementId: "G-WB98XFT5L6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;