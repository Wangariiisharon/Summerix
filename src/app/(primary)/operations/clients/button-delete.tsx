'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { CLIENT } from '@/models/client';
import { DialogTitle } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteDoc, doc } from 'firebase/firestore';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  client: CLIENT;
};

export default function DeleteClientButton({ client }: Props) {
  const { authUser } = useAuthContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const doDelete = async () => {
    console.debug('doDelete > docId:', client.docId);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage trips.');
      return;
    }

    try {
      setProcessing(true);

      const docRef = doc(fbDb, Constants.fbClients, client.docId);
      await deleteDoc(docRef);

      toast.success('Client deleted successfully.');
    } catch (error) {
      console.error('doDelete error:', error);
    } finally {
      setProcessing(false);
      setIsOpen(false);
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
          Confirm Delete Client?
        </DialogTitle>

        <div className="mt-5 grid items-center gap-3">
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Name:</label>
            <p>{client.displayName}</p>
          </div>
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Phone Number:</label>
            <p>{client.phoneNumber}</p>
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
