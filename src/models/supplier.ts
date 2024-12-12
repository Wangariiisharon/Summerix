import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';
import { DOCUMENT } from './document';

export interface SUPPLIER {
  docId: string;

  name: string;
  email: string;
  contacts: {
    name: string;
    phoneNumber: string;
  }[];
  company: COMPANY_DETAILS;
  documents: DOCUMENT[];
  typeOfSupplies: string; // select options
  paymentTerms: string; // select options
  taxRegNumber: string;
  currency: string;
  photoURL: string;
  notes: string;

  lowerCase: {
    name: string;
  };

  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}

export interface SUPPLIER_DETAILS {
  docId: string;
  name: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
}
