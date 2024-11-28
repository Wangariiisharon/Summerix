'use client';

import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { getCompanyByEmail, getCompanyByName, getCompanyByPhoneNumber } from '@/services/company';
import { getCountries, getCurrencies, getTimezones } from '@/services/utils';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

const CompanySchema = (docId?: string) => {
  return Yup.object().shape({
    name: Yup.string()
      .trim()
      .required('Company name is required.')
      .test({
        exclusive: true,
        name: 'company-name',
        message: 'Name is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getCompanyByName(value);
          if (snapshot && !snapshot.empty) {
            return snapshot.docs[0]?.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    description: Yup.string().trim().required('Description is required.'),
    email: Yup.string()
      .trim()
      .required('Email is required.')
      .email('Enter a valid email address.')
      .test({
        exclusive: true,
        name: 'company-email',
        message: 'Email is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getCompanyByEmail(value);
          if (snapshot && !snapshot.empty) {
            return snapshot.docs[0]?.id?.trim() === docId;
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
        name: 'company-phone-number',
        message: 'Phone number is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getCompanyByPhoneNumber(value);
          if (snapshot && !snapshot.empty) {
            return snapshot.docs[0]?.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    country: Yup.string().trim().required('Country is required.'),
    timezone: Yup.string().trim().required('Timezone is required.'),
    currency: Yup.string().trim().required('Currency is required.'),
  });
};

export default function Company() {
  const [processing, setProcessing] = useState(false);
  const { authUser } = useAuthContext();
  const router = useRouter();

  const doSave = async (formValues: any) => {
    console.debug('doSave > formValues:', formValues);
    if (!authUser || !authUser.user) return;

    try {
      setProcessing(true);

      const docRef = doc(fbDb, Constants.fbCompanies, authUser.user.uid);
      await setDoc(
        docRef,
        {
          ...formValues,

          createdBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          updatedBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          dateCreated: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        },
        { merge: true },
      );
      toast.success('Account saved successfully.');
      router.push('/administration');
    } catch (error) {
      console.error('doSave error:', error);
      toast.error('Save account failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <h2 className="font-bold">Setup a company profile</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          name: '',
          description: '',
          email: `${authUser?.email || ''}`,
          phoneNumber: `${authUser?.phoneNumber || ''}`,
          country: '',
          timezone: '',
          currency: '',
        }}
        validationSchema={CompanySchema(authUser?.uid)}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid }) => (
          <Form className="mt-6">
            {/* <h2 className="text-center font-bold">Account setup</h2> */}

            <div className="mt-5 grid gap-5 p-4">
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Public profile</label>
                  <p className="text-gray-500">This will be displayed on your profile</p>
                </div>
                <div className="">
                  <Field
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Company name"
                  />
                  <ErrorMessage name="name" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Description</label>
                </div>
                <div className="">
                  <Field
                    name="description"
                    className="form-input"
                    placeholder="A short description"
                    as="textarea"
                  />
                  <ErrorMessage name="description" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Email address</label>
                </div>
                <div className="">
                  <Field
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Company email address"
                  />
                  <ErrorMessage name="email" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Phone number</label>
                </div>
                <div className="">
                  <Field
                    type="tel"
                    name="phoneNumber"
                    className="form-input"
                    placeholder="Company phone number"
                  />
                  <ErrorMessage name="phoneNumber" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Country</label>
                </div>
                <div className="">
                  <Field as="select" name="country" className="form-select">
                    <option value="" disabled>
                      Select country...
                    </option>
                    {getCountries().map(({ name, value }) => {
                      return (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="country" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Timezone</label>
                </div>
                <div className="">
                  <Field as="select" name="timezone" className="form-select">
                    <option value="" disabled>
                      Select timezone...
                    </option>
                    {getTimezones().map(({ name, value }) => {
                      return (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="timezone" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Currency</label>
                </div>
                <div className="">
                  <Field as="select" name="currency" className="form-select">
                    <option value="" disabled>
                      Select currency...
                    </option>
                    {getCurrencies().map(({ name, value }) => {
                      return (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="currency" component="span" className="form-error" />
                </div>
              </label>
            </div>

            <div className="grid-1-3 mt-5 gap-5">
              <p className=""></p>
              <button
                type="submit"
                disabled={!isValid || !authUser || processing}
                className="btn btn-primary w-full"
              >
                Save Company
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
}
