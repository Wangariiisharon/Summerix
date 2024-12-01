'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { DEPARTMENT } from '@/models/department';
import { DialogTitle } from '@headlessui/react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  department: DEPARTMENT;
};

export default function ToggleDepartmentButton({ department }: Props) {
  const { authUser } = useAuthContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const doToggle = async () => {
    console.debug('doToggle > docId:', department.docId);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage department.');
      return;
    }

    try {
      setProcessing(true);

      const docRef = doc(fbDb, Constants.fbDepartments, department.docId);
      await updateDoc(docRef, {
        'rolesMap.isActive': !department.rolesMap.isActive,
        updatedBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      });

      toast.success('Department user updated successfully.');
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
        className={`rounded px-4 py-2 hover:opacity-50 ${department.rolesMap.isActive ? 'bg-danger/20 text-red-700' : 'bg-secondary/20 text-teal-700'}`}
      >
        {department.rolesMap.isActive ? 'Archive' : 'Unarchive'}
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-md"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Confirm {department.rolesMap.isActive ? 'Archive' : 'Unarchive'} Department?
        </DialogTitle>

        <div className="mt-5 grid items-center gap-3">
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Display Name:</label>
            <p>{department.name}</p>
          </div>
        </div>

        <div className="mt-10 flex w-full justify-end gap-5">
          <button onClick={() => setIsOpen(false)} className="btn btn-outline-danger">
            Cancel
          </button>
          <button
            onClick={() => doToggle()}
            disabled={processing || !authUser}
            className={`btn ${department.rolesMap.isActive ? 'btn-danger' : 'btn-secondary'}`}
          >
            Confirm {department.rolesMap.isActive ? 'Archive' : 'Unarchive'}
          </button>
        </div>
      </DialogLayout>
    </>
  );
}
