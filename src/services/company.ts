import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getCompanyByName = (name: string) => {
  const colRef = collection(fbDb, Constants.fbCompanies);
  const queryRef = query(colRef, where('name', '==', name));
  return getDocs(queryRef);
};

export const getCompanyByEmail = (email: string) => {
  const colRef = collection(fbDb, Constants.fbCompanies);
  const queryRef = query(colRef, where('email', '==', email));
  return getDocs(queryRef);
};

export const getCompanyByPhoneNumber = (phoneNumber: string) => {
  const colRef = collection(fbDb, Constants.fbCompanies);
  const queryRef = query(colRef, where('phoneNumber', '==', phoneNumber));
  return getDocs(queryRef);
};
