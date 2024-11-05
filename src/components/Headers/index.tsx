import { Fragment } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import HamburgerMenu from "@/components/hamburgerMenu";

interface Props {
  heading: string;
}

export function Header({ heading }: Props) {
  return (
    <>
      <div className="text-3xl font-bold">{heading}</div>
    </>
  );
}

interface NavProps {
  name: string;
  active: boolean;
}

interface BarProps {
  headers: Array<NavProps>;
}

export function HeaderBar({ headers }: BarProps) {
  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto px-2 sm:px-6 lg:px-8 pt-4">
            <div className="relative flex h-16 justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-d-green">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="hidden sm:ml-0 sm:flex sm:space-x-8 justify-between ">
                  {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                  {headers.map((head, index) => {
                    return (
                      <Fragment key={index}>
                        <a
                          className={`${
                            head.active
                              ? "border-d-green text-d-green"
                              : "border-transparent text-black"
                          } cursor-pointer inline-flex items-center border-b-2  px-1 pt-1 text-xl font-semibold`}
                        >
                          {head.name}
                        </a>
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 pb-4 pt-2">
              {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}

              {headers.map((head, index) => {
                return (
                  <Fragment key={index}>
                    <DisclosureButton
                      as="a"
                      href="#"
                      className={`${
                        head.active
                          ? " border-l-4 border-d-green bg-green-100 "
                          : " border-transparent text-black"
                      }  block py-2 pl-3 pr-4 text-base font-medium `}
                    >
                      {head.name}
                    </DisclosureButton>
                  </Fragment>
                );
              })}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export default function TopMenu() {
  return (
    <>
      {" "}
      <div className="w-full flex flex-row bg-[#FFFFFF] fixed top-0 h-10">
        <div className="flex justify-center">
          <div className="ml-7 flex justify-center">
            <HamburgerMenu />
          </div>
          <div>
            {/* <img
              src="Frame 13.png"
              className="fixed right-14 w-8"
              alt="Notification"
            />
            <img
              src="Ellipse 1.png"
              className=" w-9 fixed right-4 pl-2"
              alt=""
            /> */}
          </div>
        </div>
      </div>
    </>
  );
}
