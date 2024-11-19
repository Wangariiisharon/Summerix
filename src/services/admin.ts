import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getAdminByEmail = (email: string) => {
  const colRef = collection(fbDb, Constants.fbAdmins);
  const queryRef = query(colRef, where('email', '==', email));
  return getDocs(queryRef);
};

export const getAdminByPhoneNumber = (phoneNumber: string) => {
  const colRef = collection(fbDb, Constants.fbAdmins);
  const queryRef = query(colRef, where('phoneNumber', '==', phoneNumber));
  return getDocs(queryRef);
};
