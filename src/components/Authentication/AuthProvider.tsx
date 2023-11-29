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
    const fbAuth = getAuth(firebaseApp);
  
    if (typeof window !== "undefined") {
      const unsubscribe = fbAuth.onAuthStateChanged(async (user) => {
        console.log('onAuthStateChanged > user:', user);
  
        if (user) {
          console.log('User is authenticated:', user.toJSON());
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
    <AuthContext.Provider value={{ currentUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}