import { type DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore';
import { COMPANY_DETAILS } from './company';

export interface DEPARTMENT {
  docId: string;
  name: string;
  members: number;
  photoURL: string;
  displayName?: string;
  company: COMPANY_DETAILS;
  roles: Array<string>;
  rolesMap: {
    companyId: string;
    isActive: boolean;
  };

  docRef: DocumentReference<DocumentData, DocumentData>;
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>;

  dateCreated: any;
  lastUpdated: any;
  createdBy: { email: string; authId: string };
  updatedBy: { email: string; authId: string };
}
export const DEPARTMETS_ROLES = {
  canManageAdmins: 'canManageAdmins',
  canManageClients: 'canManageClients',
  canManageVehicles: 'canManageVehicles',
  canManageTrips: 'canManageTrips',
  canManageDrivers: 'canManageDrivers',
};
