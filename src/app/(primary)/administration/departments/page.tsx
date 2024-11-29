'use client';

import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { PARAMS_MAP } from '@/models/params-map';
import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import useDepartments from '@/hooks/useDepartments';
import DepartmentsTble from './departmentsTable';
import { NewFormModal } from '@/components/modals';
import { Formik, Field, Form } from 'formik/dist/index';
import toast from 'react-hot-toast';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { fbDb } from '@/firebase/configs';

export default function Departments() {
  const { authUser } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { company } = useCurrentCompany();

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

  const handleSubmit = async (values: any) => {
    console.debug('doSave > formValues:', values);

    try {
      const colRef = collection(fbDb, Constants.fbDepartments);
      await addDoc(colRef, {
        ...values,
        name: values.name,
        members: 0,
        company: {
          docId: company?.docId,
          name: company?.name,
          email: company?.email,
          phoneNumber: company?.phoneNumber,
          regNumber: company?.regNumber || '',
        },
        rolesMap: {
          companyId: company?.docId,
          isActive: true,
        },
        createdBy: {
          authId: authUser?.uid,
          email: authUser?.email,
        },
        dateCreated: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
      setIsModalOpen(false);
      toast.success('New Departmet added successfully.');
    } catch (error) {
      console.error('save user error:', error);
    }
  };

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  return (
    <main className="text-sm">
      <section className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="">
          <h2 className="font-bold">Departments</h2>
          <p className="text-gray-500">Manage your teams & department permissions.</p>
        </div>

        <button className="btn btn-flex btn-secondary" onClick={handleAdd}>
          <PlusIcon className="h-5 w-5" />
          Add Department
        </button>
      </section>
      <DepartmentsTble departments={departments} count={count} />

      {isModalOpen && (
        <NewFormModal isOpen={isModalOpen} setOpen={setIsModalOpen} heading="Add Department">
          <div className="p-5">
            <Formik
              initialValues={{
                name: '',
              }}
              onSubmit={(values) => {
                handleSubmit(values);
              }}
            >
              {({ values, isSubmitting }) => (
                <Form>
                  <div className="">
                    <div className="flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">NAME</label>
                        <Field
                          type="text"
                          name="name"
                          value={values.name}
                          className="form-input mt-1 block w-96 bg-gray-100"
                        />
                      </label>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-400 focus:outline-none sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-[#4FD1C5] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                        disabled={isSubmitting} // Disable button while submitting
                      >
                        + Add Department
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </NewFormModal>
      )}
    </main>
  );
}
