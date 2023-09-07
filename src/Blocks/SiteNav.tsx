import { Fragment, ReactNode, useRef, useState } from 'react';
import { CalendarIcon, ChartPieIcon, DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon } from '@heroicons/react/24/outline';
import { DashboardLogo } from '@/components/images';
import { useRouter } from 'next/router';
import React from 'react';

const navigation = [
  { name: 'Dashboard', href: '/Dashboard', icon: HomeIcon, current: true },
  { name: 'Administration', href: '/Administration', icon: UsersIcon, current: false },
  { name: 'Vehicles', href: '/Vehicles', icon: FolderIcon, current: false },
  { name: 'Trips', href: '/Trips', icon: CalendarIcon, current: false },
  { name: 'Clients', href: '/Clients', icon: DocumentDuplicateIcon, current: false },
];

interface Props {
  children: ReactNode;
}

export function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ');
}

export default function SiteNav({ children }: Props) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleSidebar = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const preventLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <>
        {/* Hamburger Menu */} 


        {/* Main content and Sidebar */}
        <div className="flex">
          {/* Sidebar */}
          <div
            ref={drawerRef}
            className={`flex flex-col bg-d-blue h-screen overflow-y-auto px-6 lg:w-72 ${isDrawerOpen ? 'lg:w-72' : 'hidden'}`}
          >
            <div className="flex h-16 shrink-0 items-center">
              <DashboardLogo />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          router.pathname === item.href
                            ? 'bg-light-green text-white'
                            : 'text-indigo-200 hover:text-white hover:bg-light-green',
                          'group flex gap-x-3 rounded-md p-2 text-xl leading-6 font-semibold'
                        )} 

                      >
                        <item.icon
                          className={classNames(
                            router.pathname === item.href ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div> 
        <div className="flex flex-row absolute top-0 h-10 bg-[#FFFFFF]">
        <div className={`ml-4 lg:fixed ${isDrawerOpen ? 'fixed left-72' : 'fixed left-7'} cursor-pointer`} onClick={toggleSidebar}>
          <i className="fa fa-bars" aria-hidden="true"></i>
        </div>
        <div>
          <img src="Frame 13.png" className="fixed right-14 w-8" alt="Notification" />
          <img src="Ellipse 1.png" className="w-9 fixed right-4 pl-2" alt="" />
        </div> 
        </div>

          {/* Main content */}
          <div
            className={`bg-[#FAFAFB] px-4 py-10 ${isDrawerOpen ? 'lg:w-full sm:px-6 lg:px-8' : 'lg:w-full'} transition-all ease-in-out duration-300`}
          >
            {children}
          </div> 
        </div>
    </>
  );
}