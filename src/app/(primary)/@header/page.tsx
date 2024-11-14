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
import useCurrentClient from "@/hooks/useCurrentClient";

export default function Header() {
  const { appCheck, authUser, isAuthenticated } = useAuthContext();
  const { client: currentClient } = useCurrentClient();
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

          {currentClient && (
            <Menu as="div" className="relative flex-shrink-0">
              <MenuButton className="p-2 inline-flex items-center gap-2 rounded-md focus:outline-none text-white">
                <span className="sr-only">Open user menu</span>
                {currentClient.photoURL && (
                  <Image
                    src={currentClient.photoURL}
                    alt={`${currentClient.displayName} image`}
                    className="h-12 w-12 rounded-full"
                    width={50}
                    height={50}
                  />
                )}
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
                      {currentClient.photoURL && (
                        <Image
                          src={currentClient.photoURL}
                          alt={`${currentClient.displayName} image`}
                          className="h-14 w-14 rounded-full"
                          width={20}
                          height={20}
                        />
                      )}
                      <div className="font-medium">
                        <p className="">{currentClient.displayName}</p>
                        <p className="text-xs">{currentClient.email}</p>
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
