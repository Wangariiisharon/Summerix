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
import {
  collection,
  where,
  query,
  getCountFromServer,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fbAuth, fbDb } from "@/firebase/configs";
import { useAuthContext } from "../../auth-provider";
import { NotificationDropdown } from "./notifications";

export default function Header() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentAdmin, currentUser, organisationId } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    console.debug("fetchNotifications > uid:", currentUser?.uid);

    const fetchNotifications = async () => {
      try {
        if (currentUser && currentUser.uid) {
          const notificationsRef = collection(
            fbDb,
            `user_notifications/${currentUser.uid}/notifications`
          );

          const q = query(
            notificationsRef,
            where("organisationId", "==", organisationId),
            where("readBy", "!=", currentUser.uid)
          );

          const snapshot = await getCountFromServer(q);
          setUnreadCount(snapshot.data().count);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [currentUser, organisationId]);

  return (
    <>
      <main className="flex flex-col">
        <div className="bg-[#065AD8] fixed top-0 w-full z-10">
          <div className="flex flex-row h-14 bg-[#065AD8] w-full items-center shadow-inner">
            <div className="flex h-10 ml-[20px] py-[20px]  items-center">
              <Image
                src="/logo.png"
                alt="company logo"
                className="h-auto w-auto"
                width={150}
                height={100}
              />
            </div>
            <div className="fixed left-60 ml-14 cursor-pointer">
              <i
                className="fa fa-bars text-white"
                aria-hidden="true"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              ></i>
            </div>
            <div className="fixed right-14 w-8">
              <div className="flex items-center justify-end">
                <div className="relative mr-4">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="text-white focus:outline-none"
                  >
                    <i
                      className="fa fa-bell fa-lg text-white"
                      aria-hidden="true"
                    ></i>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 flex items-center justify-center w-6 h-6 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showDropdown && (
                    <NotificationDropdown
                      onClose={() => setShowDropdown(false)}
                    />
                  )}
                </div>

                {currentAdmin && (
                  <Menu as="div" className="relative flex-shrink-0">
                    <MenuButton className="p-2 inline-flex items-center gap-2 rounded-md focus:outline-none text-white">
                      <span className="p-4 h-10 w-10 flex items-center justify-center bg-blue-800 rounded-full">
                        <span className="">{currentAdmin.initials}</span>
                      </span>
                      <div className="flex flex-col text-white">
                        <p className="font-semibold">
                          {currentAdmin.displayName}
                        </p>
                        <p className="text-xs">{currentAdmin.email}</p>
                      </div>
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
                        className="p-3 w-fit min-w-60 origin-top-right rounded-b border border-[#065AD8] bg-white focus:outline-none"
                      >
                        <MenuItem>
                          <div className="px-3 flex items-center gap-3 text-sm">
                            <div className="p-4 h-10 w-10 flex items-center justify-center bg-[#065AD8] rounded-full">
                              <span className="font-bold text-white">
                                {currentAdmin.initials}
                              </span>
                            </div>
                            <div className="">
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
          </div>
        </div>
      </main>
    </>
  );
}
