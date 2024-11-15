import { firestore, auth } from 'firebase-admin';
import { logger } from 'firebase-functions/v1';
import { ADMIN } from '../models/admin';
import Constants from '../Constants';

// GETTERS

export const getAdminByDocId = async (userId: string) => {
  return firestore().collection(Constants.fbAdmins).doc(userId).get();
};

export const getIsAdmin = async (userId: string) => {
  const snapshot = await getAdminByDocId(userId);
  return snapshot.exists;
};

// SETTERS

export const doUpdateAuthClaims = async (authId: string, admin: ADMIN) => {
  try {
    await auth().setCustomUserClaims(authId, {
      isActive: admin.rolesMap.isActive || false,
      isAdmin: admin.rolesMap.isAdmin || false,
      isOwner: admin.rolesMap.isOwner || false,
      companyId: admin.companyId || '',
      roles: admin.roles || [],
    });
  } catch (error) {
    logger.error('doUpdateAuthClaims error:', error);
  }
};

export const doRemoveAuthRoles = async (authId: string) => {
  try {
    await auth().setCustomUserClaims(authId, {
      isActive: false,
      isAdmin: false,
      isHost: false,
      isOwner: false,
      staffType: '',
      roles: [],
    });
  } catch (error) {
    logger.error('ADMIN update error ', error);
  }
};
