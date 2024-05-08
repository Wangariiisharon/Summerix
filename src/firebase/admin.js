// import admin from "firebase-admin";

// if (!admin.apps.length) {
// //   const serviceAccount = require("serviceAccount.json");
// const serviceAccount = require('../serviceAccount.json');

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
//   console.log("Firebase Admin Initialized Successfully");
// }

// export default admin; // This is the default export

import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccount = require("../serviceAccount.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin Initialized Successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export default admin;
