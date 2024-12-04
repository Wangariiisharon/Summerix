'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import useDrivers from '@/hooks/useDrivers';
import { DRIVER } from '@/models/driver';
import { PARAMS_MAP } from '@/models/params-map';
import { DocumentArrowDownIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DocumentSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import DeleteDriverButton from './button-delete';

export default function Drivers() {
  const { authUser } = useAuthContext();
  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, drivers } = useDrivers({
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
        cursors.current.set(page + 1, drivers[drivers.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [drivers],
  );

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Drivers</h2>
          <p className="text-gray-500">Manage company drivers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/operations/drivers/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Add Driver</p>
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
                <th className="th"></th>
                <th className="th text-left">Name</th>
                <th className="th table-cell-sm">Email Address</th>
                <th className="th table-cell-xl">Phone Number</th>
                <th className="th table-cell-md">Vehicle</th>
                <th className="th table-cell-xl">Last Modified</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver: DRIVER) => {
                return (
                  <tr key={driver.docId} className="tr-body">
                    <td className="td text-center">
                      <div className="h-auto w-auto overflow-hidden rounded-xl">
                        <Image
                          src={driver.photoURL}
                          alt={`${driver.displayName} image`}
                          className="h-16 w-16 rounded-xl object-cover"
                          height={50}
                          width={50}
                          priority
                        />
                      </div>
                    </td>
                    <td className="td text-left">
                      <p>{driver.displayName}</p>
                      <div className="mt-1 text-xs">
                        <p className="block sm:hidden">{driver.email}</p>
                        <p className="block md:hidden">{driver.vehicle?.name}</p>
                      </div>
                    </td>
                    <td className="td table-cell-sm">{driver.email}</td>
                    <td className="td table-cell-xl">{driver.phoneNumber}</td>
                    <td className="td table-cell-md">
                      {driver.vehicle && (
                        <Link
                          href={`/operations/vehicles/${driver.vehicle.docId}`}
                          className="text-primary hover:text-secondary"
                        >
                          {driver.vehicle.name}
                        </Link>
                      )}
                      {!driver.vehicle && 'N/A'}
                    </td>
                    <td className="td table-cell-xl">
                      {driver.lastUpdated &&
                        moment(driver.lastUpdated.toDate()).format(Constants.dateTimeFormat)}
                    </td>
                    <td className="td">
                      <div className="td-actions justify-start">
                        <Link href={`/operations/drivers/${driver.docId}`}>
                          <PencilSquareIcon className="h-5 w-5 text-primary hover:opacity-50" />
                        </Link>
                        <DeleteDriverButton driver={driver} />
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
