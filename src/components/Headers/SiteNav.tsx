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
  ArrowLeftStartOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

interface Props {
  children: ReactNode;
}

export default function SiteNav({ children }: Props) {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const { currentAdmin, currentUser, organisationId, isSuperAdmin } =
    useAuthContext();
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
          // Reference to the notifications sub-collection for the current user
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
              readBy: doc.data().readBy || [], // Ensure readBy is always an array
              ...doc.data(), // Get all data from the document
            }));
            console.log("SiteNav > notifications:", loadedNotifications);

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
        visible: isSuperAdmin,
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
    [isSuperAdmin]
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
      <div className=" flex ">
        <div className="flex flex-col">
          <div className="bg-[#065AD8]">
            <div
              // className={`flex flex-row fixed top-0 h-14 bg-[#065AD8] flex items-center shadow-inner ${
              //   isDrawerOpen ? " w-full" : "w-full lg:w-auto"
              // }`}
              className="flex flex-row fixed top-0 h-14 bg-[#065AD8] w-full items-center shadow-inner "
            >
              <div className="p-4">
                <Image
                  src="/logo.png"
                  alt="company logo"
                  width={150}
                  height={100}
                />
              </div>
              <div
                className="fixed left-60 ml-14 cursor-pointer"
                onClick={toggleSidebar}
              >
                <i className="fa fa-bars text-white" aria-hidden="true"></i>
              </div>
              <div className="fixed right-14 w-8">
                <div className="flex items-center justify-end">
                  {/* Notification bell and dropdown */}
                  <div className="relative mr-4">
                    <button
                      onClick={toggleNotificationDropdown}
                      className="text-white focus:outline-none"
                    >
                      {/* <FaBell className="text-2xl" aria-hidden="true" />  */}
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
                    {/* Assuming NotificationDropdown component is defined elsewhere */}
                    {showDropdown && (
                      <NotificationDropdown onClose={closeDropdown} />
                    )}
                  </div>

                  {/* User initials, name, and email */}
                  {currentAdmin && (
                    <Menu as="div" className="relative flex-shrink-0">
                      <MenuButton className="p-2 inline-flex items-center gap-2 rounded-md font-semibold focus:outline-none">
                        <span className="p-4 h-10 w-10 flex items-center justify-center bg-blue-800 rounded-full">
                          <span className="font-bold text-white">
                            {currentAdmin.initials}
                          </span>
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
                              <div className="">
                                <p>{`${currentAdmin.firstname} ${currentAdmin.lastname}`}</p>
                                <p className="text-xs">{currentAdmin.email}</p>
                              </div>
                            </div>
                          </MenuItem>
                          <div className="my-3 h-px bg-white/5" />
                          <MenuItem>
                            <button onClick={async () => {
                              try {
                                await auth.signOut();
                              } catch (error) {
                                console.error('On logout error:', error);
                              }
                            }} className="py-2 px-4 w-full border border-red-500 text-red-500 font-bold rounded">
                              <div className="flex items-center justify-center gap-2">
                                <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                                <span>Log Out</span>
                              </div>
                            </button>
                          </MenuItem>
                        </MenuItems>
                      </Transition>
                    </Menu>
                  )}

                  {/* User initials, name, and email
                  {currentAdmin && (
                    <>
                      <div className="flex items-center text-sm">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-800 rounded-full text-white">
                          <span className="font-bold">
                            {currentAdmin.initials}
                          </span>
                        </div>
                        <div className="flex flex-col ml-2 mr-2 text-white">
                          <span>{`${currentAdmin.firstname} ${currentAdmin.lastname}`}</span>
                          <span>{currentAdmin.email}</span>
                        </div>
                        <button className="focus:outline-none">
                          <i
                            className="fa fa-chevron-down text-white"
                            aria-hidden="true"
                          ></i>
                        </button>
                      </div>
                    </>
                  )} */}
                </div>
              </div>
            </div>
          </div>
          <div
            ref={drawerRef}
            className={`flex flex-col bg-white h-screen overflow-y-auto py-10 ${
              isDrawerOpen ? "" : "sidebar collapsed"
            }`}
          >
            <nav className="mt-16">
              <ul className="flex flex-col">
                {navigation.map((item, index) => (
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
                ))}
              </ul>
            </nav>
          </div>

          <div className="bg-[#F34C4C]"></div>

          {/* <div className={`flex flex-row fixed top-0 h-10 bg-[#FFFFFF] flex items-center shadow-inner ${isDrawerOpen ? 'fixed left-72 w-full' : 'w-full'}`}> */}
        </div>
        {/* <div
          className={`bg-[#FAFAFB] px-4 py-10 h-screen  ${
            isDrawerOpen ? "lg:w-full sm:px-6 lg:px-8" : "lg:w-full "
          } transition-all ease-in-out duration-300`}
        >
          {children}
        </div> */}
        <div
          className={`bg-[#FAFAFB] py-10 h-screen transition-all ease-in-out duration-300 ${
            isDrawerOpen ? "w-full" : "w-full"
          }`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
