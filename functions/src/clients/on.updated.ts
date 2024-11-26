import { logger, runWith } from 'firebase-functions/v1';
import { CLIENT } from '../models/client';
import Constants from '../Constants';
import { firestore } from 'firebase-admin';

export const OnClientUpdated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbClients}/{docId}`)
  .onUpdate(async (snapshot, context) => {
    const prevClient = snapshot.before.data() as CLIENT;
    const client = snapshot.after.data() as CLIENT;
    client.docId = context.params.docId;
    logger.log('OnClientUpdated > details:', { client, prevClient });

    try {
      if (prevClient.firstName !== client.firstName || prevClient.lastName !== client.lastName) {
        client.displayName = `${client.firstName} ${client.lastName}`;
        logger.debug('OnClientUpdated > displayName:', client.displayName);

        await snapshot.after.ref.update({
          displayName: client.displayName,
          lowerCase: {
            firstName: client.firstName.toLocaleLowerCase(),
            lastName: client.lastName.toLocaleLowerCase(),
          },
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      logger.error('OnClientUpdated error:::', error);
    }
  });
