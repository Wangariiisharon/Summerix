'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { COMPANY } from '@/models/company';
import { DialogTitle } from '@headlessui/react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  company: COMPANY;
  currency: any;
};

export default function EditCurrencyButton({ company, currency }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const { authUser } = useAuthContext();

  const isPrimary = currency.code === company.currency;

  const doSave = async () => {
    console.debug('doSave > currency:', currency);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage company.');
      return;
    }

    try {
      setProcessing(true);

      const docRef = doc(fbDb, Constants.fbCompanies, company.docId);
      await updateDoc(docRef, {
        currency: currency.code,

        updatedBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      });
      toast.success('Currency updated successfully.');
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
        <PencilSquareIcon className="h-5 w-5 text-primary hover:opacity-50" />
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-md"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Set as primary currency?
        </DialogTitle>

        <div className="mt-10 grid items-center gap-3">
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Name:</label>
            <p>{currency.name}</p>
          </div>
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Code:</label>
            <p>{currency.code}</p>
          </div>
        </div>

        <div className="mt-10 flex w-full justify-end gap-5">
          <button onClick={() => setIsOpen(false)} className="btn btn-outline-danger">
            Cancel
          </button>
          <button
            onClick={() => doSave()}
            disabled={!authUser || isPrimary || processing}
            className="btn btn-primary"
          >
            Confirm Save
          </button>
        </div>
      </DialogLayout>
    </>
  );
}
