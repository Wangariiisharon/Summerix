import admin, { apps, credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

if (!apps.length) {
  console.debug('do initialize firebase admin...');
  
  try {
    initializeApp({
      credential: credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error("FIREBASE ADMIN INIT ERROR:::", error);
  }
}

// eslint-disable-next-line import/no-unused-modules
export const storage = getStorage();

export default admin;
