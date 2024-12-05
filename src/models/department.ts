import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';

export interface DEPARTMENT {
  docId: string;
  name: string;
  company: COMPANY_DETAILS;
  roles: Array<string>;
  isActive: boolean;

  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}

export interface DEPARTMENT_DETAILS {
  docId: string;
  name: string;
  roles: string[];
}
