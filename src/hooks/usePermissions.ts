import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { PERMISSION } from '@/models/permissions';
import {
  collection,
  documentId,
  getCountFromServer,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface Props {
  companyId: string;
  docId: string | null;
}

function usePermissions({ companyId, docId }: Props) {
  const [permissions, setPermissions] = useState<PERMISSION[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const constraints = [];
    const colRef = collection(fbDb, Constants.fbPermissions);

    if (docId && docId !== '') {
      constraints.push(where(documentId(), '==', docId));
    }

    if (companyId && companyId !== '') {
      constraints.push(where('company.docId', '==', companyId));
    }

    getCountFromServer(query(colRef, ...constraints)).then((countSnap) => {
      // console.debug('useAdmins > countSnap:', countSnap.data().count);
      setCount(countSnap.data().count);
    });

    const unsubscribe = onSnapshot(
      query(colRef, ...constraints),
      async (snapshot) => {
        const promises = snapshot.docs.map(async (doc) => {
          const data = doc.data() as PERMISSION;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;
          return data;
        });

        const results = await Promise.all(promises);
        // console.debug('useAdmins > results:', results.length);
        setPermissions(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [companyId, docId]);

  return {
    permissions,
    count,
  };
}

export default usePermissions;
