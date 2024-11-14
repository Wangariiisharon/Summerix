"use client";

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftEndOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fbAuth } from "@/firebase/configs";
import { useAuthContext } from "../../auth-provider";
import Link from "next/link";

export default function Header() {
  const { currentAdmin } = useAuthContext();
  const router = useRouter();

  return (
    <>
      <div className="p-4 w-full flex flex-row items-center gap-2 bg-primary">
        <Link href="/home" className="flex h-10 w-full">
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

          {currentAdmin && (
            <Menu as="div" className="relative flex-shrink-0">
              <MenuButton className="p-2 inline-flex items-center gap-2 rounded-md focus:outline-none text-white">
                <span className="p-4 h-10 w-10 flex items-center justify-center bg-blue-800 rounded-full">
                  <span className="">{currentAdmin.initials}</span>
                </span>
                <ChevronDownIcon className="size-4 fill-white/60" />
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
                  className="p-3 w-fit min-w-60 origin-top-right rounded-b border border-primary bg-white focus:outline-none"
                >
                  <MenuItem>
                    <div className="mt-5 px-3 flex items-center gap-3 text-sm">
                      <div className="p-4 h-12 w-12 flex items-center justify-center bg-primary rounded-full">
                        <span className="font-bold text-white">
                          {currentAdmin.initials}
                        </span>
                      </div>
                      <div className="font-medium">
                        <p className="">{currentAdmin.displayName}</p>
                        <p className="text-xs">{currentAdmin.email}</p>
                      </div>
                    </div>
                  </MenuItem>
                  <div className="my-3 h-px bg-white/5" />
                  <MenuItem>
                    <button
                      onClick={async () => {
                        await fbAuth.signOut();
                        router.push("/auth/sign-in");
                      }}
                      className="w-full btn border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 rounded"
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
        </div>
      </div>
    </>
  );
}
