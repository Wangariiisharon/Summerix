const functions = require("firebase-functions");
const admin = require("firebase-admin");
const next = require("next");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Next.js configuration
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, conf: { distDir: ".next" } });
const handle = app.getRequestHandler();

// Next.js server-side handler
exports.next = functions.https.onRequest((req, res) => {
  console.log("File: " + req.originalUrl); // Log the page.js file that is being requested
  return app.prepare().then(() => handle(req, res));
});

exports.updateTripStatus = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async (context) => {
    const now = new Date();
    console.log(`Current server time: ${now}`);
    const tripsRef = admin.firestore().collection("trips");

    const snapshot = await tripsRef
      .where("trip_status", "in", ["Booked", "On Route"])
      .get();

    if (snapshot.empty) {
      console.log("No active trips to update.");
      return null;
    }

    let batch = admin.firestore().batch();

    snapshot.forEach((doc) => {
      const trip = doc.data();
      const startTime = trip.start_time.toDate();
      const endTime = trip.end_time.toDate();
      console.log(
        `Evaluating trip ${doc.id}: start at ${startTime}, end at ${endTime}`
      );

      let updatedStatus = null;

      if (now >= startTime && trip.trip_status === "Booked") {
        updatedStatus = "On Route";
        console.log(`Updating trip ${doc.id} to On Route`);
      } else if (now >= endTime && trip.trip_status === "On Route") {
        updatedStatus = "Done";
        console.log(`Updating trip ${doc.id} to Done`);
      }

      if (updatedStatus) {
        batch.update(doc.ref, { trip_status: updatedStatus });
      }
    });

    return batch
      .commit()
      .then(() => {
        console.log("Trip statuses updated successfully.");
      })
      .catch((error) => {
        console.error("Error updating trip statuses:", error);
      });
  });
