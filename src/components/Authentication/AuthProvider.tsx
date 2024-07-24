// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useMemo,
// } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import firebaseApp from "@/firebase/configs";
// import { AdminUser } from "@/lib/types/admin.model";
// import { useRouter } from "next/navigation";

// interface User {
//   uid: string;
//   email?: string | null;
// }

// interface AdminData {
//   docId: string;
//   organisationId: string;
//   departments: string[];
//   super_admin: boolean;
//   email: string;
//   userId: string;
// }

// interface AuthContextType {
//   isAuthenticated: boolean;
//   isSuperAdmin: boolean;
//   currentAdmin: AdminUser | null;
//   currentUser: User | null;
//   userId: string | null;
//   organisationId: string | null;
//   userData: AdminData | null;
//   userClaims: ParsedToken | null; // Updated this line
//   hasPermission: (permissionKey: string) => boolean;
// }
// interface ParsedToken {
//   role?: string;
//   super_admin?: boolean;
//   [key: string]: any;
// }

// const defaultContextValue: AuthContextType = {
//   isAuthenticated: false,
//   isSuperAdmin: false,
//   currentAdmin: null,
//   currentUser: null,
//   userId: null,
//   organisationId: null,
//   userData: null,
//   userClaims: null, // Add this line
//   hasPermission: () => false,
// };

// export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [userData, setUserData] = useState<AdminData | null>(null);
//   const [userClaims, setUserClaims] = useState<ParsedToken | null>(null);

//   const router = useRouter();

//   const hasPermission = (permissionKey: string) =>
//     userData?.departments.includes(permissionKey) ?? false;

//   const isSuperAdmin = useMemo(() => {
//     return userData?.super_admin ?? false;
//   }, [userData]);

//   useEffect(() => {
//     const auth = getAuth(firebaseApp);
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentUser(user);

//         try {
//           // Force refresh the token to get updated claims
//           await user.getIdToken(true);
//           const token = await user.getIdToken();
//           const uid = user.uid;

//           console.log("User ID Token:", token);

//           const res = await fetch(`/api/user?uid=${uid}`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });

//           console.log("API Response:", res);

//           if (!res.ok) {
//             throw new Error("Failed to fetch user data");
//           }

//           const data = await res.json();
//           setUserData(data);

//           // Assuming custom claims are part of the user data fetched from the API
//           const userClaims = data.customClaims || {};
//           setUserClaims(userClaims);

//           // Derive initials from firstname and lastname
//           const adminUser = data as AdminUser;
//           adminUser.initials =
//             data.firstname?.charAt(0)?.toUpperCase() +
//             data.lastname?.charAt(0)?.toUpperCase();
//           setCurrentAdmin(adminUser);

//           console.log("UserData from API:", data);
//           console.log("userClaims Auth context:", userClaims);
//         } catch (error) {
//           console.error(error);
//           setCurrentUser(null);
//           setUserData(null);
//           setUserClaims(null); // Reset userClaims
//         }
//       } else {
//         console.log("redirect to signin page");
//         setCurrentUser(null);
//         setUserData(null);
//         setUserClaims(null); // Reset userClaims
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   return (
//     <AuthContext.Provider
//       value={{
//         currentAdmin,
//         currentUser,
//         isAuthenticated: !!currentUser,
//         userId: currentUser?.uid || null,
//         organisationId: userData?.organisationId || null,
//         userData,
//         userClaims, // Add this line
//         hasPermission,
//         isSuperAdmin,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export function useAuthContext() {
//   return useContext(AuthContext);
// }
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
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
  userData: null,
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
  const [userData, setUserData] = useState<AdminData | null>(null);
  const [userClaims, setUserClaims] = useState<ParsedToken | null>(null);
  const [departmentData, setDepartmentData] = useState<any | null>(null);

  const router = useRouter();

  const hasPermission = (permissionKey: string) =>
    departmentData?.permissions.includes(permissionKey) ?? false;

  const isSuperAdmin = useMemo(() => {
    return userData?.super_admin ?? false;
  }, [userData]);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        try {
          await user.getIdToken(true);
          const token = await user.getIdToken();
          const uid = user.uid;

          const res = await fetch(`/api/user?uid=${uid}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await res.json();
          setUserData(data);

          const userClaims = data.customClaims || {};
          setUserClaims(userClaims);

          if (userClaims.departmentId) {
            const firestore = getFirestore(firebaseApp);
            const departmentDocRef = doc(
              firestore,
              "departments",
              userClaims.departmentId
            );
            const departmentDoc = await getDoc(departmentDocRef);

            if (departmentDoc.exists()) {
              setDepartmentData(departmentDoc.data());
            } else {
              setDepartmentData(null);
            }
          } else {
            setDepartmentData(null);
          }

          const adminUser = data as AdminUser;
          adminUser.initials =
            data.firstname?.charAt(0)?.toUpperCase() +
            data.lastname?.charAt(0)?.toUpperCase();
          setCurrentAdmin(adminUser);
        } catch (error) {
          console.error(error);
          setCurrentUser(null);
          setUserData(null);
          setUserClaims(null);
          setDepartmentData(null);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setUserClaims(null);
        setDepartmentData(null);
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
