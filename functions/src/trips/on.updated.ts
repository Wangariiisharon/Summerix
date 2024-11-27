import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { TRIP } from '../models/trip';

export const OnTripUpdated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbTrips}/{docId}`)
  .onUpdate(async (snapshot, context) => {
    const prevTrip = snapshot.before.data() as TRIP;
    const trip = snapshot.after.data() as TRIP;
    trip.docId = context.params.docId;
    logger.log('OnTripUpdated > details:', { trip, prevTrip });

    try {
      // TODO: implement this
    } catch (error) {
      logger.error('OnTripUpdated error:::', error);
    }
  });
