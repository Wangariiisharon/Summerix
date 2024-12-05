import {
  type DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';
import { VEHICLE_DETAILS } from './vehicle';
import { SUPPLIER_DETAILS } from './supplier';
import { JOBCARD_DETAILS } from './jobcard';

export interface MAINTENANCE {
  docId: string;
  status: string;
  company: COMPANY_DETAILS;
  vehicle: VEHICLE_DETAILS;
  supplier: SUPPLIER_DETAILS;
  jobCard: JOBCARD_DETAILS;
  schedule: {
    startAt: Timestamp;
    endAt: Timestamp;
  };
  notes: string;
  isApproved: boolean;

  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}
