import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getClassByName = (companyId: string, name: string) => {
  const colRef = collection(fbDb, Constants.fbClasses);
  const queryRef = query(
    colRef,
    where('company.docId', '==', companyId),
    where('name', '==', name),
  );
  return getDocs(queryRef);
};
