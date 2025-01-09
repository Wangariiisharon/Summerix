import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { JOBCARD } from '@/models/jobcard';
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
  isActive?: string;
}

function useJobcards({ companyId, docId, params }: Props) {
  const [jobcards, setJobcards] = useState<JOBCARD[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const constraints = [];
    const colRef = collection(fbDb, Constants.fbJobCards);

    if (docId && docId !== '') {
      constraints.push(where(documentId(), '==', docId));
    }

    if (companyId && companyId !== '') {
      constraints.push(where('company.docId', '==', companyId));
    }

    constraints.push(where('isArchived', '==', false));

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
          const data = doc.data() as JOBCARD;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;

          return data;
        });

        const results = await Promise.all(promises);
        setJobcards(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId, params]);

  return {
    jobcards,
    count,
  };
}

export default useJobcards;
