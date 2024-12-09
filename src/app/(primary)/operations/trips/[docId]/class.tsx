'use client';

import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { TRIP } from '@/models/trip';
import { CLASS, CLASS_DETAILS } from '@/models/class';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PlusIcon, TruckIcon } from '@heroicons/react/24/outline';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
  companyId: string;
  setFieldValue: Function;
  trip?: TRIP;
};

export default function TripClass({ companyId, setFieldValue, trip }: Props) {
  const [selected, setSelected] = useState<CLASS_DETAILS | null>(trip?.class || null);
  const [classes, setClasses] = useState<CLASS[]>([]);

  useEffect(() => {
    const colRef = collection(fbDb, Constants.fbClasses);
    const queryRef = query(colRef, where('company.docId', '==', companyId));

    const unsubscribe = onSnapshot(
      queryRef,
      async (snapshot) => {
        const promises = snapshot.docs.map(async (doc) => {
          const data = doc.data() as CLASS;
          data.doc = doc; // QueryDocumentSnapshot
          data.docId = doc.id;
          return data;
        });

        const results = await Promise.all(promises);
        setClasses(results);
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
            const cl = classes.find((v) => v.docId === value?.docId);
            if (cl && cl.docId) {
              setFieldValue('class', {
                docId: cl.docId,
                name: cl.name,
              });
            }

            setSelected(value);
          }}
        >
          <div className="relative mt-2 w-full">
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm/6">
              <div className="flex items-center gap-2">
                {!selected && (
                  <div className="shrink-0 rounded-full bg-gray-300 p-1">
                    <TruckIcon className="h-3 w-3" />
                  </div>
                )}
                <div className="block truncate">
                  <p className="font-medium">{selected?.name}</p>
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
              {classes.map((classes) => (
                <ListboxOption
                  key={classes.docId}
                  value={classes}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-primary data-[focus]:text-white"
                >
                  <div className="flex items-center gap-2">
                    <div className="block truncate group-data-[selected]:font-semibold">
                      <p className="font-medium">{classes.name}</p>
                    </div>
                  </div>

                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                    <CheckIcon aria-hidden="true" className="size-5" />
                  </span>
                </ListboxOption>
              ))}

              {classes.length === 0 && (
                <Link href="/operations/trips/class/new">
                  <div className="btn btn-flex btn-secondary m-2">
                    <PlusIcon className="h-5 w-5" />
                    <p>Add New Class</p>
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
