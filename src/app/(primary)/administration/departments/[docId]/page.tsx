'use client';

import * as Yup from 'yup';
import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { DEPARTMENT } from '@/models/department';

import DepartmentRoles from '@/json/departments.json';

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

const DepartmentSchema = () => {
  return Yup.object().shape({
    name: Yup.string().required(' Department name is required.'),
  });
};

type Props = {
  params: { docId: string };
};

export default function Department({ params }: Props) {
  const [department, setDepartment] = useState<DEPARTMENT>();
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();
  const router = useRouter();
  const { docId } = params;

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbDepartments, docId);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          const data = snapshot.data() as DEPARTMENT;
          data.displayName = data.displayName || '';
          data.photoURL = data.photoURL || getAvatarPhoto(data.displayName);
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
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage departments.');
      return;
    }

    try {
      formValues.displayName = `${formValues.name.trim()}`;

      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbDepartments);
        await addDoc(colRef, {
          ...formValues,
          name: formValues.name.trim(),

          createdBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          dateCreated: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
        toast.success('New department added successfully.');
      } else {
        const docRef = doc(fbDb, Constants.fbDepartments, docId);
        await updateDoc(docRef, {
          ...formValues,
          lastUpdated: serverTimestamp(),
        });
        toast.success('Department updated successfully.');
      }

      router.push('/administration/departments');
    } catch (error) {
      console.error('save department error:', error);
    }
  };

  if (!company) return <></>;

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <h2 className="font-bold">Department</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          name: department?.name || '',
          company: department?.company || {
            docId: company.docId,
            name: company.name || '',
            email: company.email || '',
            phoneNumber: company.phoneNumber || '',
            regNumber: company.regNumber || '',
          },
          rolesMap: department?.rolesMap || {
            companyId: company.docId,
            isActive: false,
          },
          roles: department?.roles || [],
          updatedBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
        }}
        validationSchema={DepartmentSchema()}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid }) => (
          <Form className="mt-6">
            <div className="mt-5 grid gap-5 p-4">
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Name</label>
                </div>
                <div className="">
                  <Field type="text" name="name" className="form-input" placeholder="Name" />
                  <ErrorMessage name="firstName" component="span" className="form-error" />
                </div>
              </label>

              <hr className="my-3" />

              <div className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Settings</label>
                </div>
                <div className="grid gap-5">
                  <label className="flex items-center gap-5">
                    <Field type="checkbox" name="rolesMap.isActive" className="form-checkbox" />
                    <span className="form-label">Is Active</span>
                  </label>
                </div>
              </div>

              <hr className="my-3" />

              <div className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Roles</label>
                </div>
                <div className="grid-1-2 col-span-2 gap-3">
                  {DepartmentRoles.staffRoles.map(({ name, value }) => {
                    return (
                      <label key={value} className="flex items-center gap-5">
                        <Field
                          type="checkbox"
                          name="roles"
                          value={value}
                          className="form-checkbox"
                        />
                        <span className="form-label">{name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid-1-3 mt-10 gap-5">
              <p className=""></p>
              <div className="flex justify-end gap-5">
                <Link href="/administration" className="btn btn-outline">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!isValid || !authUser}
                  className="btn btn-secondary"
                >
                  Save
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
}
