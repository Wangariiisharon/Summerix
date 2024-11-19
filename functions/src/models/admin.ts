import { DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { COMPANY_DETAILS } from './company';

export interface ADMIN {
  docId: string;
  // companyId: string;

  firstName: string;
  lastName: string;
  displayName?: string;

  email: string;
  phoneNumber: string;
  idNumber: string;
  photoURL: string;
  company: COMPANY_DETAILS;

  roles: Array<string>;
  rolesMap: {
    companyId: string;
    isActive: boolean;
    isAdmin: boolean;
    isOwner: boolean;
  };

  lowerCase: {
    firstName: string;
    lastName: string;
  };

  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}

export interface ADMIN_DETAILS {
  docId: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  companyId: string;
}
