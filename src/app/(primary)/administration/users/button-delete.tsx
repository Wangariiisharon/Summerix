'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { ADMIN } from '@/models/admin';
import { DialogTitle } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteDoc, doc } from 'firebase/firestore';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  admin: ADMIN;
};

export default function DeleteAdminButton({ admin }: Props) {
  const { authUser } = useAuthContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const doDelete = async () => {
    console.debug('doDelete > docId:', admin.docId);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage users.');
      return;
    }

    try {
      setProcessing(true);

      const docRef = doc(fbDb, Constants.fbAdmins, admin.docId);
      await deleteDoc(docRef);

      toast.success('Admin user deleted successfully.');
    } catch (error) {
      console.error('doDelete error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        <TrashIcon className="h-5 w-5 text-danger hover:opacity-50" />
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-md"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Confirm Delete Admin User?
        </DialogTitle>

        <div className="mt-10 grid items-center gap-3">
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Full Name:</label>
            <p>{admin.displayName}</p>
          </div>
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Email Address:</label>
            <p>{admin.email}</p>
          </div>
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Phone Number:</label>
            <p>{admin.phoneNumber}</p>
          </div>
        </div>

        <div className="mt-10 flex w-full justify-end gap-5">
          <button onClick={() => setIsOpen(false)} className="btn btn-outline-danger">
            Cancel
          </button>
          <button
            onClick={() => doDelete()}
            disabled={processing || !authUser}
            className="btn btn-danger"
          >
            Confirm Delete
          </button>
        </div>
      </DialogLayout>
    </>
  );
}
