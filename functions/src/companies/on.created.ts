import { firestore as db } from 'firebase-admin';
import { logger, runWith } from 'firebase-functions/v1';
import Constants from '../Constants';
import { COMPANY } from '../models/company';
import { getFirebaseUser } from '../services/auth.service';
import { getAccountData } from '../services/account.service';

export const OnCompanyCreated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbCompanies}/{docId}`)
  .onCreate(async (snapshot, context) => {
    const company = snapshot.data() as COMPANY;
    const docId = (company.docId = context.params.docId);
    logger.log('OnCompanyCreated > company:', company);

    try {
      const account = await getAccountData(docId);
      if (account) {
        const authUser = await getFirebaseUser(account, docId);
        if (authUser && authUser.uid) {
          logger.debug('Create company`s default admin...');
          

          // create the company owner admin profile
          await db()
            .collection(Constants.fbAdmins)
            .doc(authUser.uid) 
        
            

            .set({
              email: account.email,
              idNumber: account.idNumber || '',
              phoneNumber: account.phoneNumber || '',

              firstName: account.firstName,
              lastName: account.lastName,
              displayName: account.displayName || '',

              company: {
                docId: company.docId,
                name: company.name || '',
                email: company.email || '',
                phoneNumber: company.phoneNumber || '',
                regNumber: company.regNumber || '',
              },

              photoURL: account.photoURL || '',
              roles: [
                'canManageAdmins',
                'canManageClients',
                'canManageTrips',
                'canManageVehicles',
                'canManageDrivers',
              ],
              rolesMap: {
                companyId: company.docId,
                isActive: true,
                isAdmin: true,
                isOwner: true,
              },

              createdBy: {
                authId: 'functions',
                email: 'functions@truckmate.com',
              },
              updatedBy: {
                authId: 'functions',
                email: 'functions@truckmate.com',
              },

              dateCreated: db.FieldValue.serverTimestamp(),
              lastUpdated: db.FieldValue.serverTimestamp(),
            });
        }
      }
    } catch (error) {
      logger.error('OnCompanyCreated error:::', error);
    }
  });
