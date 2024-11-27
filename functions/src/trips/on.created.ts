import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { TRIP } from '../models/trip';

export const OnTripCreated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbTrips}/{docId}`)
  .onCreate(async (snapshot, context) => {
    const trip = snapshot.data() as TRIP;
    trip.docId = context.params.docId;
    logger.log('OnTripCreated > trip:', trip);

    try {
      // TODO: implement this
    } catch (error) {
      logger.error('OnTripCreated error:::', error);
    }
  });
