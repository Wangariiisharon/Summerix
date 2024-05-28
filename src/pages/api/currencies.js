import admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require("../../serviceAccount.json"); //path to my service account key JSON file
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async (req, res) => {
  try {
    const snapshot = await db.collection("settings").doc("currencies").get();
    if (snapshot.exists) {
      const rates = snapshot.data();
      console.log("Rates Rares", rates);
      res.status(200).json({ rates });
    } else {
      res.status(404).json({ error: "No currency rates found" });
    }
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    res.status(500).json({ error: "Failed to fetch currency rates" });
  }
};
