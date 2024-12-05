import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';

export interface JOBCARD {
  docId: string;
  name: string;
  company: COMPANY_DETAILS;
  isArchived: boolean;
  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}
export interface JOBCARD_DETAILS {
  docId: string;
  name: string;
  isArchived: boolean;
}

import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';

export interface JOBCARD {
  docId: string;
  name: string;
  company: COMPANY_DETAILS;
  isArchived: boolean;

  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}
