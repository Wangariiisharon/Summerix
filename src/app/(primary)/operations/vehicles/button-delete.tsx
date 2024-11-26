'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { VEHICLE } from '@/models/vehicle';
import { getVehicleDrivers } from '@/services/driver';
import { DialogTitle } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  vehicle: VEHICLE;
};

export default function DeleteVehicleButton({ vehicle }: Props) {
  const { authUser } = useAuthContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const doDelete = async () => {
    console.debug('doDelete > docId:', vehicle.docId);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage vehicles.');
      return;
    }

    try {
      setProcessing(true);

      const batch = writeBatch(fbDb);
      const snapshot = await getVehicleDrivers(vehicle);
      snapshot.docs.map((myDoc) => {
        const docRef = doc(fbDb, Constants.fbDrivers, myDoc.id);
        batch.update(docRef, {
          vehicle: null,
          updatedBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          lastUpdated: serverTimestamp(),
        });
      });

      const docRef = doc(fbDb, Constants.fbVehicles, vehicle.docId);
      batch.delete(docRef);

      await batch.commit();

      toast.success('Vehicle deleted successfully.');
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
          Confirm Delete Vehicle?
        </DialogTitle>

        <div className="mt-10 grid items-center gap-3">
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Name:</label>
            <p>{vehicle.name}</p>
          </div>
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Reg. Number:</label>
            <p>{vehicle.regNumber}</p>
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
