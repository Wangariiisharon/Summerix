import 'firebase/auth';
import firebaseApp from "@/firebase/configs"
import { getAuth } from 'firebase/auth';
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  isAuthenticated: false,
  currentUser: null,
});

type Props = {
  children: any;   
};

export function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {  
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      const fbAuth = getAuth(firebaseApp);
      const unsubscribe = fbAuth.onAuthStateChanged(async (user) => {
        console.log('onAuthStateChanged > user:', user);
        
        setCurrentUser(user?.toJSON());
  
        if (user && user?.uid) {
          setIsAuthenticated(true);
        } else {
          router.push("/auth");
        }
      });
  
      return () => unsubscribe();
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
