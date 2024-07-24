import { collection, where, query, onSnapshot } from "firebase/firestore";
import { ReactNode, useRef, useState, useEffect, useMemo } from "react";
import { FaHome, FaTools, FaChartBar, FaFileAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import { auth, fbDb } from "@/firebase/configs";
import { NotificationDropdown } from "./notifications";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

interface Props {
  children: ReactNode;
}

export default function SiteNav({ children }: Props) {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
    departmentData,
  } = useAuthContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const toggleNotificationDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (currentUser && currentUser.uid) {
          const notificationsRef = collection(
            fbDb,
            `user_notifications/${currentUser.uid}/notifications`
          );

          const q = query(
            notificationsRef,
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedNotifications = snapshot.docs.map((doc) => ({
              id: doc.id,
              readBy: doc.data().readBy || [],
              ...doc.data(),
            }));

            const unreadNotifications = loadedNotifications.filter(
              (notification) =>
                notification.readBy &&
                !notification.readBy.includes(currentUser.uid)
            );

            setUnreadCount(unreadNotifications.length);
            setNotifications(loadedNotifications);
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [currentUser, organisationId]);

  const navigation = useMemo(
    () => [
      { name: "Dashboard", href: "/Dashboard", icon: FaHome, visible: true },
      {
        name: "Administration",
        href: "/Administration",
        icon: FaTools,
        visible: userClaims?.admin === true, // Check for admin claim
      },
      {
        name: "Operations",
        href: "/Operations",
        icon: FaChartBar,
        visible: true,
      },
      {
        name: "Report",
        href: "/Clients",
        icon: FaFileAlt,
        visible: true,
      },
    ],
    [userClaims, isSuperAdmin]
  );

  const toggleSidebar = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const preventLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <>
      <div className="flex">
        <div
          ref={drawerRef}
          className={`flex flex-col bg-white h-screen py-10 fixed top-0 transition-all ease-in-out duration-300 ${
            isDrawerOpen ? "w-64" : "w-16"
          }`}
        >
          <nav className="mt-16">
            <ul className="flex flex-col">
              {navigation.map(
                (item, index) =>
                  item.visible && (
                    <Link key={index} href={item.href} passHref>
                      <li
                        className={`flex items-center mt-[6px] pl-6 pr-4 border-r-4 ${
                          router.pathname === item.href
                            ? "border-blue-500 bg-blue-100"
                            : "border-transparent"
                        } hover:bg-blue-100 cursor-pointer ${
                          isDrawerOpen ? "" : "collapsed-sidebar"
                        }`}
                      >
                        <item.icon
                          className={`text-lg ${
                            router.pathname === item.href
                              ? "text-blue-500"
                              : "text-gray-500"
                          } sidebar-icon`}
                        />
                        <span
                          className={`flex-grow text-lg ${
                            router.pathname === item.href
                              ? "text-blue-500 text-left text-[18px] ml-[12px] py-[12.5px] mr-[79px]"
                              : "text-gray-700 text-left text-[18px] ml-[12px] py-[12.5px] mr-[79px]"
                          } sidebar-text`}
                        >
                          {item.name}
                        </span>
                      </li>
                    </Link>
                  )
              )}
            </ul>
          </nav>
        </div>

        <div className="flex-1 flex flex-col">
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
                  onClick={toggleSidebar}
                ></i>
              </div>
              <div className="fixed right-14 w-8">
                <div className="flex items-center justify-end">
                  <div className="relative mr-4">
                    <button
                      onClick={toggleNotificationDropdown}
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
                      <NotificationDropdown onClose={closeDropdown} />
                    )}
                  </div>

                  {currentAdmin && (
                    <Menu as="div" className="relative flex-shrink-0">
                      <MenuButton className="p-2 inline-flex items-center gap-2 rounded-md font-semibold focus:outline-none">
                        <span className="p-4 h-10 w-10 flex items-center justify-center bg-blue-800 rounded-full">
                          <span className="font-bold text-white">
                            {currentAdmin.initials}
                          </span>
                        </span>
                        <span className="flex flex-col text-white">
                          <span>
                            {`${currentAdmin.firstname} ${currentAdmin.lastname}`}
                          </span>
                          <span>{currentAdmin.email}</span>
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
                          className="py-3 px-1 w-fit min-w-52 origin-top-right rounded-b border border-white/5 bg-[#065AD8] text-white focus:outline-none"
                        >
                          <MenuItem>
                            <div className="px-3 flex items-center gap-3 text-sm">
                              <div className="p-4 h-10 w-10 flex items-center justify-center bg-blue-800 rounded-full">
                                <span className="font-bold text-white">
                                  {currentAdmin.initials}
                                </span>
                              </div>
                              <div>
                                <p>{`${currentAdmin.firstname} ${currentAdmin.lastname}`}</p>
                                <p className="text-xs">{currentAdmin.email}</p>
                              </div>
                            </div>
                          </MenuItem>
                          <div className="my-3 h-px bg-white/5" />
                          <MenuItem>
                            <button
                              onClick={async () => {
                                try {
                                  await auth.signOut();
                                } catch (error) {
                                  console.error("On logout error:", error);
                                }
                              }}
                              className="py-2 px-4 w-full border border-red-500 text-red-500 font-bold rounded"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
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

          <div
            className={`bg-[#FAFAFB] py-10 h-screen  transition-all ease-in-out duration-300 pt-14 ${
              isDrawerOpen ? "ml-64" : "ml-16"
            }`}
            style={{ overflowY: "auto" }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
