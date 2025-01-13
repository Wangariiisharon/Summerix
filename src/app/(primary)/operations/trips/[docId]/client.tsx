'use client';

import { TRIP } from '@/models/trip';
import { CLIENT_DETAILS } from '@/models/client';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PlusIcon, TruckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';
import useClient from '@/hooks/useClient';
import { useAuthContext } from '@/app/auth-provider';
import Image from 'next/image';

type Props = {
  setFieldValue: Function;
  trip?: TRIP;
};
export default function TripClient({ setFieldValue, trip }: Props) {
  const [selected, setSelected] = useState<CLIENT_DETAILS | null>(trip?.client || null);
  const { authUser } = useAuthContext();

  const { clients } = useClient({
    companyId: authUser?.companyId || 'xyz',
    docId: null,
  });

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Listbox
          value={selected}
          onChange={(value) => {
            const tripClients = clients.find((v) => v.docId === value?.docId);
            if (tripClients && tripClients.docId) {
              setFieldValue('client', {
                docId: tripClients.docId,
                companyName: tripClients.companyName,
                email: tripClients.email,
                contactInfo: tripClients.contactInfo,
                phoneNumber: tripClients.phoneNumber,
                photoURL: tripClients.photoURL,
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
                    alt={selected.companyName}
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
                  <p className="font-medium">{selected?.companyName}</p>
                  <p className="text-xs">{selected?.email}</p>
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
              {clients.map((client) => (
                <ListboxOption
                  key={client.docId}
                  value={client}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-primary data-[focus]:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={client.photoURL}
                      alt={client.companyName}
                      className="size-10 shrink-0 rounded-full"
                      width={100}
                      height={100}
                    />
                    <div className="block truncate group-data-[selected]:font-semibold">
                      <p className="font-medium">{client.companyName}</p>
                      <p className="text-xs">{client.email}</p>
                    </div>
                  </div>

                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                    <CheckIcon aria-hidden="true" className="size-5" />
                  </span>
                </ListboxOption>
              ))}

              {clients.length < 5 && (
                <Link href="/operations/clents/new">
                  <div className="btn btn-flex btn-secondary m-2">
                    <PlusIcon className="h-5 w-5" />
                    <p>Add New Client</p>
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
