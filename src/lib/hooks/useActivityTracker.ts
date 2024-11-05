import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { fbAuth } from "@/firebase/configs";

export const useActivityTracker = (timeout = 300000) => {
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let timer = setTimeout(() => {
      signOut(fbAuth).then(() => {
        setModalOpen(true);
      });
    }, timeout);

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        signOut(fbAuth).then(() => {
          setModalOpen(true);
        });
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

  return { isModalOpen, setModalOpen };
};
