import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { PARAMS_MAP } from '@/models/params-map';
import { SUPPLIER } from '@/models/supplier';
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

function useSuppliers({ companyId, docId, params }: Props) {
  const [suppliers, setSuppliers] = useState<SUPPLIER[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const constraints = [];
    const colRef = collection(fbDb, Constants.fbSuppliers);

    if (docId && docId !== '') {
      constraints.push(where(documentId(), '==', docId));
    }

    if (companyId && companyId !== '') {
      constraints.push(where('company.docId', '==', companyId));
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
          const data = doc.data() as SUPPLIER;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;
          data.photoURL = data.photoURL || getAvatarPhoto(data.name);

          return data;
        });

        const results = await Promise.all(promises);
        setSuppliers(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId, params]);

  return {
    suppliers,
    count,
  };
}

export default useSuppliers;
