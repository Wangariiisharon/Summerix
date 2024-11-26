'use client';

import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { DEPARTMENT } from '@/models/department';

type Props = {
  params: { docId: string };
};

export default function Department({ params }: Props) {
  const [department, setDepartment] = useState<DEPARTMENT>();

  const { docId } = params;

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
                Set Permission
              </button>

              <button
                className="flex items-center rounded border border-teal-400 bg-white px-4 py-2 font-semibold text-teal-400 hover:bg-teal-50"
                onClick={() => department}
              >
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
