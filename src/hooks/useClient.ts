import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { CLIENT } from '@/models/client';
import { PARAMS_MAP } from '@/models/params-map';
import { getAvatarPhoto } from '@/services/utils';
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
  companyId: string;
  docId: string | null;
  params?: PARAMS_MAP;
  isActive?: string;
}

function useClient({ companyId, docId, params, isActive }: Props) {
  const [clients, setClients] = useState<CLIENT[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const constraints = [];
    const colRef = collection(fbDb, Constants.fbClients);

    if (docId && docId !== '') {
      constraints.push(where(documentId(), '==', docId));
    }

    if (companyId && companyId !== '') {
      constraints.push(where('company.docId', '==', companyId));
    }

    if (isActive && isActive !== '') {
      constraints.push(where('isActive', '==', isActive === 'active'));
    }

    getCountFromServer(query(colRef, ...constraints)).then((countSnap) => {
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
          const data = doc.data() as CLIENT;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;
          data.displayName = `${data.firstName} ${data.lastName}`;
          data.photoURL = data.photoURL || getAvatarPhoto(data.displayName);

          return data;
        });

        const results = await Promise.all(promises);
        setClients(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId, isActive, params]);

  return {
    clients,
    count,
  };
}

export default useClient;
