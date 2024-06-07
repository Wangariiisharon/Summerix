import { useEffect } from "react";
import firebaseApp from "@/firebase/configs";

const useFirebaseAuth = () => {
  useEffect(() => {
    const auth = firebaseApp.auth();
    auth
      .setPersistence(firebaseApp.auth.Auth.Persistence.SESSION)
      .catch(function (error) {
        console.error("Error setting persistence: ", error);
      });
  }, []);

  // Additional auth management as needed
};

export default useFirebaseAuth;
