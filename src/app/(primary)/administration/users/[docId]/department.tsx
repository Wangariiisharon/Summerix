'use client';

import { ADMIN } from '@/models/admin';
import { DEPARTMENT, DEPARTMENT_DETAILS } from '@/models/department';
import { camelCaseToWords } from '@/services/utils';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Field } from 'formik';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  admin?: ADMIN;
  departments: DEPARTMENT[];
  setFieldValue: Function;
  errors: any;
};

export default function DepartmentAdminView({ admin, departments, setFieldValue, errors }: Props) {
  const [department, setDepartment] = useState<DEPARTMENT_DETAILS | null>(
    admin?.department || null,
  );

  return (
    <>
      <div className="grid-1-3">
        <div className="text-sm">
          <label className="font-medium">Department</label>
        </div>
        <div className="grid gap-3">
          <Listbox
            value={department}
            onChange={(value) => {
              if (value) {
                const details = {
                  docId: value.docId,
                  name: value.name,
                  roles: value.roles,
                };
                setDepartment(details);
                setFieldValue('department', details);
                setFieldValue('roles', details?.roles);
              }
            }}
          >
            <div className="relative mt-2 w-1/2">
              <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm/6">
                <div className="flex items-center gap-2">
                  {!department && (
                    <div className="shrink-0 rounded-full bg-gray-300 p-1">
                      <PlusIcon className="h-3 w-3" />
                    </div>
                  )}
                  <p className="block truncate">{department?.name}</p>
                </div>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon aria-hidden="true" className="size-5 text-gray-400" />
                </span>
              </ListboxButton>

              <ListboxOptions
                transition
                className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
              >
                {departments.map((item) => (
                  <ListboxOption
                    key={item.docId}
                    value={item}
                    className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-primary data-[focus]:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <p className="block truncate font-normal group-data-[selected]:font-semibold">
                        {item.name}
                      </p>
                    </div>

                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                      <CheckIcon aria-hidden="true" className="size-5" />
                    </span>
                  </ListboxOption>
                ))}

                {departments.length === 0 && (
                  <Link href="/administration/departments/new">
                    <div className="btn btn-flex btn-secondary m-2">
                      <PlusIcon className="h-5 w-5" />
                      <p>Add New Department</p>
                    </div>
                  </Link>
                )}
              </ListboxOptions>

              {errors && errors.department && (
                <div className="form-error mt-1">{errors.department['docId']}</div>
              )}
            </div>
          </Listbox>
        </div>
      </div>

      {department && (
        <div className="grid-1-3">
          <div className="text-sm">
            <label className="font-medium">Roles</label>
          </div>
          <div className="grid-1-2 col-span-2 gap-3">
            {department?.roles.map((role) => {
              return (
                <label key={role} className="flex items-center gap-5">
                  <Field
                    type="checkbox"
                    name="roles"
                    value={role}
                    className="form-checkbox"
                    disabled
                  />
                  <span className="form-label capitalize">{camelCaseToWords(role)}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
