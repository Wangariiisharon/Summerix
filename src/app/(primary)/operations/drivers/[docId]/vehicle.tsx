'use client';

import { useAuthContext } from '@/app/auth-provider';
import DialogLayout from '@/components/dialog-layout';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { DRIVER, DRIVER_DETAILS } from '@/models/driver';
import { VEHICLE, VEHICLE_DETAILS } from '@/models/vehicle';
import { getVehicleDrivers } from '@/services/driver';
import { getAvatarPhoto } from '@/services/utils';
import { getDriverVehicles } from '@/services/vehicle';
import {
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  driver: DRIVER;
};

export default function VehicleAllocation({ driver }: Props) {
  const [selected, setSelected] = useState<VEHICLE_DETAILS | null>(driver.vehicle);
  const [vehicles, setVehicles] = useState<VEHICLE[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const { authUser } = useAuthContext();

  useEffect(() => {
    const colRef = collection(fbDb, Constants.fbVehicles);
    const queryRef = query(
      colRef,
      where('company.docId', '==', driver.company.docId),
      where('driver', '==', null),
    );

    const unsubscribe = onSnapshot(
      queryRef,
      async (snapshot) => {
        const promises = snapshot.docs.map(async (doc) => {
          const data = doc.data() as VEHICLE;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;
          data.photoURL = data.photoURL || getAvatarPhoto(data.name);

          return data;
        });

        const results = await Promise.all(promises);
        setVehicles(results);
      },
      (error) => {
        console.error('onSnapshot > error:', error);
      },
    );

    return () => unsubscribe();
  }, [driver.company.docId]);

  const doConfirmAllocation = async () => {
    if (!(authUser?.isAdmin || authUser?.isOwner) || !selected) {
      toast.error('You are not authorised to manage drivers.');
      return;
    }

    try {
      setProcessing(true);

      const batch = writeBatch(fbDb);
      const snapshot = await getDriverVehicles(driver);
      snapshot.docs.map((myDoc) => {
        const docRef = doc(fbDb, Constants.fbVehicles, myDoc.id);
        batch.update(docRef, {
          vehicle: null,
          updatedBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          lastUpdated: serverTimestamp(),
        });
      });

      const driverDocRef = doc(fbDb, Constants.fbDrivers, driver.docId);
      batch.update(driverDocRef, {
        vehicle: {
          docId: selected.docId,
          name: selected.name,
          regNumber: selected.regNumber,
          photoURL: selected.photoURL,
        },
        updatedBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      });

      const vehicleDocRef = doc(fbDb, Constants.fbVehicles, selected.docId);
      batch.update(vehicleDocRef, {
        driver: {
          docId: driver.docId,
          email: driver.email,
          displayName: driver.displayName,
          phoneNumber: driver.phoneNumber,
          photoURL: driver.photoURL,
        },
        updatedBy: {
          authId: authUser.uid,
          email: authUser.email,
        },
        lastUpdated: serverTimestamp(),
      });

      await batch.commit();

      toast.success('Vehicle allocated successfully.');
    } catch (error) {
      console.error('doConfirmAllocation error:', error);
      toast.error('Vehicle allocation error.');
    } finally {
      setProcessing(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        <div className="btn btn-outline-secondary btn-flex w-fit">
          <UserPlusIcon className="h-5 w-5" />
          <p>Allocate Vehicle</p>
        </div>
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-xl min-h-96"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Driver Vehicle Allocation
        </DialogTitle>

        <div className="mt-5 grid items-center gap-5">
          <h3 className="font-medium">Driver</h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-5">
              <label className="form-label">Full Name:</label>
              <p>{driver.displayName}</p>
            </div>
            <div className="flex items-center justify-between gap-5">
              <label className="form-label">Email Address:</label>
              <p>{driver.email}</p>
            </div>
            <div className="flex items-center justify-between gap-5">
              <label className="form-label">Phone Number:</label>
              <p>{driver.phoneNumber}</p>
            </div>
          </div>

          <h3 className="font-medium">Vehicle</h3>
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Allocate to:</label>
            <Listbox value={selected} onChange={setSelected}>
              <div className="relative mt-2 w-1/2">
                <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm/6">
                  <div className="flex items-center gap-2">
                    {selected && (
                      <Image
                        src={selected.photoURL}
                        alt={selected.name}
                        className="size-5 shrink-0 rounded-full"
                        width={100}
                        height={100}
                      />
                    )}
                    {!selected && (
                      <div className="shrink-0 rounded-full bg-gray-300 p-1">
                        <UserPlusIcon className="h-3 w-3" />
                      </div>
                    )}
                    <p className="block truncate">{selected?.name}</p>
                  </div>
                  <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                    <ChevronUpDownIcon aria-hidden="true" className="size-5 text-gray-400" />
                  </span>
                </ListboxButton>

                <ListboxOptions
                  transition
                  className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
                >
                  {vehicles.map((vehicle) => (
                    <ListboxOption
                      key={vehicle.docId}
                      value={vehicle}
                      className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-primary data-[focus]:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={vehicle.photoURL}
                          alt={vehicle.name}
                          className="size-5 shrink-0 rounded-full"
                          width={100}
                          height={100}
                        />
                        <p className="block truncate font-normal group-data-[selected]:font-semibold">
                          {vehicle.name}
                        </p>
                      </div>

                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                        <CheckIcon aria-hidden="true" className="size-5" />
                      </span>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>
        </div>

        <div className="mt-10 flex w-full justify-end gap-5">
          <button onClick={() => setIsOpen(false)} className="btn btn-outline-danger">
            Cancel
          </button>
          <button
            onClick={() => doConfirmAllocation()}
            disabled={processing || !selected}
            className="btn btn-secondary"
          >
            Confirm Allocation
          </button>
        </div>
      </DialogLayout>
    </>
  );
}
