import { firestore } from 'firebase-admin';
import { logger, runWith } from 'firebase-functions/v1';

export const checkMaintenanceSchedules = runWith({ memory: '128MB', timeoutSeconds: 60 })
  .pubsub.schedule('* * * * *') // Schedule to run every 1 minute
  .timeZone('Africa/Nairobi') // Set the time zone
  .onRun(async () => {
    const now = firestore.Timestamp.now();
    const maintenanceRef = firestore().collection('maintenance');

    try {
      // Fetch maintenance where startedAt or endedAt conditions match
      const activeMaintenance = await maintenanceRef
        .where('startedAt', '<=', now)
        .where('status', '!=', 'pending')
        .where('isApproved', '==', true)
        .get();

      for (const maintenanceDoc of activeMaintenance.docs) {
        const maintenance = maintenanceDoc.data();
        await maintenanceDoc.ref.update({
          status: 'planned',
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
        await firestore().collection('vehicles').doc(maintenance.vehicle.docId).update({
          status: 'out-of-service',
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }

      const completedMaintenance = await maintenanceRef
        .where('endedAt', '<=', now)
        .where('status', '!=', 'pending')
        .where('isApproved', '==', true)
        .get();

      for (const maintenanceDoc of completedMaintenance.docs) {
        const maintenance = maintenanceDoc.data();
        await maintenanceDoc.ref.update({
          status: 'completed',
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
        await firestore().collection('vehicles').doc(maintenance.vehicle.docId).update({
          status: 'available',
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      logger.error('checkMaintenanceSchedules error:::', error);
    }
  });
