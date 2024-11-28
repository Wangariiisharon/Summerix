'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { DOCUMENT } from '@/models/document';
import { DRIVER } from '@/models/driver';
import { DialogTitle } from '@headlessui/react';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { arrayRemove, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  driver: DRIVER;
  document: DOCUMENT;
};

export default function DeleteDocumentButton({ driver, document }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const { authUser } = useAuthContext();

  const doRemove = async () => {
    console.debug('doRemove > document:', document);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage company.');
      return;
    }

    try {
      setProcessing(true);

      const docRef = doc(fbDb, Constants.fbDrivers, driver.docId);
      await updateDoc(docRef, {
        documents: arrayRemove(document),

        updatedBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      });
      toast.success('Document removed successfully.');
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
      <button type="button" onClick={() => setIsOpen(true)}>
        <TrashIcon className="h-5 w-5 text-danger hover:opacity-50" />
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-sm"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Remove document entry?
        </DialogTitle>

        <div className="mt-5 grid items-center gap-3">
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">File Name:</label>
            <p>{document.fileName}</p>
          </div>
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Download URL:</label>
            <Link
              href={document.downloadURL}
              className="flex items-center gap-2 text-xs text-primary hover:opacity-50"
              target="_blank"
            >
              <EyeIcon className="h-4 w-4" /> View File
            </Link>
          </div>
        </div>

        <div className="mt-10 flex w-full justify-end gap-5">
          <button onClick={() => setIsOpen(false)} className="btn btn-outline-danger">
            Cancel
          </button>
          <button
            onClick={() => doRemove()}
            disabled={processing || !authUser}
            className="btn btn-danger"
          >
            Confirm Remove
          </button>
        </div>
      </DialogLayout>
    </>
  );
}
