'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { DRIVER } from '@/models/driver';
import { doUploadImage } from '@/services/utils';
import { DialogTitle } from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { arrayUnion, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

const DocumentSchema = () => {
  return Yup.object().shape({
    fileName: Yup.string().trim().required('File name is required.'),
    downloadURL: Yup.string().trim().required('Download URL is required.'),
    status: Yup.string().trim().required('Status is required.'),
  });
};

type Props = {
  driver: DRIVER;
};

export default function AddDocumentButton({ driver }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const { authUser } = useAuthContext();

  const doSave = async (formValues: any) => {
    console.debug('doSave > formValues:', formValues);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage drivers.');
      return;
    }

    try {
      setProcessing(true);

      const docRef = doc(fbDb, Constants.fbDrivers, driver.docId);
      await updateDoc(docRef, {
        documents: arrayUnion(formValues),

        updatedBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      });
      toast.success('Document added successfully.');
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
        <p>Add Document</p>
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-md"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Add another document
        </DialogTitle>

        <Formik
          enableReinitialize={true}
          initialValues={{
            fileName: '',
            downloadURL: '',
            status: '',
          }}
          validationSchema={DocumentSchema()}
          onSubmit={(values) => doSave(values)}
        >
          {({ isValid, setFieldValue }) => (
            <Form className="">
              <div className="mt-5 grid gap-5">
                <label className="block">
                  <label className="form-label">File Name</label>
                  <Field type="text" name="fileName" className="form-input" />
                  <ErrorMessage name="fileName" component="span" className="form-error" />
                </label>
                <label className="block">
                  <label className="form-label">File upload (Download URL)</label>
                  <Field name="downloadURL">
                    {() => (
                      <input
                        type="file"
                        // accept="image/*"
                        onChange={async (event) => {
                          const file = event.currentTarget?.files?.[0];
                          if (file && driver.docId) {
                            const downloadUrl = await doUploadImage(
                              file,
                              `drivers/${driver.docId}`,
                              file.name,
                            );
                            setFieldValue('downloadURL', downloadUrl);
                            toast.success('File uploaded successfully.');
                          }
                        }}
                        className="form-input"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="downloadURL" component="span" className="form-error" />
                </label>
                <label className="block">
                  <label className="form-label">Status</label>
                  <Field as="select" name="status" className="form-select">
                    <option value="" disabled>
                      Select status...
                    </option>
                    {[
                      { name: 'Active', value: 'active' },
                      { name: 'Expired', value: 'expired' },
                    ].map(({ name, value }) => {
                      return (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="status" component="span" className="form-error" />
                </label>
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
                    type="submit"
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
