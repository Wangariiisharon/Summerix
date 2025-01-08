import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { DEPARTMENT } from '@/models/department';
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

// interface QueryParams {
//   orderBy: 'lastUpdated';
//   direction: 'desc' | 'asc';
//   cursor?: any;
//   max?: number;
// }

interface Props {
  companyId: string;
  docId: string | null;
  params?: PARAMS_MAP;
  isActive?: string;
}

function useDepartments({ companyId, docId, params, isActive }: Props) {
  const [departments, setDepartments] = useState<DEPARTMENT[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // console.debug('useAdmins > details:', { docId, params });

    const constraints = [];
    const colRef = collection(fbDb, Constants.fbDepartments);

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
      (snapshot) => {
        const results = snapshot.docs.map((doc) => {
          const data = doc.data() as DEPARTMENT;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;
          return data;
        });

        setDepartments(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId, isActive, params?.orderBy, params?.direction, params?.cursor, params?.max]);

  return {
    departments,
    count,
  };
}

export default useDepartments;
