// Import required modules
const functions = require("firebase-functions");
const next = require("next");
const admin = require("firebase-admin");
const axios = require("axios");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Define your function
const getOpenExchangeCurrency = async () => {
  try {
    // Get currencies from settings > currency collectionN
    const currencies = await getSettingsCurrencies(); // As Array
    if (currencies) {
      const options = {
        method: "GET",
        url: "https://openexchangerates.org/api/latest.json",
        params: {
          app_id: "", // pass app ID provided during registration
          base: "usd",
          symbols: currencies.join(","),
          prettyprint: false,
          show_alternative: false,
        },
        headers: {
          accept: "application/json",
        },
      };
      const response = await axios.request(options);
      if (response.data) {
        console.log("response", response.data.rates);
        currencies.forEach((currency) => {
          const currencyRate = response.data.rates[currency];
          console.log("currency rate", currencyRate);
          // TODO: update the rate on the currency settings page for this currency
        });
      }
    }
  } catch (error) {
    console.error("error", error);
  }
};

// Export your function using CommonJS syntax
module.exports = { getOpenExchangeCurrency };
