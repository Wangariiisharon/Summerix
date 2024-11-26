'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import useAdmins from '@/hooks/useAdmins';
import { ADMIN } from '@/models/admin';
import { PARAMS_MAP } from '@/models/params-map';
import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DocumentSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import DeleteAdminButton from './button-delete';
import ToggleAdminButton from './button-toggle';

export default function Users() {
  const { authUser } = useAuthContext();
  const [status, setStatus] = useState<string>('');
  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, admins } = useAdmins({
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

      cursor: cursors.current.get(currentPage),
    });
  }, [currentPage, max]);

  const onPageChanged = useCallback(
    (nextPage: number) => {
      setCurrentPage((page) => {
        // first, we save the last document as page's cursor
        cursors.current.set(page + 1, admins[admins.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [admins],
  );

  return (
    <main className="">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Admin Users</h2>
          <p className="text-gray-500">Manage your teams & user permissions.</p>
        </div>
        <Link href="/administration/users/new">
          <div className="btn btn-flex btn-secondary">
            <PlusIcon className="h-5 w-5" />
            <p>Add User</p>
          </div>
        </Link>
      </section>

      <hr className="my-5" />

      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <label className="block">
          <label className="form-label">Filter by status</label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-select w-24"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </section>

      <div className="table-wrapper">
        <div className="table-scroll text-sm">
          <table className="my-table">
            <thead className="sticky top-0">
              <tr className="tr-header">
                <th className="th"></th>
                <th className="th text-left">Name</th>
                <th className="th table-cell-sm">Email Address</th>
                <th className="th table-cell-xl">Status</th>
                <th className="th table-cell-xl">Last Modified</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin: ADMIN) => {
                return (
                  <tr key={admin.docId} className="tr-body">
                    <td className="td text-center">
                      <div className="h-auto w-16 overflow-hidden rounded-xl">
                        <Image
                          src={admin.photoURL}
                          alt={`${admin.displayName} image`}
                          className="rounded-xl object-cover"
                          height={50}
                          width={50}
                          priority
                        />
                      </div>
                    </td>
                    <td className="td text-left">
                      <p>{admin.displayName}</p>
                      <div className="mt-1">
                        <p className="block sm:hidden">{admin.email}</p>
                        <p className="block lg:hidden">{admin.phoneNumber}</p>
                      </div>
                    </td>
                    <td className="td table-cell-sm">{admin.email}</td>
                    <td className="td table-cell-xl">
                      <div className="flex justify-center">
                        <p
                          className={`w-fit rounded-full px-4 py-2 ${admin.rolesMap.isActive ? 'bg-secondary/20 text-teal-700' : 'bg-gray-300'}`}
                        >
                          {admin.rolesMap.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </td>
                    <td className="td table-cell-xl">
                      {admin.lastUpdated &&
                        moment(admin.lastUpdated.toDate()).format(Constants.dateTimeFormat)}
                    </td>
                    <td className="td">
                      <div className="td-actions justify-start">
                        <Link href={`/administration/users/${admin.docId}`}>
                          <PencilSquareIcon className="h-5 w-5 text-primary hover:opacity-50" />
                        </Link>
                        <DeleteAdminButton admin={admin} />
                        <ToggleAdminButton admin={admin} />
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
