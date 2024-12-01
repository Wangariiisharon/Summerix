'use client';

import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { PARAMS_MAP } from '@/models/params-map';
import { DocumentArrowDownIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useRef, useState } from 'react';
import useDepartments from '@/hooks/useDepartments';
import { DocumentSnapshot } from 'firebase/firestore';
import DeleteDeprtmentButton from './button-delete';
import ToggleDepartmentButton from './button-toggle';
import Image from 'next/image';

import Link from 'next/link';
import { DEPARTMENT } from '@/models/department';
import moment from 'moment';
import RemotePagination from '@/components/remote-pagination';
import json2csv from 'json2csv';

export default function Departments() {
  const { authUser } = useAuthContext();
  const [status, setStatus] = useState<string>('');

  // eslint-disable-next-line no-unused-vars
  /* eslint-disable-next-line no-unused-vars */
  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, departments } = useDepartments({
    companyId: authUser?.companyId || 'xyz',
    isActive: status || '',
    docId: null,
    params,
  });

  const cursors = useRef<Map<number, DocumentSnapshot>>(new Map());
  const [max, setMax] = useState(Constants.defaultPageSize);
  const [currentPage, setCurrentPage] = useState(0);
  const onPageChanged = useCallback(
    (nextPage: number) => {
      setCurrentPage((page) => {
        // first, we save the last document as page's cursor
        cursors.current.set(page + 1, departments[departments.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [departments],
  );
  const exportFiles = () => {
    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'LastUpdated', value: 'lastUpdated' },
      {
        label: 'Archive',
        value: (row: DEPARTMENT) => (row.rolesMap.isActive ? 'Not Archived' : 'Archived'),
      },
      { label: 'UpdatedBy', value: (row: DEPARTMENT) => row.updatedBy.email },
    ];
    const opts = { fields };
    const csv = json2csv.parse(departments, opts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Departments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <main className="-mx-4 rounded bg-white p-4">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Departments</h2>
          <p className="text-gray-500">Manage your Departments & their permissions.</p>
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
          <Link href="/administration/departments/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Add Department</p>
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
                <th className="th table-cell-xl">Status</th>
                <th className="th table-cell-xl">Last Updated</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department: DEPARTMENT) => {
                return (
                  <tr key={department.docId} className="tr-body">
                    <td className="td text-center">
                      <div className="h-auto w-16 overflow-hidden rounded-xl">
                        <Image
                          src={department.photoURL}
                          alt={`${department.name} image`}
                          className="rounded-xl object-cover"
                          height={50}
                          width={50}
                          priority
                        />
                      </div>
                    </td>
                    <td className="td text-left">{department.name}</td>
                    <td className="td table-cell-xl">
                      <div className="flex justify-center">
                        <p
                          className={`w-fit rounded-full px-4 py-2 ${department.rolesMap.isActive ? 'bg-secondary/20 text-teal-700' : 'bg-gray-300'}`}
                        >
                          {department.rolesMap.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </td>
                    <td className="td table-cell-xl">
                      {department.lastUpdated &&
                        moment(department.lastUpdated.toDate()).format(Constants.dateTimeFormat)}
                    </td>
                    <td className="td">
                      <div className="td-actions justify-start">
                        <Link href={`/administration/users/${department.docId}`}>
                          <PencilSquareIcon className="h-5 w-5 text-primary hover:opacity-50" />
                        </Link>
                        <DeleteDeprtmentButton department={department} />
                        <ToggleDepartmentButton department={department} />
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
