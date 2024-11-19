import { logger, runWith } from 'firebase-functions/v1';
import { doUpdateAuthClaims } from '../services/admin.service';
import { firestore } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import Constants from '../Constants';
import { ADMIN } from '../models/admin';

export const OnAdminUpdated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbAdmins}/{docId}`)
  .onUpdate(async (snapshot, context) => {
    const prevAdmin = snapshot.before.data() as ADMIN;
    const admin = snapshot.after.data() as ADMIN;
    const docId = (admin.docId = context.params.docId);
    logger.log('OnAdminUpdated > admin:', admin);

    try {
      if (prevAdmin.firstName !== admin.firstName || prevAdmin.lastName !== admin.lastName) {
        admin.displayName = `${admin.firstName} ${admin.lastName}`;
        logger.debug('OnHostUpdated > displayName:', admin.displayName);

        await snapshot.after.ref.update({
          displayName: admin.displayName,
          lowerCase: {
            firstName: admin.firstName.toLocaleLowerCase(),
            lastName: admin.lastName.toLocaleLowerCase(),
          },
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }

      if (
        prevAdmin.rolesMap !== admin.rolesMap ||
        prevAdmin.roles !== admin.roles
      ) {
        logger.debug('update auth claims:', {
          companyId: admin.rolesMap.companyId,
          rolesMap: admin.rolesMap,
          roles: admin.roles,
        });
        await doUpdateAuthClaims(docId, admin);
        await getAuth().revokeRefreshTokens(docId);
      }
    } catch (error) {
      logger.error('OnAdminUpdated error:::', error);
    }
  });
