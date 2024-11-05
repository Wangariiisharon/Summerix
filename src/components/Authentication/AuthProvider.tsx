import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  limit,
} from "firebase/firestore";
import { fbAuth, fbDb } from "@/firebase/configs";
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
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  currentAdmin: AdminUser | null;
  currentUser: User | null;
  userId: string | null;
  organisationId: string | null;
  userClaims: ParsedToken | null;
  departmentData: any | null;
  hasPermission: (permissionKey: string) => boolean;
}

interface ParsedToken {
  role?: string;
  super_admin?: boolean;
  departmentId?: string;
  [key: string]: any;
}

const defaultContextValue: AuthContextType = {
  isAuthenticated: false,
  isSuperAdmin: false,
  currentAdmin: null,
  currentUser: null,
  userId: null,
  organisationId: null,
  userClaims: null,
  departmentData: null,
  hasPermission: () => false,
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userClaims, setUserClaims] = useState<ParsedToken | null>(null);
  const [departmentData, setDepartmentData] = useState<any | null>(null);

  const router = useRouter();

  useEffect(() => {
    setCurrentUser(null);
    setUserClaims(null);

    const unsubscribe = onAuthStateChanged(fbAuth, async (fbUser) => {
      console.debug("onAuthStateChanged > fbUser:", { uid: fbUser?.uid });

      if (fbUser) {
        setCurrentUser(fbUser);

        const tokenResult = await fbUser.getIdTokenResult();
        console.debug("AuthProvider > tokenResult:", {
          claims: tokenResult.claims,
        });
        setUserClaims(tokenResult.claims || {});
      } else {
        console.debug("AuthProvider > redirect to signin");
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setCurrentAdmin(null);

    // Fetch department data if departmentId exists
    if (currentUser && currentUser.uid) {
      const colRef = collection(fbDb, "admins");
      const unsubscribe = onSnapshot(
        query(colRef, where("userId", "==", currentUser.uid), limit(1)),
        async (snapshot) => {
          const data = snapshot.docs[0].data() as AdminUser;
          data.docId = snapshot.docs[0].id;

          data.initials =
            data.firstname?.charAt(0)?.toUpperCase() +
            data.lastname?.charAt(0)?.toUpperCase();
          console.debug("AuthProvider > adminUser:", data);

          setCurrentAdmin(data);
        }
      );
      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    setDepartmentData(null);

    // Fetch department data if departmentId exists
    if (userClaims && userClaims.departmentId) {
      const docRef = doc(fbDb, "departments", userClaims.departmentId);
      const unsubscribe = onSnapshot(docRef, async (snapshot) => {
        if (snapshot.exists()) {
          setDepartmentData(snapshot.data());
        }
      });
      return () => unsubscribe();
    }
  }, [userClaims]);

  const hasPermission = (permissionKey: string) =>
    departmentData?.permissions.includes(permissionKey) ?? false;

  const isSuperAdmin = useMemo(() => {
    return currentAdmin?.super_admin ?? false;
  }, [currentAdmin]);

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        currentUser,
        isAuthenticated: !!currentUser,
        userId: currentUser?.uid || null,
        organisationId: currentAdmin?.organisationId || null,
        userClaims,
        departmentData,
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
