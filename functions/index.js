const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const serviceAccount = require("./../src/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const getSettingsCurrencies = async () => {
  const snapshot = await db.collection("settings").doc("currencies").get();
  if (snapshot.exists) {
    return Object.keys(snapshot.data());
  }
  return [];
};

const getOpenExchangeCurrency = async () => {
  try {
    const currencies = await getSettingsCurrencies();
    if (currencies.length > 0) {
      const options = {
        method: "GET",
        url: "https://openexchangerates.org/api/latest.json",
        params: {
          app_id: "1cfa9b9f86664a7db05a07b977b41ccd",
          base: "USD",
          symbols: currencies.join(","),
        },
        headers: {
          accept: "application/json",
        },
      };

      const response = await axios.request(options);
      if (response.data) {
        const rates = response.data.rates;
        const updateData = {};
        currencies.forEach((currency) => {
          if (rates[currency.toUpperCase()]) {
            updateData[currency] = rates[currency.toUpperCase()];
          }
        });

        await db
          .collection("settings")
          .doc("currencies")
          .set(updateData, { merge: true });
        console.log("Currency rates updated successfully.");
      }
    }
  } catch (error) {
    console.error("Error fetching currency rates:", error);
  }
};

exports.getOpenExchangeCurrency = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    await getOpenExchangeCurrency();
  });

const setCustomUserClaims = async (uid, claims) => {
  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    console.log(`Custom claims set for user ${uid}`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
};

exports.setUserClaims = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).send("Missing uid in request body");
    }

    try {
      // Fetch user data from Firestore
      const userSnapshot = await admin
        .firestore()
        .collection("admins")
        .where("userId", "==", uid)
        .get();

      if (userSnapshot.empty) {
        return res.status(404).send("User not found");
      }

      const userData = userSnapshot.docs[0].data();

      // Check if the role is admin
      const claims = {};
      if (userData.role === "admin") {
        claims.admin = true;
      }

      await setCustomUserClaims(uid, claims);
      res.status(200).send(`Custom claims set for user ${uid}`);
    } catch (error) {
      res.status(500).send(`Error setting custom claims: ${error.message}`);
    }
  });
});
