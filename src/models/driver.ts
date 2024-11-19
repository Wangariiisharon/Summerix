import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';

export interface DRIVER {
  docId: string;

  firstName: string;
  lastName: string;
  displayName: string;

  email: string;
  phoneNumber: string;
  idNumber: string;
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

export interface DRIVER_DETAILS {
  docId: string;
  email: string;
  phoneNumber: string;
  displayName: string;
}
