import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';

export interface COMPANY {
  docId: string;

  name: string;
  email: string;
  phoneNumber: string;
  regNumber: string;
  description: string;
  country: string;
  timezone: string;
  photoURL: string;
  location: string;

  currency: string;
  currencyList: {
    code: string;
    name: string;
    isPrimary: boolean;
  }[];

  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}

export interface COMPANY_DETAILS {
  docId: string;
  name: string;
  email: string;
  phoneNumber: string;
  regNumber: string;
  photoURL: string;
}
