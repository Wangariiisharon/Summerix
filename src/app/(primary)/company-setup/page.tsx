'use client';

import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { getCompanyByEmail, getCompanyByName, getCompanyByPhoneNumber } from '@/services/company';
import { getCountries, getCurrencies, getTimezones } from '@/services/utils';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Combobox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { isValidPhoneNumber } from 'libphonenumber-js';
// Memoize countries data
const countries = getCountries();
const currencies = getCurrencies();
const timezones = getTimezones();

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
      .test({
        name: 'phone',
        message: 'Invalid phone number for selected country',
        test: function (value) {
          if (!value) return false;
          const { parent } = this;

          try {
            // Find country from countries array using the selected country value
            const country = countries.find((c) => c.value === parent.country);
            if (!country?.iso2) return false;

            // Add the dial code if it's not already there
            const fullNumber = value.startsWith('+') ? value : `${country.dialing_code}${value}`;
            console.log(country);
            // Validate phone number for specific country using iso2 code
            return isValidPhoneNumber(fullNumber, country.iso2);
          } catch (error) {
            console.error('Phone validation error:', error);
            return false;
          }
        },
      })
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
  const [selectedDialCode, setSelectedDialCode] = useState('+1');
  const [countryQuery, setCountryQuery] = useState('');
  const [currencyQuery, setCurrencyQuery] = useState('');
  const [timezoneQuery, setTimezoneQuery] = useState('');
  const { authUser } = useAuthContext();
  const router = useRouter();

  const filteredCountries = useMemo(() => {
    return countryQuery === ''
      ? countries
      : countries.filter((country) =>
          country.name.toLowerCase().includes(countryQuery.toLowerCase()),
        );
  }, [countryQuery, countries]);

  const filteredCurrencies = useMemo(() => {
    return currencyQuery === ''
      ? currencies
      : currencies.filter((currency) =>
          currency.name.toLowerCase().includes(currencyQuery.toLowerCase()),
        );
  }, [currencyQuery, currencies]);

  const filteredTimezones = useMemo(() => {
    return timezoneQuery === ''
      ? timezones
      : timezones.filter((timezone) =>
          timezone.name.toLowerCase().includes(timezoneQuery.toLowerCase()),
        );
  }, [timezoneQuery, timezones]);

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
    <main className="p-4">
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
        {({ isValid, setFieldValue, values }) => (
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
                  <label className="font-medium">Country</label>
                </div>
                <div className="relative">
                  <Combobox
                    value={values.country}
                    onChange={(value) => {
                      const country = countries.find((c) => c.value === value);
                      setSelectedDialCode(country?.dialing_code || '+1');
                      setFieldValue('country', value);
                    }}
                  >
                    <div className="relative">
                      <Combobox.Input
                        className="form-select"
                        onChange={(event) => setCountryQuery(event.target.value)}
                        displayValue={(value: any) =>
                          countries.find((country) => country.value === value)?.name || ''
                        }
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </Combobox.Button>
                    </div>
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {filteredCountries.map((country) => (
                        <Combobox.Option
                          key={country.value}
                          value={country.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-3 pr-9 ${
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {country.name}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  </Combobox>
                  <ErrorMessage name="country" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Phone number</label>
                </div>
                <div>
                  <div className="grid grid-cols-[80px_1fr] overflow-hidden rounded-md border border-gray-300 bg-white">
                    <div className="flex items-center justify-center border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                      {selectedDialCode}
                    </div>
                    <Field
                      type="tel"
                      name="phoneNumber"
                      className="block w-full border-0 px-3 py-1.5 text-gray-900 ring-0 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Phone number"
                    />
                  </div>
                  <ErrorMessage name="phoneNumber" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Timezone</label>
                </div>
                <div className="relative">
                  <Combobox
                    value={values.timezone}
                    onChange={(value) => setFieldValue('timezone', value)}
                  >
                    <div className="relative">
                      <Combobox.Input
                        className="form-select"
                        onChange={(event) => setTimezoneQuery(event.target.value)}
                        displayValue={(value: any) =>
                          timezones.find((timezone) => timezone.value === value)?.name || ''
                        }
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </Combobox.Button>
                    </div>
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {filteredTimezones.map((timezone) => (
                        <Combobox.Option
                          key={timezone.value}
                          value={timezone.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-3 pr-9 ${
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {timezone.name}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  </Combobox>
                  <ErrorMessage name="timezone" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Currency</label>
                </div>
                <div className="relative">
                  <Combobox
                    value={values.currency}
                    onChange={(value) => setFieldValue('currency', value)}
                  >
                    <div className="relative">
                      <Combobox.Input
                        className="form-select"
                        onChange={(event) => setCurrencyQuery(event.target.value)}
                        displayValue={(value: any) =>
                          currencies.find((currency) => currency.value === value)?.name || ''
                        }
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </Combobox.Button>
                    </div>
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {filteredCurrencies.map((currency) => (
                        <Combobox.Option
                          key={currency.value}
                          value={currency.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-3 pr-9 ${
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {currency.name}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  </Combobox>
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
