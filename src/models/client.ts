import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';

export interface CLIENT {
  docId: string;

  company: COMPANY_DETAILS;
  firstName: string;
  lastName: string;
  displayName: string;
  isActive: boolean;

  email: string;
  phoneNumber: string;
  idNumber: string;
  currency: string;
  photoURL: string;

  lowerCase: {
    firstName: string;
    lastName: string;
  };

  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;
  docRef: DocumentReference<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
}
