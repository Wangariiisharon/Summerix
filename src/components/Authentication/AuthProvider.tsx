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

interface User {
  uid: string;
  email?: string | null;
}

interface AdminData {
  organisationId: string;
  departments: string[];
  super_admin: boolean;
  email: string;
  userId: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  userId: string | null;
  organisationId: string | null;
  userData: AdminData | null;
  hasPermission: (permissionKey: string) => boolean;
  isSuperAdmin: boolean;
}

const defaultContextValue: AuthContextType = {
  currentUser: null,
  isAuthenticated: false,
  userId: null,
  organisationId: null,
  userData: null,
  hasPermission: () => false,
  isSuperAdmin: false,
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AdminData | null>(null);

  const hasPermission = (permissionKey: string) =>
    userData?.departments.includes(permissionKey) ?? false;
  // const isSuperAdmin = userData?.super_admin ?? false; // Ensure boolean type
  const isSuperAdmin = useMemo(() => {
    return userData?.super_admin ?? false;
  }, [userData]);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
        } else {
          console.log("No admin data found.");
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
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
