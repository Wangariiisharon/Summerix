import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const apps = getApps();

if (!apps.length || apps.length === 0) {
  console.debug("do initialize firebase...");

  try {
    const firebaseConfig = {
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    initializeApp(firebaseConfig);
  } catch (error) {
    console.error("FIREBASE INIT ERROR:::", error);
  }
}

const firebaseApp = getApps()[0];

export const auth = getAuth(firebaseApp);
export const fbDb = getFirestore(firebaseApp);
export const fbStorage = getStorage(firebaseApp);

export default firebaseApp;
