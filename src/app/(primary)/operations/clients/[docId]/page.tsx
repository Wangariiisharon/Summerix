'use client';

import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { CLIENT } from '@/models/client';
import { PhoneNumberInput } from '@/components/form-fields/phone-number-select';
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
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { getAvatarPhoto } from '@/services/utils';
import { ClientFormSchema } from '@/app/schemas/client-form-schema';

type Props = {
  params: { docId: string };
};

export default function Client({ params }: Props) {
  const [client, setClient] = useState<CLIENT>();
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();

  const router = useRouter();
  const { docId } = params;

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbClients, docId);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          const data = snapshot.data() as CLIENT;
          data.displayName = data.displayName || '';
          data.photoURL = data.photoURL || getAvatarPhoto(data.displayName);
          data.docId = snapshot.id;
          setClient(data);
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
      formValues.displayName = `${formValues.companyName.trim()}}`;

      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbClients);
        await addDoc(colRef, {
          ...formValues,
          email: formValues.email.trim(),
          phoneNumber: formValues.phoneNumber.trim(),
          companyName: formValues.companyName.trim(),
          contactInfo: formValues.contactInfo.trim(),
          createdBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          dateCreated: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
        toast.success('New Client added successfully.');
      } else {
        const docRef = doc(fbDb, Constants.fbClients, docId);
        await updateDoc(docRef, {
          ...formValues,
          lastUpdated: serverTimestamp(),
        });
        toast.success('Client updated successfully.');
      }

      router.push('/operations/clients');
    } catch (error) {
      console.error('save user error:', error);
    }
  };

  if (!company) return <></>;

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <h2 className="font-bold">Client</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          email: client?.email || '',
          phoneNumber: client?.phoneNumber || '',
          companyName: client?.companyName || '',
          contactInfo: client?.contactInfo || '',
          idNumber: client?.idNumber || '',
          company: client?.company || {
            docId: company.docId,
            name: company.name || '',
            email: company.email || '',
            phoneNumber: company.phoneNumber || '',
            regNumber: company.regNumber || '',
          },

          isActive: client?.isActive || false,
          currency: client?.currency || company.currency,
          updatedBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
        }}
        validationSchema={ClientFormSchema(docId)}
        onSubmit={(values) => doSave(values)}
      >
        {({ errors, isValid }) => (
          <Form className="mt-6">
            <div className="mt-5 grid gap-5 p-4">
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Company Name</label>
                </div>
                <div className="">
                  <Field
                    type="text"
                    name="companyName"
                    className="form-input"
                    placeholder="Company Name"
                  />
                  {/* <ErrorMessage name="firstName" component="span" className="form-error" />  */}
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Contact Information</label>
                </div>
                <div className="">
                  <Field
                    type="text"
                    name="contactInfo"
                    className="form-input"
                    placeholder="Contact Information"
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
                  <PhoneNumberInput name="phoneNumber" dialCode="" error={errors.phoneNumber} />
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
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Currency</label>
                </div>
                <div className="">
                  <Field
                    type="text"
                    name="currency"
                    className="form-input"
                    placeholder="Currency"
                  />
                  {/* <ErrorMessage name="currency" component="span" className="form-error" /> */}
                </div>
              </label>

              <hr className="my-3" />

              <div className="grid-1-3">
                <div className="grid gap-5">
                  <label className="flex items-center gap-5">
                    <Field type="checkbox" name="isActive" className="form-checkbox" />
                    <span className="form-label">Is Active</span>
                  </label>
                </div>
              </div>

              <hr className="my-3" />
            </div>

            <div className="grid-1-3 mt-10 gap-5">
              <p className=""></p>
              <div className="flex justify-end gap-5">
                <Link href="/operations/clients" className="btn btn-outline">
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
