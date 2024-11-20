import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { ADMIN } from '@/models/admin';
import { CLIENT } from '@/models/client';
import { PARAMS_MAP } from '@/models/params-map';
import {
  collection,
  documentId,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface Props {
  client: CLIENT | null;
  params?: PARAMS_MAP;
}

function useAdmins({ client, params }: Props) {
  const [admins, setAdmins] = useState<ADMIN[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // console.debug('useAdmins > details:', { client, params });

    const constraints = [];
    const colRef = collection(fbDb, Constants.fbAdmins);

    if (client && client.docId) {
      constraints.push(where(documentId(), '==', client.docId));
    }

    getCountFromServer(query(colRef, ...constraints)).then((countSnap) => {
      // console.debug('useAdmins > countSnap:', countSnap.data().count);
      setCount(countSnap.data().count);
    });

    if (params) {
      params.orderBy = params.orderBy || 'lastUpdated';
      params.direction = params.direction || 'desc';
      constraints.push(orderBy(params.orderBy, params.direction));

      if (params.cursor) constraints.push(startAfter(params.cursor));
      if (params.max) constraints.push(limit(params.max));
    }

    const unsubscribe = onSnapshot(
      query(colRef, ...constraints),
      async (snapshot) => {
        const promises = snapshot.docs.map(async (doc) => {
          const data = doc.data() as ADMIN;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;
          data.displayName = `${data.firstName} ${data.lastName}`;
          data.photoURL =
            data.photoURL || `https://ui-avatars.com/api/?name=${data.displayName}&size=300`;

          return data;
        });

        const results = await Promise.all(promises);
        // console.debug('useAdmins > results:', results.length);
        setAdmins(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [client, params]);

  return {
    admins,
    count,
  };
}

export default useAdmins;
