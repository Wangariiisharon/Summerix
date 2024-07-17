// lib/firebaseAdmin.js
import admin from "firebase-admin";

const serviceAccount = require("./../serviceAccount.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://truck-it-bf0b2.firebaseio.com",
  });
}

const db = admin.firestore();

export { admin, db };
