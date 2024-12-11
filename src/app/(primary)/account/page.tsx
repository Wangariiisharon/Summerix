'use client';

import * as Yup from 'yup';
import { fbDb } from '@/firebase/configs';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getClientByEmail } from '@/services/client';
import Constants from '@/Constants';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/app/auth-provider';

const AccountSchema = () => {
  return Yup.object().shape({
    firstName: Yup.string().trim().required('First name is required.'),
    lastName: Yup.string().trim().required('Last name is required.'),
    email: Yup.string()
      .trim()
      .required('Email is required.')
      .email('Enter a valid email address.')
      .test({
        exclusive: true,
        name: 'client-email',
        message: 'Email is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getClientByEmail(value);
          if (!snapshot.empty) {
            const id = this.parent.docId;
            const doc = snapshot.docs[0];
            return doc.id?.trim() === id?.trim();
          }

          return snapshot.empty;
        },
      }),
  });
};

export default function AccountPage() {
  const [processing, setProcessing] = useState(false);
  const { authUser } = useAuthContext();
  const router = useRouter();

  const doSaveAccount = async (formValues: any) => {
    console.debug('doSaveAccount > formValues:', formValues);

    try {
      setProcessing(true);

      if (authUser && authUser.user) {
        formValues.displayName = `${formValues.firstName.trim()} ${formValues.lastName.trim()}`;

        const docRef = doc(fbDb, Constants.fbAccounts, authUser.user.uid);
        await setDoc(
          docRef,
          {
            email: formValues.email.trim(),
            phoneNumber: formValues.phoneNumber.trim(),
            firstName: formValues.firstName.trim(),
            lastName: formValues.lastName.trim(),
            displayName: formValues.displayName.trim(),

            dateCreated: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          },
          { merge: true },
        );
        toast.success('Account saved successfully.');
        router.push('/');
      }
    } catch (error) {
      console.error('doSaveAccount error:', error);
      toast.error('Save account failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl">
      <Formik
        enableReinitialize={true}
        initialValues={{
          email: `${authUser?.email || ''}`,
          phoneNumber: `${authUser?.phoneNumber || ''}`,
          firstName: '',
          lastName: '',
          displayName: '',
        }}
        validationSchema={AccountSchema()}
        onSubmit={(values) => doSaveAccount(values)}
      >
        {({ isValid, values }) => (
          <Form className="mt-6">
            <h2 className="text-center font-bold">Account setup</h2>

            <div className="grid-1-2 mt-5 gap-5 p-4 shadow-sm">
              <label className="block">
                <label className="form-label">First Name</label>
                <Field
                  type="text"
                  name="firstName"
                  placeholder="Your first name"
                  className="form-input"
                />
                <ErrorMessage name="firstName" component="span" className="form-error" />
              </label>
              <label className="block">
                <label className="form-label">Last Name</label>
                <Field
                  type="text"
                  name="lastName"
                  placeholder="Your last name"
                  className="form-input"
                />
                <ErrorMessage name="lastName" component="span" className="form-error" />
              </label>
              <label className="block">
                <label className="form-label">Email Address</label>
                <Field
                  type="email"
                  name="email"
                  disabled={authUser?.email === values.email}
                  placeholder="Your email address"
                  className="form-input"
                />
                <ErrorMessage name="email" component="span" className="form-error" />
              </label>
              <label className="block">
                <label className="form-label">Phone Number</label>
                <Field
                  type="tel"
                  name="phoneNumber"
                  disabled={authUser?.phoneNumber === values.phoneNumber}
                  placeholder="Your phone number"
                  className="form-input"
                />
                <ErrorMessage name="phoneNumber" component="span" className="form-error" />
              </label>
            </div>

            <div className="mt-5 grid w-full justify-items-center gap-5">
              <button
                type="submit"
                disabled={!isValid || processing}
                className="btn btn-primary w-full"
              >
                <i className="fas fa-save"></i> Save
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
}
