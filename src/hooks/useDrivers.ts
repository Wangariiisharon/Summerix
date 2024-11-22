import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { DRIVER } from '@/models/driver';
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
}

function useDrivers({ companyId, docId, params }: Props) {
  const [drivers, setDrivers] = useState<DRIVER[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // console.debug('useDrivers > details:', { docId, params });

    const constraints = [];
    const colRef = collection(fbDb, Constants.fbDrivers);

    if (docId && docId !== '') {
      constraints.push(where(documentId(), '==', docId));
    }

    if (companyId && companyId !== '') {
      constraints.push(where('company.docId', '==', companyId));
    }

    getCountFromServer(query(colRef, ...constraints)).then((countSnap) => {
      // console.debug('useDrivers > countSnap:', countSnap.data().count);
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
          const data = doc.data() as DRIVER;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;
          data.displayName = `${data.firstName} ${data.lastName}`;
          data.photoURL = data.photoURL || getAvatarPhoto(data.displayName);

          return data;
        });

        const results = await Promise.all(promises);
        // console.debug('useDrivers > results:', results.length);
        setDrivers(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId, params]);

  return {
    drivers,
    count,
  };
}

export default useDrivers;
