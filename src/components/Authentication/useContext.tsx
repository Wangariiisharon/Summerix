import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseApp from "@/firebase/configs";

// Define a more specific user type if you need to handle additional data
interface ExtendedUser extends FirebaseUser {
  super_admin?: boolean;
}

interface AuthContextType {
  isSuperAdmin: boolean;
  user: ExtendedUser | null; // Now correctly typed to include FirebaseUser extended with custom fields
  loading: boolean;
  error: any; // Consider using `Error | null` for better type safety
}

const defaultState: AuthContextType = {
  isSuperAdmin: false,
  user: null,
  loading: true,
  error: null,
};

export const AuthContext = createContext<AuthContextType>(defaultState);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<ExtendedUser | null>(null); // Correctly initialize state with a type
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null); // Use Error type for error state

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: FirebaseUser | null) => {
        setLoading(true);
        if (user) {
          try {
            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data() as ExtendedUser; // Assume userData is typed correctly
              setIsSuperAdmin(userData.super_admin || false);
              setUser({
                ...user,
                ...userData, // Combine Firebase user data with extended data
              });
            } else {
              setIsSuperAdmin(false);
              setUser(null);
            }
          } catch (err) {
            console.error("Error fetching user data: ", err);
            setError(
              err instanceof Error ? err : new Error("An error occurred")
            );
            setUser(null);
          }
        } else {
          setIsSuperAdmin(false);
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Ensure clean up on component unmount
  }, []);

  return (
    <AuthContext.Provider value={{ isSuperAdmin, user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
