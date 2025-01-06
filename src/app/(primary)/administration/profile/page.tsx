'use client';
import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { getTimezones } from '@/services/utils';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import AddCurrencyButton from './button-add-currency';
import DeleteCurrencyButton from './button-delete-currency';
import EditCurrencyButton from './button-edit-currency';
import { CompanySchema } from '@/app/schemas/company-schema';
import { CountrySelect } from '@/components/form-fields/country-select';
import { PhoneNumberInput } from '@/components/form-fields/phone-number-select';

export default function Profile() {
  const [processing, setProcessing] = useState(false);
  const [dialCode, setDialCode] = useState('');
  const { company } = useCurrentCompany();
  const { authUser } = useAuthContext();

  const doSave = async (formValues: any) => {
    console.debug('doSave > formValues:', formValues);
    if (!authUser || !authUser.user || !company) return;

    try {
      setProcessing(true);

      const docRef = doc(fbDb, Constants.fbCompanies, company.docId);
      await updateDoc(docRef, {
        ...formValues,

        updatedBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      });
      toast.success('Account saved successfully.');
    } catch (error) {
      console.error('doSave error:', error);
      toast.error('Save account failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!company) return <></>;

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <h2 className="font-bold">Company profile</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          name: company.name || '',
          email: company.email || '',
          description: company.description || '',
          phoneNumber: company?.phoneNumber || '',
          country: company.country || '',
          timezone: company.timezone || '',
          currency: company.currency || '',
          currencyList: company.currencyList || [],
        }}
        validationSchema={CompanySchema(company?.docId)}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid, values, setFieldValue, errors }) => {
          console.log('isValid:', isValid);
          console.log('values:', values);
          return (
            <>
              <Form className="mt-6">
                {/* <h2 className="text-center font-bold"></h2> */}

                <div className="mt-5 grid gap-6 p-4 shadow-sm">
                  <label className="grid-1-3 gap-5">
                    <div className="flex flex-col gap-1 text-sm">
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
                  <label className="grid-1-3 gap-5">
                    <div className="grid text-sm">
                      <label className="font-medium">Description</label>
                      <p className="text-gray-500">A short description of the company</p>
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
                  <label className="grid-1-3 gap-5">
                    <div className="flex flex-col gap-1 text-sm">
                      <label className="font-medium">Email address</label>
                      <p className="text-gray-500">Add your company email</p>
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

                  {/* Country select moved before phone number */}
                  <label className="grid-1-3 gap-5">
                    <div className="flex flex-col gap-1 text-sm">
                      <label className="font-medium">Country</label>
                      <p className="text-gray-500">Select your country</p>
                    </div>
                    <div className="">
                      <CountrySelect
                        value={values.country}
                        onChange={(value: string) => setFieldValue('country', value)}
                        onDialCodeChange={(code: string) => setDialCode(code)}
                        error={errors.country}
                      />
                    </div>
                  </label>

                  <label className="grid-1-3 gap-5">
                    <div className="flex flex-col gap-1 text-sm">
                      <label className="font-medium">Phone number</label>
                      <p className="text-gray-500">Add your company phone number</p>
                    </div>
                    <div className="">
                      <PhoneNumberInput
                        name="phoneNumber"
                        dialCode={dialCode}
                        error={errors.phoneNumber}
                      />
                    </div>
                  </label>
                  <label className="grid-1-3 gap-5">
                    <div className="flex flex-col gap-1 text-sm">
                      <label className="font-medium">Timezone</label>
                      <p className="text-gray-500">Select your timezone</p>
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
                  <label className="grid-1-3 gap-5">
                    <div className="flex flex-col gap-1 text-sm">
                      <label className="font-medium">Currencies</label>
                      <p className="text-gray-500">Add your currencies</p>
                    </div>
                    <div className="grid gap-2">
                      {values.currencyList.map((currency) => {
                        const isPrimary = currency.code === values.currency;

                        return (
                          <div
                            key={currency.code}
                            className="flex items-center justify-between gap-5 rounded bg-gray-100 px-4 py-2"
                          >
                            <div className="grid gap-2">
                              <p className="text-sm">{currency.name}</p>
                              <div className="flex items-center gap-5">
                                <p className="font-semibold text-gray-600">{currency.code}</p>
                                {isPrimary && (
                                  <span className="status-approved rounded-full text-xs">
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <EditCurrencyButton company={company} currency={currency} />
                              <DeleteCurrencyButton company={company} currency={currency} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="">
                      <AddCurrencyButton company={company} />
                    </div>
                  </label>
                </div>

                <div className="grid-1-3 mt-5 items-center gap-5">
                  <p className=""></p>
                  <div className="flex justify-end gap-5">
                    <Link href="/administration" className="btn btn-outline">
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={!isValid || !authUser || processing}
                      className="btn btn-secondary"
                    >
                      Save Company
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
