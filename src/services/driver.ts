import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getDriverByEmail = (companyId: string, email: string) => {
  const colRef = collection(fbDb, Constants.fbDrivers);
  const queryRef = query(
    colRef,
    where('company.docId', '==', companyId),
    where('email', '==', email),
  );
  return getDocs(queryRef);
};

export const getDriverByPhoneNumber = (companyId: string, phoneNumber: string) => {
  const colRef = collection(fbDb, Constants.fbDrivers);
  const queryRef = query(
    colRef,
    where('company.docId', '==', companyId),
    where('phoneNumber', '==', phoneNumber),
  );
  return getDocs(queryRef);
};
