'use client';

import { useAuthContext } from '@/app/auth-provider';
import { createOrUpdateCompany } from '@/services/company';
import { Company } from '@/types/company';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CompanySchema } from '@/app/schemas/company-schema';
import { AppError } from '@/types/errors';
import { CountrySelect } from '@/components/form-fields/country-select';
import { PhoneNumberInput } from '@/components/form-fields/phone-number-select';
import { TimezoneSelect } from '@/components/form-fields/timezone-select';
import { CurrencySelect } from '@/components/form-fields/currency-select';


export default function CompanySetup() {
  const [processing, setProcessing] = useState(false);
  const [selectedDialCode, setSelectedDialCode] = useState('+1');
  const { authUser } = useAuthContext();
  const router = useRouter();

  const handleSave = async (formValues: Company) => {
    if (!authUser?.user) return;

    try {
      setProcessing(true);
      await createOrUpdateCompany({
        data: formValues,
        userId: authUser.user.uid,
        userEmail: authUser.email || '',
      });

      toast.success('Company profile saved successfully.');
      router.push('/');
    } catch (error) {
      console.error('Save error:', error);
      const appError = error as AppError;
      toast.error(appError.message || 'Failed to save company profile. Please try again.');
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
          email: `${''}`,
          phoneNumber: `${authUser?.phoneNumber || ''}`,
          country: '',
          timezone: '',
          currency: '',
        }}
        validationSchema={CompanySchema(authUser?.uid)}
        onSubmit={handleSave}
      >
        {({ isValid, setFieldValue, values, errors }) => (
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
                  <CountrySelect
                    value={values.country}
                    onChange={(value: any) => setFieldValue('country', value)}
                    onDialCodeChange={setSelectedDialCode}
                    error={errors.country}
                    as="div" // Add this prop to fix Fragment issue
                  />
                  <ErrorMessage name="country" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Phone number</label>
                </div>
                <div>
                  <PhoneNumberInput
                    name="phoneNumber"
                    dialCode={selectedDialCode}
                    error={errors.phoneNumber}
                  />
                  <ErrorMessage name="phoneNumber" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Timezone</label>
                </div>
                <div className="relative">
                  <TimezoneSelect
                    value={values.timezone}
                    onChange={(value: any) => setFieldValue('timezone', value)}
                    error={errors.timezone}
                    as="div" // Add this prop to fix Fragment issue
                  />
                  <ErrorMessage name="timezone" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Currency</label>
                </div>
                <div className="relative">
                  <CurrencySelect
                    value={values.currency}
                    onChange={(value: any) => setFieldValue('currency', value)}
                    error={errors.currency}
                    as="div" // Add this prop to fix Fragment issue
                  />
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
