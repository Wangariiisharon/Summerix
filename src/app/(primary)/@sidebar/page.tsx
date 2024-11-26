'use client';

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import {
  BriefcaseIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/app/auth-provider';

export default function Sidebar() {
  const { authUser } = useAuthContext();
  const pathName = usePathname();

  const navigation = useMemo(
    () => [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        visible: authUser && authUser.companyId,
      },
      {
        name: 'Administration',
        href: '/administration',
        icon: WrenchScrewdriverIcon,
        visible: authUser?.isOwner || authUser?.isAdmin || false,
        children: [
          { name: 'Overview', link: '' },
          { name: 'Profile', link: 'profile' },
          { name: 'Users', link: 'users' },
          { name: 'Departments', link: 'departments' },
          { name: 'Integration', link: 'integration' },
        ],
      },
      {
        name: 'Operations',
        href: '/operations',
        icon: ChartBarIcon,
        visible: authUser && authUser.companyId,
        children: [
          { name: 'Overview', link: '' },
          { name: 'Trips', link: 'trips' },
          { name: 'Vehicles', link: 'vehicles' },
          { name: 'Drivers', link: 'drivers' },
          { name: 'Maintenance', link: 'maintenance' },
          { name: 'Suppliers', link: 'suppliers' },
        ],
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: DocumentChartBarIcon,
        visible: authUser && authUser.companyId,
      },
      {
        name: 'Add Company',
        href: '/company',
        icon: BriefcaseIcon,
        visible: authUser && !authUser.companyId,
      },
    ],
    [authUser],
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

      <div className="hidden flex-col lg:flex">
        {navigation
          .filter((i) => i.visible)
          .map(({ name, href, icon: ItemIcon, children }, index) => {
            const isActive = pathName.startsWith(href);

            return (
              <div key={`${href}-${index}`}>
                <>
                  <Link href={href}>
                    <div
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
                    </div>
                  </Link>

                  {isActive && children && (
                    <div className="grid gap-2 p-4">
                      {children.map((item) => {
                        const isActive =
                          (pathName.startsWith(`${href}/${item.link}`) &&
                            item.name !== 'Overview') ||
                          (pathName === `${href}` && item.name === 'Overview');

                        return (
                          <Link
                            key={`${href}-${index}-${item.link}`}
                            href={`${href}/${item.link}`}
                            className={`px-4 py-2 text-sm capitalize hover:bg-gray-200 ${isActive && 'bg-[#F9F9FB] text-[#256DDC]'}`}
                          >
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              </div>
            );
          })}
      </div>
    </>
  );
}
