import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { firestore } from 'firebase-admin';
import { ACCOUNT } from '../models/account';

export const OnAccountUpdated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbAccounts}/{docId}`)
  .onUpdate(async (snapshot, context) => {
    const prevAccount = snapshot.before.data() as ACCOUNT;
    const account = snapshot.after.data() as ACCOUNT;
    account.docId = context.params.docId;
    logger.log('OnAccountUpdated > details:', { account, prevAccount });

    try {
      if (
        prevAccount.firstName !== account.firstName ||
        prevAccount.lastName !== account.lastName
      ) {
        account.displayName = `${account.firstName} ${account.lastName}`;
        logger.debug('OnAccountUpdated > displayName:', account.displayName);

        await snapshot.after.ref.update({
          displayName: account.displayName,
          lowerCase: {
            firstName: account.firstName.toLocaleLowerCase(),
            lastName: account.lastName.toLocaleLowerCase(),
          },
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      logger.error('OnAccountUpdated error:::', error);
    }
  });
