'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import useSuppliers from '@/hooks/useSuppliers';
import { PARAMS_MAP } from '@/models/params-map';
import { SUPPLIER } from '@/models/supplier';
import { DocumentArrowDownIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DocumentSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function Suppliers() {
  const { authUser } = useAuthContext();
  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, suppliers } = useSuppliers({
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
        cursors.current.set(page + 1, suppliers[suppliers.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [suppliers],
  );

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Suppliers</h2>
          <p className="text-gray-500">Manage company suppliers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/operations/suppliers/new">
            <div className="btn btn-flex btn-secondary">
              <PlusIcon className="h-5 w-5" />
              <p>Add Supplier</p>
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
                <th className="th text-left">Name</th>
                <th className="th table-cell-sm">Email Address</th>
                <th className="th table-cell-xl">Phone Number</th>
                <th className="th table-cell-md">Type of Supplies</th>
                <th className="th table-cell-xl">Last Modified</th>
                <th className="th text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier: SUPPLIER) => {
                return (
                  <tr key={supplier.docId} className="tr-body">
                    <td className="td text-left">
                      <p>{supplier.name}</p>
                      <div className="mt-1 text-xs">
                        <p className="block sm:hidden">{supplier.email}</p>
                        <p className="block md:hidden">{supplier.typeOfSupplies}</p>
                      </div>
                    </td>
                    <td className="td table-cell-sm">{supplier.email}</td>
                    <td className="td table-cell-xl">{supplier.contacts[0].phoneNumber}</td>
                    <td className="td table-cell-sm">{supplier.typeOfSupplies}</td>
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
