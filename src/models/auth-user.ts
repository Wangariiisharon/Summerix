import { type User, type UserInfo } from 'firebase/auth';

type Claims = {
  roles: string[];
  companyId: string;
  isActive: boolean;
  isAdmin: boolean;
  isOwner: boolean;
};

export interface AUTH_USER extends UserInfo {
  customClaims: Claims | any;
  user: User | null;
  isActive: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  roles: string[];
  companyId: string;
}
