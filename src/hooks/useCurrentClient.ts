import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { CLIENT } from '@/models/client';
import { getAvatarPhoto } from '@/services/utils';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

function useCurrentClient() {
  const [client, setClient] = useState<CLIENT | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasAccount, setHasAccount] = useState<boolean>(true);
  const { authUser } = useAuthContext();

  useEffect(() => {
    setClient(null);
    setIsLoading(true);
    setHasAccount(true);

    if (authUser && authUser.uid) {
      const docRef = doc(fbDb, Constants.fbClients, authUser.uid);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as CLIENT;
            data.docRef = snapshot.ref;
            data.docId = snapshot.id;
            data.firstName = data.firstName || '';
            data.lastName = data.lastName || '';
            data.displayName = `${data.firstName} ${data.lastName}`;
            data.photoURL = data.photoURL || getAvatarPhoto(data.displayName);
            data.currency = data.currency || 'KES';

            setClient(data);
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

  return { client, hasAccount, isLoading };
}

export default useCurrentClient;
