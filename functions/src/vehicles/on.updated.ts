import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { VEHICLE } from '../models/vehicle';

export const OnVehicleUpdated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbVehicles}/{docId}`)
  .onUpdate(async (snapshot, context) => {
    const prevVehicle = snapshot.before.data() as VEHICLE;
    const vehicle = snapshot.after.data() as VEHICLE;
    vehicle.docId = context.params.docId;
    logger.log('OnVehicleUpdated > details:', { vehicle, prevVehicle });

    try {
      // TODO: implement this
    } catch (error) {
      logger.error('OnVehicleUpdated error:::', error);
    }
  });
