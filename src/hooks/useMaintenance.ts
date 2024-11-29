import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { MAINTENANCE } from '@/models/maintenance';
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
  companyId: string;
  docId: string | null;
  params?: PARAMS_MAP;
}

function useMaintenance({ companyId, docId, params }: Props) {
  const [maintenance, setMaintenance] = useState<MAINTENANCE[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // console.debug('useMaintenance > details:', { docId, params });

    const constraints = [];
    const colRef = collection(fbDb, Constants.fbMaintenance);

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
      // console.debug('useMaintenance > countSnap:', countSnap.data().count);
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
          const data = doc.data() as MAINTENANCE;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;

          return data;
        });

        const results = await Promise.all(promises);
        // console.debug('useMaintenance > results:', results.length);
        setMaintenance(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId, params]);

  return {
    maintenance,
    count,
  };
}

export default useMaintenance;
