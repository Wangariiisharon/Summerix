'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import useExpenses from '@/hooks/useExpenses';
import { EXPENSE } from '@/models/expense';
import { DocumentArrowDownIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DocumentSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import json2csv from 'json2csv';

export default function Expenses() {
  const { authUser } = useAuthContext();
  const [params, setParams] = useState<any>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, expenses } = useExpenses({
    companyId: authUser?.companyId || 'xyz',
    docId: null,
    params,
  });
  const cursors = useRef<Map<number, DocumentSnapshot>>(new Map());
  const [max, setMax] = useState(Constants.defaultPageSize);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setParams({
      orderBy: 'lastUpdated',
      direction: 'desc',
      max: max,
      cursor: cursors.current.get(currentPage),
    });
  }, [currentPage, max]);

  const onPageChanged = useCallback(
    (nextPage: number) => {
      setCurrentPage((page) => {
        //@ts-expect-error - TS complains about the type of the doc property
        cursors.current.set(page + 1, expenses[expenses.length - 1]?.doc);
        return nextPage;
      });
    },
    [expenses],
  );

  const exportFiles = () => {
    const fields = [
      {
        label: 'Name',
        value: (row: EXPENSE) => row.name,
      },
      {
        label: 'Amount',
        value: (row: EXPENSE) => row.amount,
      },
      {
        label: 'Category',
        value: (row: EXPENSE) => row.category,
      },
      {
        label: 'Date',
        value: (row: EXPENSE) => moment(row.date.toDate()).format(Constants.dateTimeFormat),
      },
    ];
    const opts = { fields };
    const csv = json2csv.parse(expenses, opts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Expenses</h2>
          <p className="text-gray-500">Manage company expenses.</p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/operations/expenses/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Add Expense</p>
            </div>
          </Link>
          <button onClick={exportFiles} className="btn btn-flex btn-outline-secondary">
            <DocumentArrowDownIcon className="h-5 w-5" />
            <p>Export</p>
          </button>
        </div>
      </section>

      <hr className="my-5" />

      <div className="table-wrapper">
        <div className="table-scroll text-sm">
          <table className="my-table">
            <thead className="sticky top-0">
              <tr className="tr-header">
                <th className="th text-left">Name</th>
                <th className="th table-cell-sm">Amount</th>
                <th className="th table-cell-md">Category</th>
                <th className="th table-cell-xl">Date</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense: EXPENSE) => {
                return (
                  <tr key={expense.docId} className="tr-body">
                    <td className="td text-left">{expense.name}</td>
                    <td className="td table-cell-sm">{expense.amount}</td>
                    <td className="td table-cell-md">{expense.category}</td>
                    <td className="td table-cell-xl">
                      {moment(expense.date.toDate ? expense.date.toDate() : expense.date).format(
                        Constants.dateTimeFormat,
                      )}
                    </td>
                    <td className="td">
                      <div className="td-actions justify-start">
                        <Link href={`/operations/expenses/${expense.docId}`}>
                          <PencilSquareIcon className="h-5 w-5 text-primary hover:opacity-50" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mx-2 my-5">
          <RemotePagination
            max={max}
            setMax={setMax}
            itemsCount={count}
            currentPage={currentPage}
            pageChanged={onPageChanged}
          />
        </div>
      </div>
    </main>
  );
}
