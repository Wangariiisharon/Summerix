import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { PARAMS_MAP } from '@/models/params-map';
import { CLASS } from '@/models/class';
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

function useClass({ companyId, docId, params }: Props) {
  const [classes, setClasses] = useState<CLASS[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // console.debug('useSuppliers > details:', { docId, params });

    const constraints = [];
    const colRef = collection(fbDb, Constants.fbClasses);

    if (docId && docId !== '') {
      constraints.push(where(documentId(), '==', docId));
    }

    if (companyId && companyId !== '') {
      constraints.push(where('company.docId', '==', companyId));
    }

    getCountFromServer(query(colRef, ...constraints)).then((countSnap) => {
      // console.debug('useSuppliers > countSnap:', countSnap.data().count);
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
          const data = doc.data() as CLASS;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;

          return data;
        });

        const results = await Promise.all(promises);
        setClasses(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId, params]);

  return {
    classes,
    count,
  };
}

export default useClass;
