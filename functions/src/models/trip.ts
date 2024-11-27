import {
  type DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { CLIENT_DETAILS } from './client';
import { COMPANY_DETAILS } from './company';
import { DRIVER_DETAILS } from './driver';
import { VEHICLE_DETAILS } from './vehicle';
import { ADDRESS } from './address';
import { DOCUMENT } from './document';

export interface TRIP {
  docId: string;
  status: string;
  distance: string;

  company: COMPANY_DETAILS;
  client: CLIENT_DETAILS; // requested by
  driver: DRIVER_DETAILS;
  vehicle: VEHICLE_DETAILS;
  from: ADDRESS; // pick-up location details
  to: ADDRESS; // drop-off location details
  cargo: any; // cargo details e.g. size, type, quantity
  documents?: DOCUMENT[];
  // documents: {
  //   interChange: string;
  //   t1Form: string;
  // };

  payments: {
    dealValue: number;
    paidAmount: number;
    remainingAmount: number;
    excessWeightFee: string;
    mileageFee: number;
  };

  fuel: {
    amount: number;
    cost: number;
  };

  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;
  docRef: DocumentReference<DocumentData, DocumentData>;

  createdBy: {
    authId: string;
    email: string;
    displayName: string;
  };
  updatedBy: {
    authId: string;
    email: string;
    displayName: string;
  };

  startedAt: any; // start details e.g. time
  endedAt: any; // end details e.g. time
  dateCreated: any;
  lastUpdated: any;
}

// export enum TRIP_STATUS {
//   booked = 'booked',
//   active = 'active',
//   completed = 'completed',
//   cancelled = 'cancelled',
// }
