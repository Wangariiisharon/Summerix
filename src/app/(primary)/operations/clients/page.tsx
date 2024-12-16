'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import useClient from '@/hooks/useClient';
import { CLIENT } from '@/models/client';
import { PARAMS_MAP } from '@/models/params-map';
import { DocumentArrowDownIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DocumentSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DeleteClientButton from './button-delete';
import { exportDataToCSV } from './exportClients';

export default function ClientsPage() {
  const { authUser } = useAuthContext();
  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const [status, setStatus] = useState<string>('');
  const { count, clients } = useClient({
    companyId: authUser?.companyId || 'xyz',
    docId: null,
    isActive: status || '',
    params,
  });
  console.log('clients:', clients);

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
        cursors.current.set(page + 1, clients[clients.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [clients],
  );

  const exportFiles = async () => {
    console.log('status:', status);

    try {
      let csvData;

      if (authUser && authUser.companyId && status === 'all') {
        csvData = await exportDataToCSV(authUser.companyId);
      } else {
        csvData = await exportDataToCSV(authUser?.companyId as string, status);
      }

      // Create a blob and initiate the download
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exported-data-${status}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Clients</h2>
          <p className="text-gray-500">Manage company Clients.</p>
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

          <Link href="/operations/clients/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Add Client</p>
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
                <th className="th"></th>
                <th className="th text-left">Name</th>
                <th className="th table-cell-sm">Phone Number</th>
                <th className="th table-cell-md">Status</th>
                <th className="th table-cell-xl">Last Updated</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client: CLIENT) => {
                return (
                  <tr key={client.docId} className="tr-body">
                    <td className="td text-center">
                      <div className="h-auto w-auto overflow-hidden rounded-xl">
                        <Image
                          src={client.photoURL}
                          alt={`${client.displayName} image`}
                          className="h-16 w-16 rounded-xl object-cover"
                          height={50}
                          width={50}
                          priority
                        />
                      </div>
                    </td>
                    <td className="td text-left">
                      <p>{client.displayName}</p>
                      <div className="mt-1 grid gap-2">
                        <p className="block sm:hidden">{client.email}</p>
                        <div className="block md:hidden">
                          <p
                            className={`w-fit rounded-full px-4 py-2 status-${client.phoneNumber}`}
                          >
                            {client.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="td table-cell-sm">{client.phoneNumber}</td>
                    <td className="td table-cell-md">
                      <div className="flex justify-center">
                        <p
                          className={`w-fit rounded-full px-4 py-2 ${client.isActive ? 'bg-secondary/20 text-teal-700' : 'bg-gray-300'}`}
                        >
                          {client.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </td>

                    <td className="td table-cell-xl">
                      {client.lastUpdated &&
                        moment(client.lastUpdated.toDate()).format(Constants.dateTimeFormat)}
                    </td>
                    <td className="td">
                      <div className="td-actions justify-start">
                        <Link href={`/operations/vehicles/${client.docId}`}>
                          <PencilSquareIcon className="h-5 w-5 text-primary hover:opacity-50" />
                        </Link>
                        <DeleteClientButton client={client} />
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
