"use client";

import { useAuthContext } from "@/app/auth-provider";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function Sidebar() {
  const { userClaims } = useAuthContext();
  const pathname = usePathname();

  const navigation = useMemo(
    () => [
      { name: "Dashboard", href: "/home", icon: HomeIcon, visible: true },
      {
        name: "Administration",
        href: "/administration",
        icon: WrenchScrewdriverIcon,
        visible: userClaims?.admin || false, // Check for admin claim
      },
      {
        name: "Operations",
        href: "/operations",
        icon: ChartBarIcon,
        visible: true,
      },
      {
        name: "Reports",
        href: "/reports",
        icon: DocumentChartBarIcon,
        visible: true,
      },
    ],
    [userClaims]
  );

  return (
    <>
      <Popover as="header" className="bg-inherit relative" aria-label="Header">
        {({ open }) => (
          <>
            <div className="-mt-2 fixed w-full z-20">
              <div className="flex lg:hidden justify-end items-center bg-gray-100">
                <PopoverButton
                  aria-label="Open menu"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white
                      hover:bg-gray-700 hover:text-white"
                >
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
              className="block lg:hidden absolute top-10 z-20"
              aria-label="Site mobile navigation"
              anchor="bottom"
            >
              <div className="w-full p-4 block gap-5 bg-gray-100">
                {navigation
                  .filter((i) => i.visible)
                  .map(({ name, href, icon: ItemIcon }, index) => {
                    const isActive = pathname === href;

                    return (
                      <Link key={index} href={href}>
                        <li
                          className={`w-full flex border-r-4 hover:bg-blue-100 cursor-pointer ${
                            isActive
                              ? "border-primary bg-blue-100"
                              : "border-transparent"
                          }`}
                        >
                          <div className="w-full px-4 flex items-center justify-start">
                            <ItemIcon
                              className={`h-7 w-7 ${
                                isActive ? "text-primary" : "text-gray-500"
                              }`}
                            />
                            <span
                              className={`w-52 p-4 ${
                                isActive ? "text-primary" : "text-gray-700"
                              }`}
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

      <ul className="hidden lg:flex flex-col">
        {navigation
          .filter((i) => i.visible)
          .map(({ name, href, icon: ItemIcon }, index) => {
            const isActive = pathname === href;

            return (
              <Link key={index} href={href}>
                <li
                  className={`flex justify-center border-r-4 hover:bg-blue-100 cursor-pointer ${
                    isActive
                      ? "border-blue-500 bg-blue-100"
                      : "border-transparent"
                  }`}
                >
                  <div className="w-52 px-4 flex items-center justify-start">
                    <ItemIcon
                      className={`h-7 w-7 ${
                        isActive ? "text-blue-500" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`p-4 font-medium ${
                        isActive ? "text-primary" : "text-gray-700"
                      }`}
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
