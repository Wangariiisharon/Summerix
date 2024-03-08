import 'firebase/auth';
import firebaseApp from "@/firebase/configs"
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from "next/router";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

// const AuthContext = createContext({
//   isAuthenticated: false,
//   currentUser: null,
//   userId: null as string | null,
//   organisationId: null as string | null, // Add organisationId to the context 
//   userData: null as any, // Add userData to the context
// }); 


interface AuthContextType {
  currentUser: any; // Consider specifying a more precise type
  isAuthenticated: boolean;
  userId: string | null;
  organisationId: string | null;
  userData: any; // Consider specifying a more precise type
}

const defaultContextValue: AuthContextType = {
  currentUser: null,
  isAuthenticated: false,
  userId: null,
  organisationId: null,
  userData: null,
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);



interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user:any) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setUserId(user.uid);

        const firestore = getFirestore(firebaseApp);
        const adminsQuery = query(collection(firestore, 'admins'), where('userId', '==', user.uid));

        try {
          const querySnapshot = await getDocs(adminsQuery);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserData(userData);
            setOrganisationId(userData.organisationId);
          } else {
            console.log('No matching user document found in Firestore.'); 
            
          }
        } catch (error) {
          console.error('Error fetching user details from Firestore:', error);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, userId, organisationId, userData }}>
      {children}
    </AuthContext.Provider>
  );
} 


export function useAuthContext() { 
  return useContext(AuthContext);
} 





