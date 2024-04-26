// import React, {
//   ReactNode,
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { useRouter } from "next/router";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import firebaseApp from "@/firebase/configs";
// interface User {
//   uid: string;
//   email?: string | null; // Allows null for compatibility with Firebase types
// }
// interface AdminData {
//   organisationId: string;
//   roles: string[];
// }
// interface AuthContextType {
//   currentUser: User | null;
//   isAuthenticated: boolean;
//   userId: string | null;
//   organisationId: string | null;
//   userData: AdminData | null;
// }
// const defaultContextValue: AuthContextType = {
//   currentUser: null,
//   isAuthenticated: false,
//   userId: null,
//   organisationId: null,
//   userData: null,
// };
// export const AuthContext = createContext<AuthContextType>(defaultContextValue);
// interface Props {
//   children: ReactNode;
// }
// export function AuthProvider({ children }: Props) {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [organisationId, setOrganisationId] = useState<string | null>(null);
//   const [userData, setUserData] = useState<AdminData | null>(null);
//   const router = useRouter();
//   useEffect(() => {
//     const auth = getAuth(firebaseApp);
//     // Make sure to declare the callback as async here
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentUser(user);
//         setIsAuthenticated(true);
//         setUserId(user.uid);
//         const firestore = getFirestore(firebaseApp);
//         const adminsQuery = query(
//           collection(firestore, "admins"),
//           where("userId", "==", user.uid)
//         );
//         try {
//           // Now this await is valid because it's inside an async function
//           const querySnapshot = await getDocs(adminsQuery);
//           if (!querySnapshot.empty) {
//             const userData = querySnapshot.docs[0].data() as AdminData;
//             setUserData(userData);
//             setOrganisationId(userData.organisationId);
//           } else {
//             console.log("No matching user document found in Firestore.");
//           }
//         } catch (error) {
//           console.error("Error fetching user details from Firestore:", error);
//         }
//       } else {
//         setCurrentUser(null);
//         setIsAuthenticated(false);
//         router.push("/auth");
//       }
//     });
//     return () => {
//       if (unsubscribe) unsubscribe(); // Proper cleanup on component unmount
//     };
//   }, []);
//   return (
//     <AuthContext.Provider
//       value={{ currentUser, isAuthenticated, userId, organisationId, userData }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }
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
