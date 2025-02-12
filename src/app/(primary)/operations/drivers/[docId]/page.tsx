'use client';

import { useAuthContext } from '@/app/auth-provider';
import { fbDb } from '@/firebase/configs';
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
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Constants from '@/Constants';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { DRIVER } from '@/models/driver';
import { getAvatarPhoto } from '@/services/utils';
import Image from 'next/image';
import VehicleAllocation from './vehicle';
import AddDocumentButton from './button-add-document';
import { DocumentIcon, EyeIcon } from '@heroicons/react/24/outline';
import DeleteDocumentButton from './button-delete-document';
import { PhoneNumberInput } from '@/components/form-fields/phone-number-select';
import { DriverFormSchema } from '@/app/schemas/driver-form-schema';

type Props = {
  params: { docId: string };
};

export default function Driver({ params }: Props) {
  const [driver, setDriver] = useState<DRIVER>();
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
          const data = snapshot.data() as DRIVER;
          data.displayName = data.displayName || '';
          data.photoURL = data.photoURL || getAvatarPhoto(data.displayName);
          data.docId = snapshot.id;
          setDriver(data);
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
      formValues.displayName = `${formValues.firstName.trim()} ${formValues.lastName.trim()}`;

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
    <main className="-mx-4 rounded bg-white p-4">
      <h2 className="font-bold">Driver</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          email: driver?.email || '',
          phoneNumber: driver?.phoneNumber || '',
          firstName: driver?.firstName || '',
          lastName: driver?.lastName || '',
          idNumber: driver?.idNumber || '',
          company: driver?.company || {
            docId: company.docId,
            name: company.name || '',
            email: company.email || '',
            phoneNumber: company.phoneNumber || '',
            regNumber: company.regNumber || '',
          },
          vehicle: driver?.vehicle || null,
          documents: driver?.documents || [],
          updatedBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
        }}
        validationSchema={DriverFormSchema(authUser?.companyId || 'xyz', docId)}
        onSubmit={(values) => doSave(values)}
      >
        {({ errors, isValid, values }) => (
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
                  {/* <ErrorMessage name="email" component="span" className="form-error" /> */}
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Phone Number</label>
                </div>
                <div className="">
                  <PhoneNumberInput name="phoneNumber" error={errors.phoneNumber} />

                  {/* <ErrorMessage name="phoneNumber" component="span" className="form-error" /> */}
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

              {driver && (
                <>
                  <hr className="my-3" />

                  <div className="grid-1-3 gap-5">
                    <div className="text-sm">
                      <label className="font-medium">Documents</label>
                    </div>
                    <div className="grid gap-3">
                      {values.documents.map((document, i) => {
                        return (
                          <div
                            key={`${document.downloadURL}-${i}`}
                            className="flex items-center justify-between gap-5 rounded bg-gray-100 px-4 py-2"
                          >
                            <div className="flex items-center gap-4">
                              <DocumentIcon className="h-12 w-12" />
                              <div className="grid gap-0.5">
                                <p className="">{document.fileName}</p>
                                <Link
                                  href={document.downloadURL}
                                  className="flex items-center gap-2 text-xs text-primary hover:opacity-50"
                                  target="_blank"
                                >
                                  <EyeIcon className="h-4 w-4" /> View File
                                </Link>
                              </div>
                            </div>

                            <DeleteDocumentButton document={document} driver={driver} />
                          </div>
                        );
                      })}

                      {values.documents.length === 0 && (
                        <p className="text-gray-400">No items to display.</p>
                      )}
                    </div>

                    <div className="">
                      <AddDocumentButton driver={driver} />
                    </div>
                  </div>

                  <hr className="my-3" />

                  <div className="grid-1-3 gap-5">
                    <div className="text-sm">
                      <label className="font-medium">Vehicle Allocation</label>
                    </div>
                    <div className="grid-1-2 col-span-2 gap-3">
                      {driver.vehicle && (
                        <div className="flex items-center gap-3">
                          <Image
                            src={driver.vehicle.photoURL}
                            alt={driver.vehicle.regNumber}
                            className="size-20 shrink-0 rounded-full"
                            width={100}
                            height={100}
                          />
                          <div className="grid gap-0.5">
                            <div className="form-label">
                              <p>{driver.vehicle.regNumber}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <VehicleAllocation driver={driver} />
                    </div>
                  </div>
                </>
              )}
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
