import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId,
};

// Initialize Firebase App instance singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firebase Firestore with explicit Database ID support and robust HTTP Long Polling for sandbox environments
const firestoreDatabaseId = (firebaseConfigJson as any).firestoreDatabaseId;
export const db = firestoreDatabaseId
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, firestoreDatabaseId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

export default app;
