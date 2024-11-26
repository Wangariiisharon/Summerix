import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { firestore } from 'firebase-admin';
import { DRIVER } from '../models/driver';

export const OnDriverUpdated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbDrivers}/{docId}`)
  .onUpdate(async (snapshot, context) => {
    const prevDriver = snapshot.before.data() as DRIVER;
    const driver = snapshot.after.data() as DRIVER;
    driver.docId = context.params.docId;
    logger.log('OnDriverUpdated > details:', { driver, prevDriver });

    try {
      if (prevDriver.firstName !== driver.firstName || prevDriver.lastName !== driver.lastName) {
        driver.displayName = `${driver.firstName} ${driver.lastName}`;
        logger.debug('OnDriverUpdated > displayName:', driver.displayName);

        await snapshot.after.ref.update({
          displayName: driver.displayName,
          lowerCase: {
            firstName: driver.firstName.toLocaleLowerCase(),
            lastName: driver.lastName.toLocaleLowerCase(),
          },
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      logger.error('OnDriverUpdated error:::', error);
    }
  });
