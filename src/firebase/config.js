import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================================================
// 🔥 REPLACE THIS WITH YOUR FIREBASE CONFIG
// Go to Firebase Console → Project Settings → Your Apps
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyBxLdqqx9bjIclRq-aGyUCj8o9I7eoRrNc",
  authDomain: "satyamgold-2a418.firebaseapp.com",
  projectId: "satyamgold-2a418",
  storageBucket: "satyamgold-2a418.firebasestorage.app",
  messagingSenderId: "616067617150",
  appId: "1:616067617150:web:526cf2eac1715e5ad9a32f"
};
// ============================================================

const app       = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
