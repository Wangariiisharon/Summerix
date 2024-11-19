import { type AppCheck, getToken } from '@firebase/app-check';
import { type User } from 'firebase/auth';
import { AUTH_USER } from '../models/auth-user';

export const getAuthUser = async (fUser: User) => {
  const tokenResult = await fUser.getIdTokenResult();
  // console.debug('getAuthUser > tokenResult:', tokenResult);
  const claims = tokenResult.claims || {};

  return {
    uid: fUser.uid,
    user: fUser, // firebase user
    email: fUser.email ?? null,
    // emailVerified: fUser.emailVerified ?? false,
    phoneNumber: fUser.phoneNumber ?? null,
    displayName: fUser.displayName ?? null,
    photoURL: fUser.photoURL ?? null,
    providerId: fUser.providerId,

    customClaims: claims,
    companyId: claims['companyId'] || '',
    isActive: claims['isActive'] || false,
    isAdmin: claims['isAdmin'] || false,
    isOwner: claims['isOwner'] || false,
    roles: claims['roles'] || [],
  } as AUTH_USER;
};

export const getCanManageRole = (authUser: AUTH_USER | null, role: string) => {
  return authUser && (authUser.isOwner || (authUser.isAdmin && authUser.roles.includes(role)));
};

export const doLoginApiCall = async (idToken: string, appCheck: AppCheck | null) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${idToken}`,
  };

  if (appCheck) {
    const response = await getToken(appCheck, false);
    headers['X-Firebase-AppCheck'] = response.token;
  }

  await fetch('/api/login', {
    method: 'GET',
    headers,
  });
};

export const doLogoutApiCall = async (appCheck: AppCheck | null) => {
  const headers: Record<string, string> = {};

  if (appCheck) {
    const response = await getToken(appCheck, false);
    headers['X-Firebase-AppCheck'] = response.token;
  }

  await fetch('/api/logout', {
    method: 'GET',
    headers,
  });
};
