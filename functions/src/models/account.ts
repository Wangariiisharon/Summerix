import { DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { COMPANY_DETAILS } from './company';

export interface ACCOUNT {
  docId: string;

  firstName: string;
  lastName: string;
  displayName: string;

  email: string;
  phoneNumber: string;
  idNumber: string;
  currency: string;
  photoURL: string;
  company: COMPANY_DETAILS;

  lowerCase: {
    firstName: string;
    lastName: string;
  };

  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;
  docRef: DocumentReference<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
}

export interface CLIENT_DETAILS {
  docId: string;
  email: string;
  displayName: string;
  phoneNumber: string;
}
