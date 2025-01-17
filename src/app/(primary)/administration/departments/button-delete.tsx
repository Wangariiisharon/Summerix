'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { DEPARTMENT } from '@/models/department';
import { checkHasUsers } from '@/services/departments';
import { DialogTitle } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteDoc, doc } from 'firebase/firestore';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  department: DEPARTMENT;
};

export default function DeleteDeprtmentButton({ department }: Props) {
  const { authUser } = useAuthContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [hasUsers, setHasUsers] = useState<boolean>(false);

  const doDelete = async () => {
    console.debug('doDelete > docId:', department.docId);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage departments.');
      return;
    }

    try {
      setProcessing(true);
      const hasAssociatedUsers = await checkHasUsers(department);

      if (hasAssociatedUsers) {
        setHasUsers(true);
        toast.error(
          'Cannot delete department with associated users. Please reassign or remove users first.',
        );
        return;
      }

      const docRef = doc(fbDb, Constants.fbDepartments, department.docId);
      await deleteDoc(docRef);

      toast.success('Department deleted successfully.');
      setIsOpen(false);
    } catch (error) {
      console.error('doDelete error:', error);
      toast.error('Failed to delete department.');
    } finally {
      setProcessing(false);
    }
  };
  // const doDeleteDepartUsers=() => {
  //   // compare fb.admins o fb.departments for documents with same selectd department.
  // }

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
          Confirm Delete Department?
        </DialogTitle>

        <div className="mt-5 grid items-center gap-3">
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Display Name:</label>
            <p>{department.name}</p>
          </div>
          {hasUsers && (
            <div className="mt-2 text-sm text-red-600">
              This department cannot be deleted because it has associated users. Please reassign or
              remove all users from this department first.
            </div>
          )}
        </div>

        <div className="mt-10 flex w-full justify-end gap-5">
          <button onClick={() => setIsOpen(false)} className="btn btn-outline-danger">
            Cancel
          </button>
          <button
            onClick={() => doDelete()}
            disabled={processing || !authUser || hasUsers}
            className="btn btn-danger"
          >
            Confirm Delete
          </button>
        </div>
      </DialogLayout>
    </>
  );
}
