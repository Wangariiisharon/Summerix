import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { DRIVER } from '../models/driver';

export const OnDriverDeleted = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbDrivers}/{docId}`)
  .onDelete(async (snapshot, context) => {
    const driver = snapshot.data() as DRIVER;
    driver.docId = context.params.docId;
    logger.log('OnDriverDeleted > driver:', driver);

    try {
      // TODO: implement this
    } catch (error) {
      logger.error('OnDriverDeleted error:', error);
    }
  });
