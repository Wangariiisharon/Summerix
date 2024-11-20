import { firestore as db } from 'firebase-admin';
import { logger, runWith } from 'firebase-functions/v1';
import { doUpdateAuthClaims } from '../services/admin.service';
import { getFirebaseUser } from '../services/auth.service';
import Constants from '../Constants';
import { ADMIN } from '../models/admin';
import { getClientByDocId } from '../services/client.service';

export const OnAdminCreated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbAdmins}/{docId}`)
  .onCreate(async (snapshot, context) => {
    const admin = snapshot.data() as ADMIN;
    const docId = (admin.docId = context.params.docId);
    logger.log('OnAdminCreated > admin:', admin);

    try {
      admin.displayName = `${admin.firstName} ${admin.lastName}`;
      const authUser = await getFirebaseUser(admin, docId);
      if (authUser.uid !== docId) {
        admin.docId = authUser.uid; // update docId
        logger.debug('OnAdminCreated > update docId:', authUser.uid);
        await db().collection(Constants.fbAdmins).doc(authUser.uid).set(admin);
        await snapshot.ref.delete();
      }

      await doUpdateAuthClaims(authUser.uid, admin);

      // find corresponding client profile
      const clientSnaphot = await getClientByDocId(docId);
      if (!clientSnaphot.exists) {
        logger.debug('Create client profile...');

        await db()
          .collection(Constants.fbClients)
          .doc(authUser.uid)
          .set({
            email: admin.email,
            company: admin.company || {},
            idNumber: admin.idNumber || '',
            phoneNumber: admin.phoneNumber || '',
            firstName: admin.firstName,
            lastName: admin.lastName,
            displayName: admin.displayName || '',
            photoURL: admin.photoURL || '',

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
    } catch (error) {
      logger.error('OnAdminCreated error:::', error);
    }
  });
