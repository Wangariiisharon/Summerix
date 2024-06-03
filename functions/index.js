const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();
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
          app_id: "1cfa9b9f86664a7db05a07b977b41ccd", // Replace with your OpenExchangeRates app ID
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

exports.getCountries = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    getCountries().then((countries) => {
      res.status(200).json(countries);
    });
  });
});

const getCountries = async () => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};
