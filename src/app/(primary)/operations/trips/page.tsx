'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import useTrips from '@/hooks/useTrips';
import Trips from '@/json/trips.json';
import { PARAMS_MAP } from '@/models/params-map';
import { TRIP } from '@/models/trip';
import { DocumentArrowDownIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DocumentSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import DeleteTripButton from './button-delete';

export default function TripsPage() {
  const { authUser } = useAuthContext();
  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, trips } = useTrips({
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
        // first, we save the last document as page's cursor
        cursors.current.set(page + 1, trips[trips.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [trips],
  );

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Trips</h2>
          <p className="text-gray-500">Manage company trips.</p>
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
              {Trips.statusList.map(({ name, value }) => {
                return (
                  <option key={value} value={value}>
                    {name}
                  </option>
                );
              })}
            </select>
          </label>
          <Link href="/operations/trips/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Add Trip</p>
            </div>
          </Link>
          <button
            onClick={() => console.debug('do export trips...')}
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
                <th className="th">From</th>
                <th className="th">To</th>
                <th className="th table-cell-lg">Distance</th>
                <th className="th table-cell-sm">Vehicle</th>
                <th className="th table-cell-md">Driver</th>
                <th className="th table-cell-md">Status</th>
                <th className="th table-cell-xl">Last Modified</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip: TRIP) => {
                return (
                  <tr key={trip.docId} className="tr-body">
                    <td className="td max-w-40">{trip.from?.location}</td>
                    <td className="td max-w-40">{trip.to?.location}</td>
                    <td className="td table-cell-lg">{trip.distance?.text || 'N/A'}</td>
                    <td className="td table-cell-sm">{trip.vehicle?.regNumber}</td>
                    <td className="td table-cell-md">
                      {trip.driver && (
                        <Link
                          href={`/operations/drivers/${trip.driver.docId}`}
                          className="text-primary hover:text-secondary"
                        >
                          {trip.driver.displayName}
                        </Link>
                      )}
                      {!trip.driver && 'N/A'}
                    </td>
                    <td className="td table-cell-md">
                      <div className="flex justify-center">
                        <p className={`w-fit rounded-full px-4 py-2 status-${trip.status}`}>
                          {trip.status}
                        </p>
                      </div>
                    </td>
                    <td className="td table-cell-xl">
                      {trip.lastUpdated &&
                        moment(trip.lastUpdated.toDate()).format(Constants.dateTimeFormat)}
                    </td>
                    <td className="td">
                      <div className="td-actions justify-start">
                        <Link href={`/operations/trips/${trip.docId}`}>
                          <PencilSquareIcon className="h-5 w-5 text-primary hover:opacity-50" />
                        </Link>
                        <DeleteTripButton trip={trip} />
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
