'use client';

import * as Yup from 'yup';
import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import AdminRoles from '@/json/roles.json';
import { getAdminByEmail, getAdminByPhoneNumber } from '@/services/admin';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { getAvatarPhoto } from '@/services/utils';
import { DEPARTMENT } from '@/models/department';
import usePermissions from '@/hooks/usePermissions';

type Props = {
  params: { docId: string };
};

export default function Department({ params }: Props) {
  const [department, setDepartment] = useState<DEPARTMENT>();
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();
  const [allChecked, setAllChecked] = useState(false);

  const router = useRouter();
  const { docId } = params;
  const { count, permissions } = usePermissions({
    companyId: authUser?.companyId || 'xyz',
    docId: null,
  });

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbDepartments, docId);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          const data = snapshot.data() as DEPARTMENT;
          data.docId = snapshot.id;
          setDepartment(data);
        },
        (error) => {
          console.error('onSnapshot > error:', error);
        },
      );

      return () => unsubscribe();
    }
  }, [docId]);

  const doSave = async (formValues: any) => {
    console.debug('doSave > formValues:', formValues);

    try {
      formValues.displayName = `${formValues.firstName.trim()} ${formValues.lastName.trim()}`;

      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbAdmins);
        await addDoc(colRef, {
          ...formValues,
          email: formValues.email.trim(),
          phoneNumber: formValues.phoneNumber.trim(),
          firstName: formValues.firstName.trim(),
          lastName: formValues.lastName.trim(),
          createdBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
          dateCreated: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
        toast.success('New user added successfully.');
      } else {
        const docRef = doc(fbDb, Constants.fbAdmins, docId);
        await updateDoc(docRef, {
          ...formValues,
          lastUpdated: serverTimestamp(),
        });
        toast.success('User updated successfully.');
      }

      router.push('/administration/users');
    } catch (error) {
      console.error('save user error:', error);
    }
  };

  return (
    <div className="ml-[50px] mr-[77px] flex flex-col">
      <div className="font-custom text-custom-size mt-[27px] font-semibold">
        <p>Department</p>
      </div>
      <div className="mt-[23px] border border-[#dee8f8] bg-[#f7f8fa]">
        <div className="mb-[25px] ml-[32px] mt-[25px] flex justify-start">
          <div className="ml-[18px] bg-white">
            <div className="flex flex-col p-[20px]">
              <div className="flex flex-row">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 text-[#065AD8]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>

                <p className="ml-[10px] text-sm text-[#6b6b73]">Department</p>
              </div>
              <p className="ml-[34px] mt-[5px] text-sm font-semibold text-[#]">
                {department?.name}
              </p>
            </div>
          </div>

          <div className="ml-[18px] bg-white">
            <div className="flex flex-col p-[20px]">
              <div className="flex flex-row">
                {/* <i className="fa fa-user-circle-o text-[#065AD8]"></i>  */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6 text-[#065AD8]"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                  />
                </svg>

                <p className="ml-[10px] text-sm text-[#6b6b73]">Members</p>
              </div>
              <p className="ml-[34px] mt-[5px] text-sm font-semibold text-[#]">
                {/* {adminCount} */} 0
              </p>
            </div>
          </div>
          <div className="ml-[18px] bg-white">
            <div className="flex flex-col p-[20px]">
              <div className="flex flex-row">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6 text-[#065AD8]"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
                  />
                </svg>

                <p className="ml-[10px] text-sm text-[#6b6b73]">Status</p>
              </div>
              <p className="ml-[34px] mt-[5px] text-sm font-semibold text-[#000000]">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                    department?.rolesMap.isActive
                      ? 'bg-[#b9f9cf] text-[#11a849]'
                      : 'bg-[#f4f4f4] text-[#030229]'
                  }`}
                >
                  <span
                    className={`mr-2 h-2 w-2 rounded-full ${
                      department?.rolesMap.isActive ? 'bg-[#11a849]' : 'bg-[#065ad8]'
                    }`}
                  ></span>
                  {department?.rolesMap.isActive ? 'Active' : 'Offline'}
                </span>
              </p>
            </div>
          </div>

          <div className="ml-[100px]">
            <div className="flex space-x-4 p-[20px]">
              <button className="flex items-center rounded bg-teal-400 px-4 py-2 font-semibold text-white hover:bg-teal-500">
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Set Permission
              </button>

              <button
                className="flex items-center rounded border border-teal-400 bg-white px-4 py-2 font-semibold text-teal-400 hover:bg-teal-50"
                onClick={() => department}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[43px] border-y border-gray-200"></div>
    </div>
  );
}
