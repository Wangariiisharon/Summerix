import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getSupplierByName = (companyId: string, name: string) => {
  const colRef = collection(fbDb, Constants.fbSuppliers);
  const queryRef = query(
    colRef,
    where('company.docId', '==', companyId),
    where('name', '==', name),
  );
  return getDocs(queryRef);
};

export const getSupplierByEmail = (companyId: string, email: string) => {
  const colRef = collection(fbDb, Constants.fbSuppliers);
  const queryRef = query(
    colRef,
    where('company.docId', '==', companyId),
    where('email', '==', email),
  );
  return getDocs(queryRef);
};
