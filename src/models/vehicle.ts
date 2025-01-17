/* eslint-disable no-unused-vars */
import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';
import { DRIVER_DETAILS } from './driver';
import { DOCUMENT } from './document';
import { CLASS_DETAILS } from './class';

export interface VEHICLE {
  docId: string;

  name: string;
  regNumber: string;
  make: string;
  model: string;
  yom: string;
  status: string; // 'available', 'on-route', etc
  photoURL: string;
  isArchived: boolean;
  company: COMPANY_DETAILS;
  class: CLASS_DETAILS;
  driver: DRIVER_DETAILS | null;
  documents?: DOCUMENT[];

  type: string;
  cargo: {
    capacity: number;
    type: string;
  };
  ownership: {
    status: string;
    entity: string;
  };
  purchasePrice: number;

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

export enum VEHICLE_STATUS {
  available = 'available',
  onRoute = 'on-route',
  outOfService = 'out-of-service',
  underMaintenance = 'under-maintenance',
}
