'use client';

import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { TRIP } from '@/models/trip';
import { VEHICLE, VEHICLE_DETAILS, VEHICLE_STATUS } from '@/models/vehicle';
import { getAvatarPhoto } from '@/services/utils';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PlusIcon, TruckIcon } from '@heroicons/react/24/outline';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
  companyId: string;
  setFieldValue: Function;
  trip?: TRIP;
};

export default function TripVehicle({ companyId, setFieldValue, trip }: Props) {
  const [selected, setSelected] = useState<VEHICLE_DETAILS | null>(trip?.vehicle || null);
  const [vehicles, setVehicles] = useState<VEHICLE[]>([]);

  useEffect(() => {
    const colRef = collection(fbDb, Constants.fbVehicles);
    const queryRef = query(
      colRef,
      where('company.docId', '==', companyId),
      where('status', '==', VEHICLE_STATUS.available),
      where('driver', '!=', null),
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
  }, [companyId]);

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Listbox
          value={selected}
          onChange={(value) => {
            const vehicle = vehicles.find((v) => v.docId === value?.docId);
            if (vehicle && vehicle.docId) {
              setFieldValue('driver', vehicle.driver);
              setFieldValue('vehicle', {
                docId: vehicle.docId,
                name: vehicle.name,
                photoURL: vehicle.photoURL,
                regNumber: vehicle.regNumber,
              });
            }

            setSelected(value);
          }}
        >
          <div className="relative mt-2 w-full">
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm/6">
              <div className="flex items-center gap-2">
                {selected && (
                  <Image
                    src={selected.photoURL}
                    alt={selected.name}
                    className="size-10 shrink-0 rounded-full"
                    width={100}
                    height={100}
                  />
                )}
                {!selected && (
                  <div className="shrink-0 rounded-full bg-gray-300 p-1">
                    <TruckIcon className="h-3 w-3" />
                  </div>
                )}
                <div className="block truncate">
                  <p className="font-medium">{selected?.name}</p>
                  <p className="text-xs">{selected?.regNumber}</p>
                </div>
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
                      className="size-10 shrink-0 rounded-full"
                      width={100}
                      height={100}
                    />
                    <div className="block truncate group-data-[selected]:font-semibold">
                      <p className="font-medium">{vehicle.name}</p>
                      <p className="text-xs">{vehicle.regNumber}</p>
                    </div>
                    
                  </div>

                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                    <CheckIcon aria-hidden="true" className="size-5" />
                  </span>
                </ListboxOption>
              ))}

              {vehicles.length === 0 && (
                <Link href="/operations/vehicles/new">
                  <div className="btn btn-flex btn-secondary m-2">
                    <PlusIcon className="h-5 w-5" />
                    <p>Add New Vehicle</p>
                  </div>
                </Link>
              )}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
    </>
  );
}
