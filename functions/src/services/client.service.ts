import { firestore } from 'firebase-admin';
import Constants from '../Constants';
import { CLIENT } from '../models/client';

// GETTERS

export const getClientByDocId = async (docId: string) => {
  return firestore().collection(Constants.fbClients).doc(docId).get();
};

export const getClientExists = async (docId: string) => {
  const snapshot = await getClientByDocId(docId);
  return snapshot.exists;
};

export const getClientData = async (docId: string) => {
  const snapshot = await getClientByDocId(docId);
  if (snapshot.exists) {
    const client = snapshot.data() as CLIENT;
    client.docId = snapshot.id;
    return client;
  }

  return null;
};
