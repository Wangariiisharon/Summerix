import {
  type DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';
import { VEHICLE_DETAILS } from './vehicle';
import { SUPPLIER_DETAILS } from './supplier';

export interface MAINTENANCE {
  docId: string;
  status: string; // select options
  company: COMPANY_DETAILS;
  vehicle: VEHICLE_DETAILS;
  supplier: SUPPLIER_DETAILS;
  jobCard: string;
  schedule: {
    startAt: Timestamp;
    endAt: Timestamp;
  };
  notes: string;

  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}

export enum MAINTENANCE_STATUS {
  pending = 'pending',
  planned = 'planned',
  completed = 'completed',
}
