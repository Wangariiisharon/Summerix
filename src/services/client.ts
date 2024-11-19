import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getClientByEmail = (email: string) => {
  const colRef = collection(fbDb, Constants.fbClients);
  const queryRef = query(colRef, where('email', '==', email));
  return getDocs(queryRef);
};

export const getClientByPhoneNumber = (phoneNumber: string) => {
  const colRef = collection(fbDb, Constants.fbClients);
  const queryRef = query(colRef, where('phoneNumber', '==', phoneNumber));
  return getDocs(queryRef);
};

export const getClientByIdNumber = (idNumber: string) => {
  const colRef = collection(fbDb, Constants.fbClients);
  const queryRef = query(colRef, where('idNumber', '==', idNumber));
  return getDocs(queryRef);
};
