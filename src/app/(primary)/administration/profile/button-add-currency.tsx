'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { COMPANY } from '@/models/company';
import { getCurrencies } from '@/services/utils';
import { DialogTitle } from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { arrayUnion, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

const CurrencySchema = () => {
  return Yup.object().shape({
    currency: Yup.string().trim().required('Currency is required.'),
  });
};

type Props = {
  company: COMPANY;
};

export default function AddCurrencyButton({ company }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const { authUser } = useAuthContext();

  const doSave = async (formValues: any) => {
    console.debug('doSave > formValues:', formValues);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage company.');
      return;
    }

    try {
      setProcessing(true);

      const currency = JSON.parse(formValues.currency);
      const docRef = doc(fbDb, Constants.fbCompanies, company.docId);
      await updateDoc(docRef, {
        currencyList: arrayUnion(currency),

        updatedBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      });
      toast.success('Currency added successfully.');
      setIsOpen(false);
    } catch (error) {
      console.error('doSave error:', error);
      toast.error('An error occurred during update.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-flex btn-outline-primary w-fit px-8"
      >
        <PlusCircleIcon className="h-5 w-5" />
        <p>Add Currency</p>
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-md"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Add another currency
        </DialogTitle>

        <Formik
          enableReinitialize={true}
          initialValues={{
            currency: '',
          }}
          validationSchema={CurrencySchema()}
          onSubmit={(values) => doSave(values)}
        >
          {({ isValid, submitForm }) => (
            <Form className="mt-6">
              {/* <h2 className="text-center font-bold"></h2> */}

              <div className="mt-5 grid gap-5 p-4">
                <div className="">
                  <Field as="select" name="currency" className="form-select">
                    <option value="" disabled>
                      Select currency...
                    </option>
                    {getCurrencies().map((currency) => {
                      return (
                        <option
                          key={currency.value}
                          value={JSON.stringify({
                            name: currency.name,
                            code: currency.value,
                          })}
                        >
                          {currency.name} ({currency.value})
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="currency" component="span" className="form-error" />
                </div>
              </div>

              <div className="mt-10 flex w-full justify-end gap-5">
                <p className=""></p>
                <div className="flex justify-end gap-5">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn btn-outline-danger"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => submitForm()}
                    disabled={!authUser || !isValid || processing}
                    className="btn btn-secondary"
                  >
                    Save
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </DialogLayout>
    </>
  );
}
