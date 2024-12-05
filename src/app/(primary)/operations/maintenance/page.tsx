'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import useMaintenance from '@/hooks/useMaintenance';
import { PARAMS_MAP } from '@/models/params-map';
import { MAINTENANCE } from '@/models/maintenance';
import Maintenances from '@/json/maintenance.json';

import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
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
  const [status, setStatus] = useState<string>('');

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
        cursors.current.set(page + 1, maintenance[maintenance.length - 1]?.doc);
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
          <label className="block">
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select w-36 border-secondary py-2.5"
            >
              <option value="">All</option>
              {Maintenances.statusList.map(({ name, value }) => {
                return (
                  <option key={value} value={value}>
                    {name}
                  </option>
                );
              })}
            </select>
          </label>
          <Link href="/operations/maintenance/jobcards/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Add Jobcard</p>
            </div>
          </Link>
          <Link href="/operations/maintenance/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Schedule Maintenance</p>
            </div>
          </Link>
        </div>
      </section>

      <hr className="my-5" />

      <div className="table-wrapper">
        <div className="table-scroll text-sm">
          <table className="my-table">
            <thead className="sticky top-0">
              <tr className="tr-header">
                <th className="th text-left">Job Card</th>
                <th className="th table-cell-sm">Vehicle</th>
                <th className="th table-cell-md">Supplier</th>
                <th className="th table-cell-md">Status</th>
                <th className="th table-cell-xl">Scheduled On</th>
                <th className="th table-cell-xl">Last Modified</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((maintenance: MAINTENANCE) => {
                return (
                  <tr key={maintenance.docId} className="tr-body">
                    <td className="td text-left">
                      {maintenance.jobCard && (
                        <Link
                          href={`/operations/maintenance/jobcards/${maintenance.jobCard.docId}`}
                          className="text-primary hover:text-secondary"
                        >
                          {maintenance.jobCard.name}
                        </Link>
                      )}
                      {!maintenance.jobCard && 'N/A'}
                    </td>
                    <td className="td table-cell-sm">
                      {maintenance.vehicle && (
                        <Link
                          href={`/operations/vehicles/${maintenance.vehicle.docId}`}
                          className="text-primary hover:text-secondary"
                        >
                          {maintenance.vehicle.name}
                        </Link>
                      )}
                      {!maintenance.vehicle && 'N/A'}
                    </td>

                    <td className="td table-cell-xl">
                      {maintenance.supplier && (
                        <Link
                          href={`/operations/suppliers/${maintenance.supplier.docId}`}
                          className="hover:text-secondary"
                        >
                          {maintenance.supplier.name}
                        </Link>
                      )}
                      {!maintenance.supplier && 'N/A'}
                    </td>
                    <td className="td table-cell-xl">{maintenance.status}</td>
                    <td className="td table-cell-xl">
                      {maintenance.schedule.startAt &&
                        moment(maintenance.schedule.startAt.toDate()).format(
                          Constants.dateTimeFormat,
                        )}
                    </td>
                    <td className="td table-cell-xl">
                      {maintenance.lastUpdated &&
                        moment(maintenance.lastUpdated.toDate()).format(Constants.dateTimeFormat)}
                    </td>
                    <td className="td">
                      <div className="td-actions justify-start">
                        <Link href={`/operations/maintenance/${maintenance.docId}`}>
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
