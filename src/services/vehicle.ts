import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getVehicleByName = (companyId: string, name: string) => {
  const colRef = collection(fbDb, Constants.fbVehicles);
  const queryRef = query(
    colRef,
    where('company.docId', '==', companyId),
    where('name', '==', name),
  );
  return getDocs(queryRef);
};

export const getVehicleByRegNumber = (companyId: string, regNumber: string) => {
  const colRef = collection(fbDb, Constants.fbVehicles);
  const queryRef = query(
    colRef,
    where('company.docId', '==', companyId),
    where('regNumber', '==', regNumber),
  );
  return getDocs(queryRef);
};
