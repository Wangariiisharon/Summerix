import { firestore } from 'firebase-admin';
import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { TRIP } from '../models/trip';
import { getTripDistance } from '../services/trip.service';

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
      if (trip.from.cordinates && trip.to.cordinates) {
        if (
          !trip.from.cordinates.isEqual(prevTrip.from.cordinates) ||
          !trip.to.cordinates.isEqual(prevTrip.to.cordinates)
        ) {
          // do calculate trip distance between 'from' & 'to'
          const response = await getTripDistance(trip.from, trip.to);
          logger.debug('OnTripUpdated > distanceResponse:', response);

          if (response && response.rows) {
            await snapshot.after.ref.update({
              distanceMatrix: response.rows,
              distance: response.rows[0].elements[0].distance,
              duration: response.rows[0].elements[0].duration,
              lastUpdated: firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      }
    } catch (error) {
      logger.error('OnTripUpdated error:::', error);
    }
  });
