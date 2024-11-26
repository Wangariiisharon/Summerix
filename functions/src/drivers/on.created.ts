import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { DRIVER } from '../models/driver';

export const OnDriverCreated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbDrivers}/{docId}`)
  .onCreate(async (snapshot, context) => {
    const driver = snapshot.data() as DRIVER;
    driver.docId = context.params.docId;
    logger.log('OnDriverCreated > driver:', driver);

    try {
      // TODO: implement this
    } catch (error) {
      logger.error('OnDriverCreated error:::', error);
    }
  });
