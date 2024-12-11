import { auth } from 'firebase-admin';
import { logger } from 'firebase-functions/v1';
import { getExistingAccountEmailBody, getNewAccountEmailBody } from './email.service';
import { ACCOUNT } from '../models/account';
import { ADMIN } from '../models/admin';

export const getFirebaseUser = async (
  fUser: ACCOUNT | ADMIN,
  uid?: string, // provided firebase uid
  email?: boolean, // no phone auth
): Promise<any> => {
  let userRecord = null;
  let isNewAccount = false;

  try {
    if (fUser.docId) {
      // search firebase auth users by uid
      userRecord = await auth().getUser(fUser.docId);
    }
  } catch (error: any) {
    logger.warn('getFirebaseUser > error:', error);
    if (error.code === 'auth/user-not-found') {
      try {
        // search firebase auth users by email
        userRecord = await auth().getUserByEmail(fUser.email);
      } catch (error2: any) {
        logger.warn('getFirebaseUser > error2:', error2);
        if (error2.code === 'auth/user-not-found') {
          try {
            const authDetails: auth.CreateRequest = email
              ? {
                  displayName: fUser.displayName,
                  email: fUser.email,
                }
              : {
                  displayName: fUser.displayName,
                  phoneNumber: fUser.phoneNumber,
                  email: fUser.email,
                };

            if (uid) authDetails.uid = uid;
            userRecord = await auth().createUser(authDetails);
            isNewAccount = true;
          } catch (error3) {
            logger.error('getFirebaseUser error3:', error3);
          }
        }
      }
    }
  }

  if (userRecord && userRecord.uid) {
    let emailBody = getExistingAccountEmailBody(userRecord);
    if (isNewAccount) {
      emailBody = await getNewAccountEmailBody(userRecord, fUser.email);
    }
    logger.debug('sendNewAccountEmail > emailBody:', emailBody);

    // await sendNewAccountEmail({
    //   subject: 'Welcome to TruckMate',
    //   email: userRecord.email,
    //   body: emailBody,
    //   html: emailBody,
    // });
  }

  return userRecord;
};

export const removeUserAuth = async (uid: string) => {
  try {
    await auth().deleteUser(uid);
  } catch (error) {
    logger.error('USER AUTH DELETION ERROR', uid);
  }
};
