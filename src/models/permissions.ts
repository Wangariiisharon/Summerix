import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';

export interface PERMISSION {
  docId: string;
  Class: Array<string>;
  Client: Array<string>;
  Dashboard: Array<string>;
  Drivers: Array<string>;
  Report: Array<string>;
  Suppliers: Array<string>;
  Trips: Array<string>;
  Vehicles: Array<string>;

  company: COMPANY_DETAILS;

  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}
