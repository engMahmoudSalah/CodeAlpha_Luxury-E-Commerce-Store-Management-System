import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId,
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
