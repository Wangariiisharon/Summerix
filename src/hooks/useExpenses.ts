import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { fbDb } from '@/firebase/configs';
import { EXPENSE } from '@/models/expense';

interface UseExpensesParams {
  companyId: string;
  docId: string | null;
  params: {
    max: number;
    orderBy: string;
    direction: 'asc' | 'desc';
    cursor?: any;
  };
}

export default function useExpenses({ companyId, docId, params }: UseExpensesParams) {
  const [expenses, setExpenses] = useState<EXPENSE[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const colRef = collection(fbDb, 'expenses');
        let q = query(
          colRef,
          where('company.docId', '==', companyId),
          orderBy(params.orderBy, params.direction),
          limit(params.max),
        );

        if (params.cursor) {
          q = query(q, startAfter(params.cursor));
        }

        const snapshot = await getDocs(q);
        const expensesList: EXPENSE[] = snapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id,
        })) as EXPENSE[];

        setExpenses(expensesList);
        setCount(snapshot.size);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, [companyId, docId, params]);

  return { expenses, count };
}
