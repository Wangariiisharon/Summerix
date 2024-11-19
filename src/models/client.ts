import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';

export interface CLIENT {
  docId: string;

  firstName: string;
  lastName: string;
  displayName: string;

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

export interface CLIENT_DETAILS {
  docId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
