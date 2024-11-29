'use client';

import * as Yup from 'yup';
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
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Constants from '@/Constants';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { SUPPLIER } from '@/models/supplier';
import { DocumentIcon, EyeIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getSupplierByEmail, getSupplierByName } from '@/services/supplier';
import Suppliers from '@/json/suppliers.json';
import AddDocumentButton from './button-add-document';
import DeleteDocumentButton from './button-delete-document';

const SupplierSchema = (companyId: string, docId: string) => {
  return Yup.object().shape({
    name: Yup.string()
      .required('Name is required.')
      .test({
        exclusive: true,
        name: 'display-name',
        message: 'Name is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getSupplierByName(companyId, value);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return doc.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    email: Yup.string()
      .trim()
      .required('Email is required.')
      .email('Enter a valid email address.')
      .test({
        exclusive: true,
        name: 'email-address',
        message: 'Email is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getSupplierByEmail(companyId, value);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return doc.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    typeOfSupplies: Yup.string().required('Type of supplies is required.'),
    paymentTerms: Yup.string().required('Payment terms is required.'),
    taxRegNumber: Yup.string().required('Tax registration number is required.'),
    currency: Yup.string().required('Currency is required.'),
  });
};

type Props = {
  params: { docId: string };
};

export default function Supplier({ params }: Props) {
  const [supplier, setSupplier] = useState<SUPPLIER>();
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();
  const router = useRouter();
  const { docId } = params;

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbSuppliers, docId);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          const data = snapshot.data() as SUPPLIER;
          data.name = data.name || '';
          // data.photoURL = data.photoURL || getAvatarPhoto(data.name);
          data.docId = snapshot.id;
          setSupplier(data);
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
      toast.error('You are not authorised to manage suppliers.');
      return;
    }

    try {
      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbSuppliers);
        await addDoc(colRef, {
          ...formValues,
          name: formValues.name.trim(),
          email: formValues.email.trim(),

          createdBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          dateCreated: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
        toast.success('New supplier added successfully.');
      } else {
        const docRef = doc(fbDb, Constants.fbSuppliers, docId);
        await updateDoc(docRef, {
          ...formValues,
          lastUpdated: serverTimestamp(),
        });
        toast.success('Supplier updated successfully.');
      }

      router.push('/operations/suppliers');
    } catch (error) {
      console.error('save supplier error:', error);
    }
  };

  if (!company) return <></>;

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <h2 className="font-bold">Supplier</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          name: supplier?.name || '',
          email: supplier?.email || '',
          company: supplier?.company || {
            docId: company.docId,
            name: company.name || '',
            email: company.email || '',
            phoneNumber: company.phoneNumber || '',
            regNumber: company.regNumber || '',
          },
          contacts: supplier?.contacts || [{ name: '', phoneNumber: '' }],
          documents: supplier?.documents || [],
          typeOfSupplies: supplier?.typeOfSupplies || '',
          paymentTerms: supplier?.paymentTerms || '',
          taxRegNumber: supplier?.taxRegNumber || '',
          currency: supplier?.currency || company.currency || '',
          notes: supplier?.notes || '',
          updatedBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
        }}
        validationSchema={SupplierSchema(authUser?.companyId || 'xyz', docId)}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid, values, setFieldValue }) => (
          <Form className="">
            <div className="mt-5 grid gap-5 p-4">
              <label className="grid-1-3 gap-5">
                <div className="text-sm">
                  <label className="font-medium">Name</label>
                </div>
                <div className="">
                  <Field
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Supplier Name"
                  />
                  <ErrorMessage name="name" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3 gap-5">
                <div className="text-sm">
                  <label className="font-medium">Email Address</label>
                </div>
                <div className="">
                  <Field
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Email Address"
                  />
                  <ErrorMessage name="email" component="span" className="form-error" />
                </div>
              </label>

              <div className="grid-1-3 gap-5">
                <div className="text-sm">
                  <label className="font-medium">Contacts</label>
                </div>
                <div className="grid gap-3">
                  {values.contacts.map((contact, i) => {
                    return (
                      <div
                        key={`supplier-contact-${i}`}
                        className="flex items-center justify-between gap-5 rounded bg-gray-100 px-4 py-2"
                      >
                        <div className="flex gap-3">
                          <label className="block">
                            <label className="form-label">Name</label>
                            <div className="">
                              <Field
                                type="text"
                                name={`contacts[${i}].name`}
                                className="form-input"
                                placeholder="Name"
                              />
                              <ErrorMessage
                                name={`contacts[${i}].name`}
                                component="span"
                                className="form-error"
                              />
                            </div>
                          </label>
                          <label className="block">
                            <label className="form-label">Phone Number</label>
                            <div className="">
                              <Field
                                type="text"
                                name={`contacts[${i}].phoneNumber`}
                                className="form-input"
                                placeholder="Phone Number"
                              />
                              <ErrorMessage
                                name={`contacts[${i}].phoneNumber`}
                                component="span"
                                className="form-error"
                              />
                            </div>
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const contacts = values.contacts;
                            contacts.splice(i, 1);
                            setFieldValue('contacts', [...new Set(contacts)]);
                          }}
                        >
                          <TrashIcon className="h-5 w-5 text-danger hover:opacity-50" />
                        </button>
                      </div>
                    );
                  })}

                  {values.contacts.length === 0 && (
                    <p className="text-gray-400">No items to display.</p>
                  )}
                </div>

                <div className="">
                  <button
                    type="button"
                    onClick={() => {
                      const contacts = values.contacts;
                      contacts.push({ name: '', phoneNumber: '' });
                      setFieldValue('contacts', [...new Set(contacts)]);
                    }}
                    className="btn btn-flex btn-outline-primary w-fit px-8"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    <p>Add Contact</p>
                  </button>
                </div>
              </div>

              <hr className="my-3" />

              <label className="grid-1-3 gap-5">
                <div className="flex flex-col gap-1 text-sm">
                  <label className="font-medium">Type of Supplies</label>
                  <p className="text-gray-500">Select type of supplies</p>
                </div>
                <div className="">
                  <Field as="select" name="typeOfSupplies" className="form-select">
                    <option value="" disabled>
                      Select type...
                    </option>
                    {Suppliers.typeOfSupplies.map(({ name, value }) => {
                      return (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="typeOfSupplies" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3 gap-5">
                <div className="flex flex-col gap-1 text-sm">
                  <label className="font-medium">Paymemt Terms</label>
                  <p className="text-gray-500">Select payment terms</p>
                </div>
                <div className="">
                  <Field as="select" name="paymentTerms" className="form-select">
                    <option value="" disabled>
                      Select terms...
                    </option>
                    {Suppliers.paymentTerms.map(({ name, value }) => {
                      return (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="paymentTerms" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3 gap-5">
                <div className="text-sm">
                  <label className="font-medium">Tax Registration Number</label>
                  <p className="text-gray-500">Supplier`s tax registration number.</p>
                </div>
                <div className="">
                  <Field
                    type="text"
                    name="taxRegNumber"
                    className="form-input"
                    placeholder="Tax Reg. Number"
                  />
                  <ErrorMessage name="taxRegNumber" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3 gap-5">
                <div className="flex flex-col gap-1 text-sm">
                  <label className="font-medium">Currency</label>
                  <p className="text-gray-500">Preferred currency</p>
                </div>
                <div className="">
                  <Field as="select" name="currency" className="form-select">
                    <option value="" disabled>
                      Select currency...
                    </option>
                    {company.currencyList.map(({ name, code }) => {
                      return (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="currency" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3 gap-5">
                <div className="flex flex-col text-sm">
                  <label className="font-medium">Notes (optional)</label>
                  <p className="text-gray-500">Description, summary, etc</p>
                </div>
                <div className="">
                  <Field name="notes" className="form-input" as="textarea" rows={4} />
                  <ErrorMessage name="notes" component="span" className="form-error" />
                </div>
              </label>

              {supplier && (
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

                            <DeleteDocumentButton document={document} supplier={supplier} />
                          </div>
                        );
                      })}

                      {values.documents.length === 0 && (
                        <p className="text-gray-400">No items to display.</p>
                      )}
                    </div>

                    <div className="">
                      <AddDocumentButton supplier={supplier} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <hr className="my-3" />

            <div className="grid-1-3 mt-10 gap-5">
              <p className=""></p>
              <div className="flex justify-end gap-5">
                <Link href="/operations/suppliers" className="btn btn-outline">
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
