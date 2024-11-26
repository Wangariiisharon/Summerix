'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { ADMIN } from '@/models/admin';
import { DialogTitle } from '@headlessui/react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  admin: ADMIN;
};

export default function ToggleAdminButton({ admin }: Props) {
  const { authUser } = useAuthContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const doToggle = async () => {
    console.debug('doToggle > docId:', admin.docId);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage users.');
      return;
    }

    try {
      setProcessing(true);

      const docRef = doc(fbDb, Constants.fbAdmins, admin.docId);
      await updateDoc(docRef, {
        'rolesMap.isActive': !admin.rolesMap.isActive,
        updatedBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      });

      toast.success('Admin user updated successfully.');
    } catch (error) {
      console.error('doToggle error:', error);
    } finally {
      setProcessing(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`rounded px-4 py-2 hover:opacity-50 ${admin.rolesMap.isActive ? 'bg-danger/20 text-red-700' : 'bg-secondary/20 text-teal-700'}`}
      >
        {admin.rolesMap.isActive ? 'Archive' : 'Unarchive'}
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-md"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Confirm {admin.rolesMap.isActive ? 'Archive' : 'Unarchive'} Admin User?
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
            onClick={() => doToggle()}
            disabled={processing || !authUser}
            className={`btn ${admin.rolesMap.isActive ? 'btn-danger' : 'btn-secondary'}`}
            // className="btn btn-danger"
          >
            Confirm {admin.rolesMap.isActive ? 'Archive' : 'Unarchive'}
          </button>
        </div>
      </DialogLayout>
    </>
  );
}
