import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { VEHICLE } from '../models/vehicle';

export const OnVehicleDeleted = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbVehicles}/{docId}`)
  .onDelete(async (snapshot, context) => {
    const vehicle = snapshot.data() as VEHICLE;
    vehicle.docId = context.params.docId;
    logger.log('OnVehicleDeleted > vehicle:', vehicle);

    try {
      // TODO: implement this
    } catch (error) {
      logger.error('OnVehicleDeleted error:', error);
    }
  });
