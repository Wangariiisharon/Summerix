'use client';

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import {
  ArrowLeftEndOnRectangleIcon,
  Bars3Icon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fbAuth } from '@/firebase/configs';
import { useAuthContext } from '../../auth-provider';
import Link from 'next/link';
import useCurrentClient from '@/hooks/useCurrentClient';
import { doLogoutApiCall } from '@/services/auth';
import useNavLinks from '@/hooks/useNavLinks';

export default function Header() {
  const { appCheck, authUser } = useAuthContext();
  const { client: currentClient } = useCurrentClient();
  const navigation = useNavLinks();
  const pathName = usePathname();
  const router = useRouter();

  return (
    <>
      <Popover as="header" aria-label="Header">
        {({ open }) => (
          <>
            <div className="flex w-full flex-col gap-2 bg-primary p-4 sm:flex-row sm:items-center">
              <Link href="/dashboard" className="flex h-10 w-full">
                <Image
                  src="/images/logo.svg"
                  alt="company logo image"
                  className="h-auto w-auto"
                  width={200}
                  height={100}
                />
              </Link>

              <div className="flex items-center justify-end gap-3">
                <button className="relative text-white focus:outline-none">
                  <i className="fa fa-bell fa-lg" aria-hidden="true"></i>
                </button>

                {authUser && (
                  <Menu as="div" className="relative flex-shrink-0">
                    <MenuButton className="inline-flex items-center gap-2 rounded-md p-2 text-white focus:outline-none">
                      <span className="sr-only">Open user menu</span>
                      {currentClient && currentClient.photoURL && (
                        <Image
                          src={currentClient.photoURL}
                          alt={`${currentClient.displayName} image`}
                          className="h-12 w-12 rounded-full"
                          width={50}
                          height={50}
                        />
                      )}
                      {!currentClient && <UserCircleIcon className="h-10 w-10" />}
                      {/* <ChevronDownIcon className="size-4 fill-white/60" /> */}
                    </MenuButton>
                    <Transition
                      enter="transition ease-out duration-75"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <MenuItems
                        anchor="bottom end"
                        className="w-fit min-w-60 origin-top-right rounded-b border border-primary bg-white p-3 focus:outline-none"
                      >
                        <MenuItem>
                          <div className="mt-5 flex items-center gap-3 px-3 text-sm">
                            {currentClient && currentClient.photoURL && (
                              <Image
                                src={currentClient.photoURL}
                                alt={`${currentClient.displayName} image`}
                                className="h-14 w-14 rounded-full"
                                width={20}
                                height={20}
                              />
                            )}
                            {!currentClient && (
                              <UserCircleIcon className="h-10 w-10 text-primary" />
                            )}
                            <div className="font-medium">
                              <p className="">{currentClient?.displayName || 'UNKNOWN'}</p>
                              <p className="text-xs">{currentClient?.email}</p>
                            </div>
                          </div>
                        </MenuItem>

                        <div className="my-3 h-px bg-white/5" />

                        <MenuItem>
                          <button
                            onClick={async () => {
                              await fbAuth.signOut();
                              await doLogoutApiCall(appCheck);
                              router.push('/auth/sign-in');
                            }}
                            className="btn btn-outline-danger w-full rounded"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <ArrowLeftEndOnRectangleIcon className="h-5 w-5" />
                              <span>Log Out</span>
                            </div>
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Transition>
                  </Menu>
                )}

                <div className="z-20 -mt-2 block w-fit p-4 xl:hidden">
                  <div className="flex w-full justify-end text-white">
                    <PopoverButton aria-label="Open menu" className="btn">
                      <span className="sr-only">Open menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </PopoverButton>
                  </div>
                </div>
              </div>
            </div>

            <PopoverPanel
              as="nav"
              className="absolute z-20 block w-full bg-primary xl:hidden"
              aria-label="Site mobile navigation"
              // anchor="bottom"
            >
              <div className="flex w-full flex-wrap gap-2 space-y-1 px-4 py-2">
                {navigation
                  .filter((i) => i.visible)
                  .map(({ name, href, icon: ItemIcon }, index) => {
                    const isActive = pathName.startsWith(href);

                    return (
                      <Link key={index} href={href}>
                        <li
                          className={`flex w-full cursor-pointer border-r-4 hover:bg-blue-100 ${
                            isActive ? 'border-primary bg-blue-100' : 'border-transparent'
                          }`}
                        >
                          <div className="flex w-full items-center justify-start px-4">
                            <ItemIcon
                              className={`h-7 w-7 ${isActive ? 'text-primary' : 'text-gray-100'}`}
                            />
                            <span
                              className={`w-52 p-4 ${isActive ? 'text-primary' : 'text-gray-100'}`}
                            >
                              {name}
                            </span>
                          </div>
                        </li>
                      </Link>
                    );
                  })}
              </div>
            </PopoverPanel>
          </>
        )}
      </Popover>
    </>
  );
}
