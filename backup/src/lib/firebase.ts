import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyC2tsIWxPxM7Sh708pWnmfvlOxZRJjP7Hs",
  authDomain: "eccapp-fcc81.firebaseapp.com",
  projectId: "eccapp-fcc81",
  storageBucket: "eccapp-fcc81.firebasestorage.app",
  messagingSenderId: "553021425596",
  appId: "1:553021425596:web:c760c1683ef7d104ed8db9",
  measurementId: "G-WB98XFT5L6"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

// Connect to emulators in development only if explicitly requested and available
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Check if we haven't already connected to emulators
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080)
    }
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099')
    }
    console.log('Connected to Firebase emulators')
  } catch (error) {
    console.warn('Firebase emulators not available, using production Firebase:', error)
  }
} else {
  console.log('Using production Firebase')
}

export default app