'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import { PARAMS_MAP } from '@/models/params-map';
import { DocumentArrowDownIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DocumentSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useClasses from '@/hooks/useClasses';
import { CLASS } from '@/models/class';

export default function ClassesPage() {
  const { authUser } = useAuthContext();
  const [status, setStatus] = useState<string>('');
  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, classes } = useClasses({
    companyId: authUser?.companyId || 'xyz',
    isActive: status || '',
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
      status: status,
      cursor: cursors.current.get(currentPage),
    });
  }, [currentPage, max, status]);

  const onPageChanged = useCallback(
    (nextPage: number) => {
      setCurrentPage((page) => {
        // first, we save the last document as page's cursor
        cursors.current.set(page + 1, classes[classes.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [classes],
  );

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Vehicle Classes</h2>
          <p className="text-gray-500">Manage vehicle classes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <label className="block">
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select w-24 border-secondary py-2.5"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <Link href="/operations/classes/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Add Class</p>
            </div>
          </Link>
          <button
            onClick={() => console.debug('do export...')}
            className="btn btn-flex btn-outline-secondary"
          >
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
                <th className="th">Name</th>
                <th className="th table-cell-md">Status</th>
                <th className="th table-cell-xl">Last Modified</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((myClass: CLASS) => {
                return (
                  <tr key={myClass.docId} className="tr-body">
                    <td className="td">{myClass.name}</td>
                    <td className="td table-cell-sm">
                      <div className="flex justify-center">
                        <p
                          className={`w-fit rounded-full px-4 py-2 ${myClass.isActive ? 'bg-secondary/20 text-teal-700' : 'bg-gray-300'}`}
                        >
                          {myClass.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </td>
                    <td className="td table-cell-xl">
                      {myClass.lastUpdated &&
                        moment(myClass.lastUpdated.toDate()).format(Constants.dateTimeFormat)}
                    </td>
                    <td className="td">
                      <div className="td-actions justify-start">
                        <Link href={`/operations/classes/${myClass.docId}`}>
                          <PencilSquareIcon className="h-5 w-5 text-primary hover:opacity-50" />
                        </Link>
                        {/* <DeleteClassesButton trip={trip} /> */}
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
