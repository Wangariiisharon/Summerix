'use client';

import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { EXPENSE } from '@/models/expense';
import { ExpenseFormSchema } from '@/app/schemas/expense-form-schema';

type Props = {
  params: { docId: string };
};

export default function Expense({ params }: Props) {
  const [expense, setExpense] = useState<EXPENSE>();
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();
  const router = useRouter();
  const { docId } = params;

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbExpenses, docId);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          const data = snapshot.data() as EXPENSE;
          data.docId = snapshot.id;
          setExpense(data);
        },
        (error) => {
          console.error('onSnapshot > error:', error);
        },
      );

      return () => unsubscribe();
    }
  }, [docId]);

  const doSave = async (formValues: any) => {
    console.debug('doSave > formValues:', formValues);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage expenses.');
      return;
    }

    try {
      const expenseData = {
        ...formValues,
        date: Timestamp.fromDate(new Date(formValues.date)),
        company: {
          docId: company?.docId,
          name: company?.name || '',
        },
        createdBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      };

      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbExpenses);
        await addDoc(colRef, {
          ...expenseData,
          dateCreated: serverTimestamp(),
        });
        toast.success('New expense added successfully.');
      } else {
        const docRef = doc(fbDb, Constants.fbExpenses, docId);
        await updateDoc(docRef, expenseData);
        toast.success('Expense updated successfully.');
      }

      router.push('/operations/expenses');
    } catch (error) {
      console.error('save expense error:', error);
    }
  };

  const initialValues = useMemo(
    () => ({
      name: expense?.name || '',
      amount: expense?.amount || '',
      category: expense?.category || '',
      date: expense?.date ? new Date(expense.date.seconds * 1000).toISOString().split('T')[0] : '',
      company: expense?.company || {
        docId: company?.docId,
        name: company?.name || '',
      },
      updatedBy: {
        authId: authUser?.uid,
        email: authUser?.email,
      },
    }),
    [expense, company, authUser],
  );

  if (!company) return <></>;

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={ExpenseFormSchema()}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid }) => (
          <>
            <Form className="mt-6">
              <div className="mt-5 grid gap-5 p-4">
                <label className="grid-1-3">
                  <div className="text-sm">
                    <label className="font-medium">Expense Name</label>
                  </div>
                  <div className="">
                    <Field
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="Expense Name"
                    />
                  </div>
                </label>
                <label className="grid-1-3">
                  <div className="text-sm">
                    <label className="font-medium">Amount</label>
                  </div>
                  <div className="">
                    <Field
                      type="number"
                      name="amount"
                      className="form-input"
                      placeholder="Amount"
                    />
                  </div>
                </label>
                <label className="grid-1-3">
                  <div className="text-sm">
                    <label className="font-medium">Category</label>
                  </div>
                  <div className="">
                    <Field as="select" name="category" className="form-select">
                      <option value="" disabled>
                        Select category...
                      </option>
                      {[
                        'Rent',
                        'Subscriptions',
                        'Wages/Payroll',
                        'Utilities',
                        'Office Supplies',
                        'Insurance',
                        'Marketing & Advertising',
                        'Repairs/Maintenance',
                        'Professional Services',
                        'Software/IT Services',
                      ].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Field>
                  </div>
                </label>
                <label className="grid-1-3">
                  <div className="text-sm">
                    <label className="font-medium">Date</label>
                  </div>
                  <div className="">
                    <Field type="date" name="date" className="form-input" placeholder="Date" />
                  </div>
                </label>
              </div>

              <hr className="my-3" />

              <div className="grid-1-3 mt-10 gap-5">
                <p className=""></p>
                <div className="flex justify-end gap-5">
                  <button
                    type="button"
                    onClick={() => router.push('/operations/expenses')}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || !authUser}
                    className="btn btn-secondary"
                  >
                    Save
                  </button>
                </div>
              </div>
            </Form>
          </>
        )}
      </Formik>
    </main>
  );
}
