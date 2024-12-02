'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import useSuppliers from '@/hooks/useSuppliers';
import useMaintenance from '@/hooks/useMaintenance';

import { PARAMS_MAP } from '@/models/params-map';
import { SUPPLIER } from '@/models/supplier';
import { MAINTENANCE } from '@/models/maintenance';

import { DocumentArrowDownIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DocumentSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function Maintenance() {
  const { authUser } = useAuthContext();
  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, maintenance } = useMaintenance({
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
        // first, we save the last document as page's cursor
        cursors.current.set(page + 1, maintenance[maintenance.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [maintenance],
  );
  return (
    <main className="-mx-4 rounded bg-white p-4">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Maintenance</h2>
          <p className="text-gray-500">Manage company maintenance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/operations/maintenance/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Schedule Maintenance</p>
            </div>
          </Link>
          <button
            onClick={() => console.debug('do export drivers...')}
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
                <th className="th text-left">Vehicle</th>
                <th className="th table-cell-sm">Supplier</th>
                <th className="th table-cell-xl">Scheduled On</th>
                <th className="th table-cell-md">Job Card</th>
                <th className="th table-cell-xl">Last Modified</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((supplier: MAINTENANCE) => {
                return (
                  <tr key={supplier.docId} className="tr-body">
                    <td className="td text-left">
                      <p>{supplier.vehicle?.regNumber}</p>
                      <div className="mt-1 text-xs">
                        <p className="block sm:hidden">{supplier.jobCard}</p>
                      </div>
                    </td>
                    <td className="td table-cell-sm">{supplier.supplier?.name}</td>
                    <td className="td table-cell-xl">{supplier.status}</td>
                    <td className="td table-cell-xl">{supplier.jobCard}</td>
                    <td className="td table-cell-xl">
                      {supplier.schedule.startAt &&
                        moment(supplier.schedule.startAt.toDate()).format(Constants.dateTimeFormat)}
                    </td>
                    <td className="td table-cell-xl">
                      {supplier.lastUpdated &&
                        moment(supplier.lastUpdated.toDate()).format(Constants.dateTimeFormat)}
                    </td>
                    <td className="td">
                      <div className="td-actions justify-start">
                        <Link href={`/operations/suppliers/${supplier.docId}`}>
                          <PencilSquareIcon className="h-5 w-5 text-primary hover:opacity-50" />
                        </Link>
                        {/* <DeleteSupplierButton supplier={supplier} /> */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mx-2 my-5 mb-36">
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
