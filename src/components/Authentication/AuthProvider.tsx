import 'firebase/auth';
import firebaseApp from "@/firebase/configs"
import { getAuth } from 'firebase/auth';
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

const AuthContext = createContext({
  isAuthenticated: false,
  currentUser: null,
  userId: null as string | null,
  organisationId: null as string | null, // Add organisationId to the context 
  userData: null as any, // Add userData to the context

});

type Props = {
  children: any;
};

export function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [organisationId, setOrganisationId] = useState<string | null>(null); // State for organisationId 
  const [userData, setUserData] = useState<any>(null); // State for userData


  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(false);
    const fbAuth = getAuth(firebaseApp);

    if (typeof window !== "undefined") {
      const unsubscribe = fbAuth.onAuthStateChanged(async (user) => {
        console.log('onAuthStateChanged > user:', user);

        if (user) {
          console.log('User is authenticated:', user.toJSON());
          const userId = user.uid;
          console.log("Current User ID:", userId);

          // Fetch additional details from Firestore, including organisationId
          const firestore = getFirestore(firebaseApp);

          try {
            const adminsCollection = collection(firestore, 'admins');
            const querySnapshot = await getDocs(query(adminsCollection, where('userId', '==', userId)));
          
            if (!querySnapshot.empty) {
              const userDocSnapshot = querySnapshot.docs[0]; // Assuming there is only one document for a given user
              const userData = userDocSnapshot.data(); 
              setUserData(userData);

              console.log('Additional user details from Firestore:', userData);
              console.log('Organisation ID:', userData.organisationId);
          
              // Set organisationId to the state
              setOrganisationId(userData.organisationId);
              console.log("User Data Organisation ID:", userData.organisationId);
          
            } else {
              console.log('No matching user document found in Firestore for userId:', userId);
            }
          } catch (error) {
            console.error('Error fetching user details from Firestore:', error);
          }

          setUserId(userId); // Set the userId state
          setCurrentUser(user.toJSON());
          setIsAuthenticated(true);
        } else {
          console.log('User is not authenticated.');
          setCurrentUser(null);
          setIsAuthenticated(false);
          router.push("/auth");
        }
      });

      return () => unsubscribe();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, userId, organisationId,userData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
