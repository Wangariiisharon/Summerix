import { firestore } from 'firebase-admin';
import { logger, runWith } from 'firebase-functions/v1';

export const checkTripSchedules = runWith({ memory: '128MB', timeoutSeconds: 60 })
  .pubsub.schedule('* * * * *') // Schedule to run every 1 minute
  .timeZone('Africa/Nairobi') // Set the time zone
  .onRun(async () => {
    const now = firestore.Timestamp.now();
    const tripsRef = firestore().collection('trips');

    try {
      // Fetch trips where startedAt or endedAt conditions match
      const activeTrips = await tripsRef
        .where('startedAt', '<=', now)
        .where('status', '!=', 'cancelled')
        .get();

      for (const tripDoc of activeTrips.docs) {
        const trip = tripDoc.data();
        await tripDoc.ref.update({
          status: 'active',
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
        await firestore().collection('vehicles').doc(trip.vehicle.docId).update({
          status: 'on-route',
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }

      const completedTrips = await tripsRef
        .where('endedAt', '<=', now)
        .where('status', '!=', 'cancelled')
        .get();

      for (const tripDoc of completedTrips.docs) {
        const trip = tripDoc.data();
        await tripDoc.ref.update({
          status: 'completed',
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
        await firestore().collection('vehicles').doc(trip.vehicle.docId).update({
          status: 'available',
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      logger.error('checkTripSchedules error:::', error);
    }
  });
