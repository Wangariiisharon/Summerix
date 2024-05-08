import { useEffect } from "react";
import { signOut } from "firebase/auth";
import firebaseApp, { fbDb, auth } from "@/firebase/configs";

export const useActivityTracker = (timeout = 300000) => {
  // default timeout 5 minutes
  useEffect(() => {
    let timer = setTimeout(() => {
      signOut(auth).then(() =>
        alert("You have been logged out due to inactivity.")
      );
    }, timeout);

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        signOut(auth).then(() =>
          alert("You have been logged out due to inactivity.")
        );
      }, timeout);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [timeout]);
};
