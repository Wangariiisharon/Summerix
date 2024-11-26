import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { PARAMS_MAP } from '@/models/params-map';
import { TRIP } from '@/models/trip';
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

function useTrips({ companyId, docId, params }: Props) {
  const [trips, setTrips] = useState<TRIP[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // console.debug('useTrips > details:', { docId, params });

    const constraints = [];
    const colRef = collection(fbDb, Constants.fbTrips);

    if (docId && docId !== '') {
      constraints.push(where(documentId(), '==', docId));
    }

    if (companyId && companyId !== '') {
      constraints.push(where('company.docId', '==', companyId));
    }

    if (params && params.status && params.status !== '') {
      constraints.push(where('status', '==', params.status));
    }

    getCountFromServer(query(colRef, ...constraints)).then((countSnap) => {
      // console.debug('useTrips > countSnap:', countSnap.data().count);
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
          const data = doc.data() as TRIP;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;

          return data;
        });

        const results = await Promise.all(promises);
        // console.debug('useTrips > results:', results.length);
        setTrips(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId, params]);

  return {
    trips,
    count,
  };
}

export default useTrips;
