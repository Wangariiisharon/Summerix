import { DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export interface ADMIN {
  docId: string;
  companyId: string;

  firstName: string;
  lastName: string;
  displayName?: string;

  email: string;
  phoneNumber: string;
  idNumber: string;
  photoURL: string;

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

export const ADMIN_ROLES = {
  canManageAdmins: 'canManageAdmins',
  canManageClients: 'canManageClients',
  canManageVehicles: 'canManageVehicles',
};
