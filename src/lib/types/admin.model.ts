export interface AdminUser {
  docId: string;
  email: string;
  firstname: string;
  lastname: string;
  displayName?: string;
  initials?: string;
  phonenumber: string;
  organisationId: string;
  fcmToken: string;
  super_admin: boolean;
  adminId: string;
  userId: string;
  department: string;
  additionalPermissions: string[];
}
