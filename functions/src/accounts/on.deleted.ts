import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { ACCOUNT } from '../models/account';

export const OnAccountDeleted = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbAccounts}/{docId}`)
  .onDelete(async (snapshot, context) => {
    const account = snapshot.data() as ACCOUNT;
    account.docId = context.params.docId;
    logger.log('OnAccountDeleted > account:', account);

    try {
      // TODO: implement this
    } catch (error) {
      logger.error('OnAccountDeleted error:', error);
    }
  });
