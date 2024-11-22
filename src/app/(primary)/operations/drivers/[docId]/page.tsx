'use client';

import * as Yup from 'yup';
import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { ADMIN } from '@/models/admin';
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
import { getDriverByEmail, getDriverByPhoneNumber } from '@/services/driver';

const DriverSchema = (companyId: string, docId: string) => {
  return Yup.object().shape({
    firstName: Yup.string().required('First name is required.'),
    lastName: Yup.string().required('First name is required.'),
    email: Yup.string()
      .trim()
      .required('Email is required.')
      .email('Enter a valid email address.')
      .test({
        exclusive: true,
        name: 'driver-email',
        message: 'Email is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getDriverByEmail(companyId, value);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return doc.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    phoneNumber: Yup.string()
      .trim()
      .required('Phone number is required.')
      .matches(Constants.phoneRegExp, 'Phone number is not valid.')
      .test({
        exclusive: true,
        name: 'driver-phone',
        message: 'Phone number is already in use as admin.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getDriverByPhoneNumber(companyId, value);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return doc.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
  });
};

type Props = {
  params: { docId: string };
};

export default function Driver({ params }: Props) {
  const [admin, setAdmin] = useState<ADMIN>();
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();
  const router = useRouter();
  const { docId } = params;

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbDrivers, docId);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          const data = snapshot.data() as ADMIN;
          data.displayName = data.displayName || '';
          data.photoURL = data.photoURL || getAvatarPhoto(data.displayName);
          data.docId = snapshot.id;
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
      toast.error('You are not authorised to manage drivers.');
      return;
    }

    try {
      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbDrivers);
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
        toast.success('New driver added successfully.');
      } else {
        const docRef = doc(fbDb, Constants.fbDrivers, docId);
        await updateDoc(docRef, {
          ...formValues,
          lastUpdated: serverTimestamp(),
        });
        toast.success('Driver updated successfully.');
      }

      router.push('/operations/drivers');
    } catch (error) {
      console.error('save driver error:', error);
    }
  };

  if (!company) return <></>;

  return (
    <main className="">
      <h2 className="font-bold">Driver</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          email: admin?.email || '',
          phoneNumber: admin?.phoneNumber || '',
          firstName: admin?.firstName || '',
          lastName: admin?.lastName || '',
          idNumber: admin?.idNumber || '',
          company: {
            docId: company.docId,
            name: company.name || '',
            email: company.email || '',
            phoneNumber: company.phoneNumber || '',
            regNumber: company.regNumber || '',
          },
          updatedBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
        }}
        validationSchema={DriverSchema(authUser?.companyId || 'xyz', docId)}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid }) => (
          <Form className="mt-6">
            {/* <h2 className="text-center font-bold">Account setup</h2> */}

            <div className="mt-5 grid gap-5 p-4 shadow-sm">
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
                  <ErrorMessage name="firstName" component="span" className="form-error" />
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
                  <ErrorMessage name="lastName" component="span" className="form-error" />
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
                  <ErrorMessage name="email" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Phone Number</label>
                </div>
                <div className="">
                  <Field
                    type="tel"
                    name="phoneNumber"
                    className="form-input"
                    placeholder="Phone Number"
                  />
                  <ErrorMessage name="phoneNumber" component="span" className="form-error" />
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
                  <ErrorMessage name="idNumber" component="span" className="form-error" />
                </div>
              </label>
            </div>

            <div className="grid-1-3 mt-10 gap-5">
              <p className=""></p>
              <div className="flex justify-end gap-5">
                <Link href="/operations/drivers" className="btn btn-outline">
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
