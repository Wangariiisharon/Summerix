import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { VEHICLE } from '@/models/vehicle';
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

export const getVehicleDrivers = (vehicle: VEHICLE) => {
  const colRef = collection(fbDb, Constants.fbDrivers);
  const queryRef = query(
    colRef,
    where('company.docId', '==', vehicle.company.docId),
    where('vehicle.docId', '==', vehicle.docId),
  );
  return getDocs(queryRef);
};
