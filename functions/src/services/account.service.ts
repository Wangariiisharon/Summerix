import { firestore } from 'firebase-admin';
import Constants from '../Constants';
import { ACCOUNT } from '../models/account';

// GETTERS

export const getAccountByDocId = async (docId: string) => {
  return firestore().collection(Constants.fbAccounts).doc(docId).get();
};

export const getAccountExists = async (docId: string) => {
  const snapshot = await getAccountByDocId(docId);
  return snapshot.exists;
};

export const getAccountData = async (docId: string) => {
  const snapshot = await getAccountByDocId(docId);
  if (snapshot.exists) {
    const client = snapshot.data() as ACCOUNT;
    client.docId = snapshot.id;
    return client;
  }

  return null;
};
