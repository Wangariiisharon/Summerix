import {
  type DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { CLIENT_DETAILS } from "./client";

export interface TRIP {
  docId: string;
  status: string;
  distance: string;

  company: any; // COMPANY_DETAILS
  client: CLIENT_DETAILS;
  vehicle: string;

  addedBy: {
    docI: string;
    name: string;
    email: string;
    phonenumber: string;
  };
  requestedBy: {
    docI: string;
    name: string;
    email: string;
    phonenumber: string;
  };

  from: any; // pick-up location details
  to: any; // drop-off location details

  started: any; // start details e.g. time
  ended: any; // end details e.g. time
  cargo: any; // cargo details e.g. size, type, quantity
  documents: {
    interChange: string;
    t1Form: string;
  };

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

  dateCreated: any;
  lastUpdated: any;
}
