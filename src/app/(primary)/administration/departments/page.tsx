'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import { DEPARTMENT } from '@/models/department';
import { PARAMS_MAP } from '@/models/params-map';
import { PlusIcon } from '@heroicons/react/24/outline';
import { deleteDoc, doc, DocumentSnapshot, updateDoc } from 'firebase/firestore';

import Link from 'next/link';
import SearchBar from '@/components/searchbar';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { fbDb } from '@/firebase/configs';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useDepartments from '@/hooks/useDepartments';

export default function Departments() {
  const { authUser } = useAuthContext();

  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, departments } = useDepartments({
    companyId: authUser?.companyId || 'xyz',
    docId: null,
    params,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const cursors = useRef<Map<number, DocumentSnapshot>>(new Map());
  const [max, setMax] = useState(Constants.defaultPageSize);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedDepartmets, setSelectedDepartmets] = useState<DEPARTMENT[]>([]);
  const [filter, setFilter] = useState<'Active' | 'Inactive' | 'All'>('All');

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
        cursors.current.set(page + 1, departments[departments.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [departments],
  );

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedDepartmets([]);
    } else {
      setSelectedDepartmets(departments);
    }
    setSelectAll(!selectAll);
  };

  const filteredDepartments = departments.filter((department: DEPARTMENT) =>
    filter === 'Active'
      ? !department.rolesMap.isActive
      : filter === 'Inactive'
        ? department.rolesMap.isActive
        : true,
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const fetchedDepartments: DEPARTMENT[] = (filteredDepartments || []).filter(
    (department: DEPARTMENT): department is DEPARTMENT => {
      const fullName = `${department.name}`.toLowerCase();
      const nameMatch = fullName.includes(searchQuery.toLowerCase());
      return nameMatch;
    },
  );
  const handleCheckboxChange = (department: DEPARTMENT) => {
    const isDepartmentSelected = selectedDepartmets.includes(department);
    if (isDepartmentSelected) {
      setSelectedDepartmets(selectedDepartmets.filter((a) => a.docId !== department.docId));
    } else {
      setSelectedDepartmets([...selectedDepartmets, department]);
    }
  };

  const deleteUser = async (docId: any) => {
    try {
      await deleteDoc(doc(fbDb, 'fbDepartments', docId));
    } catch (error) {
      console.error('Error deleting Department: ', error);
    }
  };

  const toggleArchiveStatus = async (department: DEPARTMENT) => {
    try {
      const departmentRef = doc(fbDb, 'fbDepartments', department.docId as string);

      // Toggle the archive and status values
      const newArchiveStatus = !department.rolesMap.isActive;

      // Update the document
      await updateDoc(departmentRef, {
        'rolesMap.isActive': newArchiveStatus,
      });

      console.log(`Department ${department.docId} updated successfully`);
      toast.success(`Department ${department.name} updated successfully`);
    } catch (error) {
      console.error('Error updating Department:', error);
      toast.error('Error updating Department. Please try again.');
    }
  };
  return (
    <main className="text-sm">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Departments</h2>
          <p className="text-gray-500">Manage your teams & department permissions.</p>
        </div>
        <Link href="/administration/users/new">
          <div className="btn btn-flex btn-secondary">
            <PlusIcon className="h-5 w-5" />
            <p>Add Department</p>
          </div>
        </Link>
      </section>

      <hr className="my-5" />
      <div className="overflow-x-auto rounded-lg bg-gray-100 shadow-md">
        <div className="flex flex-row">
          <h2 className="px-4 py-3 font-semibold text-[#030229]">Manage Departments</h2>
          <div className="ml-[350px] px-6 py-3">
            <SearchBar
              placeholder="Search Department"
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-10" // Match the height
            />
          </div>
          <div className="px-6 py-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
              className="h-10 cursor-pointer rounded-md border border-gray-300 px-4 text-gray-700"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="table-wrapper">
          <div className="table-scroll">
            <table className="min-w-full bg-white">
              <thead className="sticky top-0 bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="mr-3" onChange={handleSelectAllChange} />
                    Name
                  </th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Upated At</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {fetchedDepartments.map((department: DEPARTMENT) => {
                  return (
                    <tr key={department.docId} className="tr-body">
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-3"
                            checked={selectedDepartmets.includes(department)}
                            onChange={() => handleCheckboxChange(department)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Link href={`/administration/users/${department.docId}`}>
                            <div>
                              <p className="font-semibold">{department.name}</p>
                            </div>
                          </Link>
                        </div>
                      </td>

                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                            department.rolesMap.isActive
                              ? 'bg-[#b9f9cf] text-[#11a849]'
                              : 'bg-[#f4f4f4] text-[#030229]'
                          }`}
                        >
                          <span
                            className={`mr-2 h-2 w-2 rounded-full ${
                              department.rolesMap.isActive ? 'bg-[#11a849]' : 'bg-[#030229]'
                            }`}
                          ></span>
                          {department.rolesMap.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="rounded-full bg-[#f7d4d6] px-3 py-1 text-sm text-[#c91010]">
                          {/* {department.lastUpdated} */}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-500 hover:text-blue-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              // handleEditClick(admin);
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-600"
                            // onClick={deleteUser}
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteUser(department.docId);
                            }}
                          >
                            <FaTrash />
                          </button>

                          <button
                            className="w-18 ml-4 h-8 bg-[#eae8fd] px-2 py-1 text-[#786cf1]"
                            onClick={(e) => {
                              e.stopPropagation();

                              toggleArchiveStatus(department);
                            }}
                          >
                            {department.rolesMap.isActive ? 'Archive' : 'Unarchive'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
