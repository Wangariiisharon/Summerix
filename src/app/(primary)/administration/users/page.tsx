'use client';

import { useAuthContext } from '@/app/auth-provider';
import RemotePagination from '@/components/remote-pagination';
import Constants from '@/Constants';
import useAdmins from '@/hooks/useAdmins';
import { ADMIN } from '@/models/admin';
import { PARAMS_MAP } from '@/models/params-map';
import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { deleteDoc, doc, DocumentData, DocumentSnapshot, updateDoc } from 'firebase/firestore';
import moment from 'moment-timezone';
import Image from 'next/image';
import Link from 'next/link';
import SearchBar from '@/components/searchbar';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { fbDb } from '@/firebase/configs';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function Users() {
  const { authUser } = useAuthContext();
  const [params, setParams] = useState<PARAMS_MAP>({
    max: Constants.defaultPageSize,
    orderBy: 'lastUpdated',
    direction: 'desc',
  });
  const { count, admins } = useAdmins({
    companyId: authUser?.companyId || 'xyz',
    docId: null,
    params,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const cursors = useRef<Map<number, DocumentSnapshot>>(new Map());
  const [max, setMax] = useState(Constants.defaultPageSize);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState<ADMIN[]>([]);
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
        cursors.current.set(page + 1, admins[admins.length - 1]?.doc);

        // then we update the state with the next page's number
        return nextPage;
      });
    },
    [admins],
  );

  const handleCheckboxChange = (admin: ADMIN) => {
    const isAdminSelected = selectedAdmins.includes(admin);
    if (isAdminSelected) {
      setSelectedAdmins(selectedAdmins.filter((a) => a.docId !== admin.docId));
    } else {
      setSelectedAdmins([...selectedAdmins, admin]);
    }
  };
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedAdmins([]);
    } else {
      setSelectedAdmins(admins);
    }
    setSelectAll(!selectAll);
  };
  const deleteUser = async (docId: any) => {
    try {
      // Delete the user from Firestore
      await deleteDoc(doc(fbDb, 'fbAdmins', docId));

      // Update the state to reflect the change
      const updatedAdmins = fetchedAdmins.filter((admin) => admin.docId !== docId);
    } catch (error) {
      console.error('Error deleting user: ', error);
    }
  };

  const toggleArchiveStatus = async (admin: ADMIN) => {
    try {
      const adminRef = doc(fbDb, 'admins', admin.docId as string);

      // Toggle the archive and status values
      const newArchiveStatus = !admin.rolesMap.isActive;

      // Update the document
      await updateDoc(adminRef, {
        'rolesMap.isActive': newArchiveStatus,
      });

      console.log(`Admin ${admin.docId} updated successfully`);
      toast.success(`Admin ${admin.firstName} ${admin.lastName} updated successfully`);
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Error updating admin. Please try again.');
    }
  };
  const filteredAdmins = admins.filter((admin: ADMIN) =>
    filter === 'Active'
      ? !admin.rolesMap.isActive
      : filter === 'Inactive'
        ? admin.rolesMap.isActive
        : true,
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const fetchedAdmins: ADMIN[] = (filteredAdmins || []).filter(
    (admin: DocumentData): admin is ADMIN => {
      const fullName = `${admin.firstname} ${admin.lastname}`.toLowerCase();
      const nameMatch = fullName.includes(searchQuery.toLowerCase());
      // const isStatusTrue = admin.status === true || admin.status === "true";
      return nameMatch;
    },
  );

  return (
    <main className="text-sm">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Users</h2>
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
      <div className="overflow-x-auto rounded-lg bg-gray-100 shadow-md">
        <div className="flex flex-row">
          <h2 className="px-4 py-3 font-semibold text-[#030229]">Manage Users</h2>
          <div className="ml-[400px] px-6 py-3">
            <SearchBar
              placeholder="Search User"
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-10" // Match the height

              // className="h-6"
            />
          </div>
          <div className="px-6 py-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
              className="statusbar h-10"
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
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Department</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {filteredAdmins.map((admin: ADMIN) => {
                  return (
                    <tr key={admin.docId} className="tr-body">
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-3"
                            checked={selectedAdmins.includes(admin)}
                            onChange={() => handleCheckboxChange(admin)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Link href={`/administration/users/${admin.docId}`}>
                            <div>
                              <p className="font-semibold">
                                {admin.firstName} {admin.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{admin.email}</p>
                            </div>
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            admin.rolesMap.isAdmin
                              ? 'bg-[#065ad8] text-white'
                              : 'bg-[#065ad8] text-white'
                          }`}
                        >
                          {admin.rolesMap.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="rounded-full bg-[#f7d4d6] px-3 py-1 text-sm text-[#c91010]">
                          {admin.department}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                            admin.rolesMap.isActive
                              ? 'bg-[#b9f9cf] text-[#11a849]'
                              : 'bg-[#f4f4f4] text-[#030229]'
                          }`}
                        >
                          <span
                            className={`mr-2 h-2 w-2 rounded-full ${
                              admin.rolesMap.isActive ? 'bg-[#11a849]' : 'bg-[#030229]'
                            }`}
                          ></span>
                          {admin.rolesMap.isActive ? 'Active' : 'Inactive'}
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
                              deleteUser(admin.docId);
                            }}
                          >
                            <FaTrash />
                          </button>

                          <button
                            className="w-18 ml-4 h-8 bg-[#eae8fd] px-2 py-1 text-[#786cf1]"
                            onClick={(e) => {
                              e.stopPropagation();

                              toggleArchiveStatus(admin);
                            }}
                          >
                            {admin.rolesMap.isActive ? 'Archive' : 'Unarchive'}
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
