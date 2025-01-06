'use client';

import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { ADMIN } from '@/models/admin';
// import AdminRoles from '@/json/roles.json';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { getAvatarPhoto } from '@/services/utils';
import useDepartments from '@/hooks/useDepartments';
import DepartmentAdminView from './department';
import { UserFormSchema } from '@/app/schemas/user-form-schema';
import { CountrySelect } from '@/components/form-fields/country-select';
import { PhoneNumberInput } from '@/components/form-fields/phone-number-select';

type Props = {
  params: { docId: string };
};

export default function User({ params }: Props) {
  const [admin, setAdmin] = useState<ADMIN>();
  const [selectedDialCode, setSelectedDialCode] = useState('+1');
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();

  // Get companyId once and memoize it
  const companyId = useMemo(() => authUser?.companyId || '', [authUser?.companyId]);

  const departmentParams = useMemo(
    () => ({
      orderBy: 'lastUpdated' as const,
      direction: 'desc' as const,
    }),
    [],
  ); // These values never change, so empty dependency array is fine

  const { departments } = useDepartments({
    companyId,
    params: departmentParams,
    isActive: 'active',
    docId: null,
  });
  const router = useRouter();
  const { docId } = params;

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbAdmins, docId);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          const data = snapshot.data() as ADMIN;
          data.displayName = data.displayName || '';
          data.photoURL = data.photoURL || getAvatarPhoto(data.displayName);
          data.docId = snapshot.id;
          console.log('onSnapshot > data:', data);
          setAdmin(data);
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
      toast.error('You are not authorised to manage users.');
      return;
    }

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
            authId: authUser.uid,
            email: authUser.email,
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

  const initialValues = useMemo(
    () => ({
      email: admin?.email || '',
      phoneNumber: admin?.phoneNumber || '',
      firstName: admin?.firstName || '',
      lastName: admin?.lastName || '',
      idNumber: admin?.idNumber || '',
      country: admin?.country || '',
      company: admin?.company || {
        docId: company?.docId,
        name: company?.name || '',
        email: company?.email || '',
        phoneNumber: company?.phoneNumber || '',
        regNumber: company?.regNumber || '',
      },
      department: admin?.department || '',
      roles: admin?.roles || [],
      rolesMap: admin?.rolesMap || {
        companyId: company?.docId,
        isActive: false,
        isAdmin: false,
        isOwner: false,
      },
      updatedBy: {
        authId: authUser?.uid,
        email: authUser?.email,
      },
    }),
    [admin, company, authUser],
  );

  if (!company) return <></>;

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={UserFormSchema(docId)}
        onSubmit={(values) => doSave(values)}
      >
        {({ errors, isValid, setFieldValue, values }) => {
          console.log('errors:', errors);
          console.log('isValid:', isValid);
          return (
            <>
              <Form className="mt-6">
                {/* <h2 className="text-center font-bold">Account setup</h2> */}

                <div className="mt-5 grid gap-5 p-4">
                  <label className="grid-1-3">
                    <div className="text-sm">
                      <label className="font-medium">First Name</label>
                    </div>
                    <div className="">
                      <Field
                        type="text"
                        name="firstName"
                        className="form-input"
                        placeholder="First Name"
                      />
                      {/* <ErrorMessage name="firstName" component="span" className="form-error" /> */}
                    </div>
                  </label>
                  <label className="grid-1-3">
                    <div className="text-sm">
                      <label className="font-medium">Last Name</label>
                    </div>
                    <div className="">
                      <Field
                        type="text"
                        name="lastName"
                        className="form-input"
                        placeholder="Last Name"
                      />
                      {/* <ErrorMessage name="lastName" component="span" className="form-error" /> */}
                    </div>
                  </label>
                  <label className="grid-1-3">
                    <div className="text-sm">
                      <label className="font-medium">Email Address</label>
                    </div>
                    <div className="">
                      <Field
                        type="email"
                        name="email"
                        className="form-input"
                        placeholder="Email Address"
                        disabled={docId !== 'new'}
                      />
                    </div>
                  </label>
                  <label className="grid-1-3">
                    <div className="text-sm">
                      <label className="font-medium">Country</label>
                    </div>
                    <div className="relative">
                      <CountrySelect
                        value={values.country}
                        onChange={(value: any) => setFieldValue('country', value)}
                        onDialCodeChange={setSelectedDialCode}
                        error={errors.country}
                        as="div"
                      />
                    </div>
                  </label>
                  <label className="grid-1-3">
                    <div className="text-sm">
                      <label className="font-medium">Phone Number</label>
                    </div>
                    <div>
                      <PhoneNumberInput
                        name="phoneNumber"
                        dialCode={selectedDialCode}
                        error={errors.phoneNumber}
                      />
                    </div>
                  </label>
                  <label className="grid-1-3">
                    <div className="text-sm">
                      <label className="font-medium">ID Number</label>
                    </div>
                    <div className="">
                      <Field
                        type="number"
                        name="idNumber"
                        className="form-input"
                        placeholder="ID Number"
                      />
                      {/* <ErrorMessage name="idNumber" component="span" className="form-error" /> */}
                    </div>
                  </label>

                  <hr className="my-3" />

                  <DepartmentAdminView
                    admin={admin}
                    departments={departments}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    values={values} // Add this prop
                  />
                  {/* <ErrorMessage name="department.docId" component="span" className="form-error" /> */}

                  <div className="grid-1-3 mt-5">
                    <div className="text-sm">
                      <label className="font-medium">Settings</label>
                    </div>
                    <div className="grid gap-3">
                      <label className="flex items-center gap-5">
                        <Field type="checkbox" name="rolesMap.isActive" className="form-checkbox" />
                        <span className="form-label">Is Active</span>
                      </label>
                      <label className="flex items-center gap-5">
                        <Field type="checkbox" name="rolesMap.isAdmin" className="form-checkbox" />
                        <span className="form-label">Is Company Admin</span>
                      </label>
                      <label className="flex items-center gap-5">
                        <Field type="checkbox" name="rolesMap.isOwner" className="form-checkbox" />
                        <span className="form-label">Is Company Owner</span>
                      </label>
                    </div>
                  </div>
                </div>

                <hr className="my-3" />

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
            </>
          );
        }}
      </Formik>
    </main>
  );
}
