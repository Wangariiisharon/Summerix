'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { COMPANY } from '@/models/company';
import { doUploadImage } from '@/services/utils';
import { DialogTitle } from '@headlessui/react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  company: COMPANY;
};

export default function UploadPhotoButton({ company }: Props) {
  const { authUser } = useAuthContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const doSave = async (formValues: any) => {
    console.debug('doSave > formValues:', formValues);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage company.');
      return;
    }

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
      toast.success('Company photo updated successfully.');
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
        onClick={() => setIsOpen(true)}
        className="btn btn-flex btn-secondary mt-5 w-fit px-8"
      >
        <CameraIcon className="h-5 w-5" />
        <p>Upload New Photo</p>
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-md"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Upload Company Photo
        </DialogTitle>

        <Formik
          enableReinitialize={true}
          initialValues={{
            photoURL: company.photoURL || '',
            updatedBy: {
              authId: authUser?.uid,
              email: authUser?.email,
            },
          }}
          onSubmit={(values) => doSave(values)}
        >
          {({ isValid, setFieldValue, values }) => (
            <Form className="">
              <div className="mt-5 grid gap-5">
                <label className="block">
                  <label className="form-label">Company Photo</label>
                  <Field name="photoURL">
                    {() => (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.currentTarget?.files?.[0];
                          if (file && authUser) {
                            const downloadUrl = await doUploadImage(
                              file,
                              `companies/${authUser.uid}`,
                              'company-photo',
                            );
                            setFieldValue('photoURL', downloadUrl);
                            toast.success('Image uploaded successfully.');
                          }
                        }}
                        className="form-input"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="photoURL" component="span" className="form-error" />
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
                    disabled={
                      !isValid || !authUser || processing || company.photoURL === values.photoURL
                    }
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
