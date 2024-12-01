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
import { getAvatarPhoto } from '@/services/utils';

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
      constraints.push(where('rolesMap.isActive', '==', isActive === 'active'));
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
          const data = doc.data() as DEPARTMENT;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;
          data.photoURL = data.photoURL || getAvatarPhoto(data.name);

          return data;
        });

        const results = await Promise.all(promises);
        // console.debug('useAdmins > results:', results.length);
        setDepartments(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId, params, isActive]);

  return {
    departments,
    count,
  };
}

export default useDepartments;
