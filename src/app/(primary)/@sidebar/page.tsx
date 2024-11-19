'use client';

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  // const { authUser } = useAuthContext();
  const pathname = usePathname();

  const navigation = useMemo(
    () => [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, visible: true },
      {
        name: 'Administration',
        href: '/administration',
        icon: WrenchScrewdriverIcon,
        visible: true, // authUser?.isOwner || authUser?.isAdmin || false,
      },
      {
        name: 'Operations',
        href: '/operations',
        icon: ChartBarIcon,
        visible: true,
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: DocumentChartBarIcon,
        visible: true,
      },
    ],
    [],
  );

  return (
    <>
      <Popover as="header" className="w-full" aria-label="Header">
        {({ open }) => (
          <>
            <div className="z-20 -mt-7 flex w-auto bg-primary p-4 lg:hidden">
              <div className="flex w-full justify-end">
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

            <PopoverPanel
              as="nav"
              className="absolute top-10 z-20 block lg:hidden"
              aria-label="Site mobile navigation"
              anchor="bottom"
            >
              <div className="block w-full gap-5 bg-gray-100 p-4">
                {navigation
                  .filter((i) => i.visible)
                  .map(({ name, href, icon: ItemIcon }, index) => {
                    const isActive = pathname === href;

                    return (
                      <Link key={index} href={href}>
                        <li
                          className={`flex w-full cursor-pointer border-r-4 hover:bg-blue-100 ${
                            isActive ? 'border-primary bg-blue-100' : 'border-transparent'
                          }`}
                        >
                          <div className="flex w-full items-center justify-start px-4">
                            <ItemIcon
                              className={`h-7 w-7 ${isActive ? 'text-primary' : 'text-gray-500'}`}
                            />
                            <span
                              className={`w-52 p-4 ${isActive ? 'text-primary' : 'text-gray-700'}`}
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

      <ul className="hidden flex-col lg:flex">
        {navigation
          .filter((i) => i.visible)
          .map(({ name, href, icon: ItemIcon }, index) => {
            const isActive = pathname === href;

            return (
              <Link key={index} href={href}>
                <li
                  className={`flex cursor-pointer justify-center border-r-4 hover:bg-blue-100 ${
                    isActive ? 'border-blue-500 bg-blue-100' : 'border-transparent'
                  }`}
                >
                  <div className="flex w-full items-center justify-start px-4">
                    <ItemIcon
                      className={`h-7 w-7 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}
                    />
                    <span
                      className={`p-4 font-medium ${isActive ? 'text-primary' : 'text-gray-700'}`}
                    >
                      {name}
                    </span>
                  </div>
                </li>
              </Link>
            );
          })}
      </ul>
    </>
  );
}
