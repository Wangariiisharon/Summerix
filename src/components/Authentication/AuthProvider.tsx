import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import firebaseApp from "@/firebase/configs";
import { AdminUser } from "@/lib/types/admin.model";
import { useRouter } from "next/navigation";

interface User {
  uid: string;
  email?: string | null;
}

interface AdminData {
  docId: string;
  organisationId: string;
  departments: string[];
  super_admin: boolean;
  email: string;
  userId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  currentAdmin: AdminUser | null;
  currentUser: User | null;
  userId: string | null;
  organisationId: string | null;
  userData: AdminData | null;
  hasPermission: (permissionKey: string) => boolean;
}
type UserClaims = {
  userId?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  status?: string;
  super_admin?: boolean;
  organisationId?: string;
  inviterUid?: string;
  adminId?: string;
  fcmToken?: string;
  phonenumber?: string;
  additionalPermissions?: string[];
  department?: string;
  [key: string]: any; // Allow additional properties
};

const defaultContextValue: AuthContextType = {
  isAuthenticated: false,
  isSuperAdmin: false,
  currentAdmin: null,
  currentUser: null,
  userId: null,
  organisationId: null,
  userData: null,
  hasPermission: () => false,
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AdminData | null>(null);
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);

  const router = useRouter();

  const hasPermission = (permissionKey: string) =>
    userData?.departments.includes(permissionKey) ?? false;

  const isSuperAdmin = useMemo(() => {
    return userData?.super_admin ?? false;
  }, [userData]);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // console.log("onAuthStateChanged > user:", user);

      if (user) {
        setCurrentUser(user);

        const firestore = getFirestore(firebaseApp);
        const adminsQuery = query(
          collection(firestore, "admins"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(adminsQuery);
        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data() as AdminData);

          const data = querySnapshot.docs[0].data() as AdminUser;
          data.docId = querySnapshot.docs[0].id;

          // derive initials from firstname and lastname
          data.initials =
            data.firstname?.charAt(0)?.toUpperCase() +
            data.lastname?.charAt(0)?.toUpperCase();
          setCurrentAdmin(data);
        }

        const tokenResult = await user.getIdTokenResult(true);
        setCurrentUser(user);
        setUserClaims(tokenResult.claims);
        console.log("userClaims", userClaims);
      } else {
        // redirect to signin page
        router.push("/signin");
        setCurrentUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        currentUser,
        isAuthenticated: !!currentUser,
        userId: currentUser?.uid || null,
        organisationId: userData?.organisationId || null,
        userData,
        hasPermission,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  return useContext(AuthContext);
}
