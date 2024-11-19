import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { COMPANY } from '../models/company';

export const OnCompanyUpdated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbCompanies}/{docId}`)
  .onUpdate(async (snapshot, context) => {
    const prevCompany = snapshot.before.data() as COMPANY;
    const company = snapshot.after.data() as COMPANY;
    company.docId = context.params.docId;
    logger.log('OnCompanyUpdated > details:', { company, prevCompany });

    try {
      // TODO: implement this
    } catch (error) {
      logger.error('OnCompanyUpdated error:::', error);
    }
  });
