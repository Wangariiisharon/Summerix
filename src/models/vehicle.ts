/* eslint-disable no-unused-vars */
import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';

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

  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;
  docRef: DocumentReference<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
}

export interface VEHICLE_DETAILS {
  docId: string;
  name: string;
  regNumber: string;
  companyId: string;
}

export enum VEHICLE_STATUS {
  available = 'available',
  onRoute = 'on-route',
  outOfService = 'out-of-service',
  underMaintenance = 'under-maintenance',
}
