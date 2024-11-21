import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { COMPANY } from '@/models/company';
import { getAvatarPhoto } from '@/services/utils';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

function useCurrentCompany() {
  const [company, setCompany] = useState<COMPANY | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasAccount, setHasAccount] = useState<boolean>(true);
  const { authUser } = useAuthContext();

  useEffect(() => {
    setCompany(null);
    setIsLoading(true);
    setHasAccount(true);

    if (authUser && authUser.companyId) {
      const docRef = doc(fbDb, Constants.fbCompanies, authUser.companyId);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as COMPANY;
            data.docRef = snapshot.ref;
            data.docId = snapshot.id;
            data.currency = data.currency || 'KES';
            data.photoURL = data.photoURL || getAvatarPhoto(data.name);

            setCompany(data);
          } else {
            // show complete sign-up workflow
            setHasAccount(false);
          }

          setIsLoading(false);
        },
        (error) => {
          console.error('onSnapshot > error:', error);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    }
  }, [authUser]);

  return { company, hasAccount, isLoading };
}

export default useCurrentCompany;
