import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';

export interface CLIENT {
  docId: string;

  company: COMPANY_DETAILS;
  companyName: string;
  contactInfo: string;
  displayName: string;
  isActive: boolean;

  email: string;
  phoneNumber: string;
  photoURL: string;

  lowerCase: {
    companyName: string;
  };

  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;
  docRef: DocumentReference<DocumentData, DocumentData>;

  updatedBy: { email: string; authId: string };

  dateCreated: any;
  lastUpdated: any;
}

export interface CLIENT_DETAILS {
  docId: string;
  email: string;
  companyName: string;
  contactInfo: string;
  phoneNumber: string;
  photoURL: string;
}
