import {
  type DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { COMPANY_DETAILS } from './company';
import { DRIVER_DETAILS } from './driver';

export interface VEHICLE {
  docId: string;

  name: string;
  regNumber: string;
  make: string;
  model: string;
  yom: string;
  status: boolean; // 'available', 'on-route', etc
  photoURL: string;
  isArchived: boolean;
  company: COMPANY_DETAILS;
  driver: DRIVER_DETAILS | null;

  type: string;
  cargo: {
    capacity: number;
    type: string;
  };
  ownership: {
    status: string;
    entity: string;
  };

  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;
  docRef: DocumentReference<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
}

export interface VEHICLE_DETAILS {
  docId: string;
  name: string;
  regNumber: string;
  photoURL: string;
}
