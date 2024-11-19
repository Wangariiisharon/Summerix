import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { COMPANY } from '../models/company';

export const OnCompanyDeleted = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbCompanies}/{docId}`)
  .onDelete(async (snapshot, context) => {
    const company = snapshot.data() as COMPANY;
    company.docId = context.params.docId;
    logger.log('OnCompanyDeleted > company:', company);

    try {
      // TODO: implement this
    } catch (error) {
      logger.error('OnCompanyDeleted error:', error);
    }
  });
