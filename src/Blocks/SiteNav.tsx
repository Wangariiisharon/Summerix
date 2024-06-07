import { ReactNode, useRef, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import React from "react";
import {
  collection,
  getDocs,
  where,
  query,
  onSnapshot,
} from "firebase/firestore";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { NotificationDropdown } from "./notificationDropdown";
import Link from "next/link";
import { FaHome, FaTools, FaChartBar, FaFileAlt } from "react-icons/fa"; // Importing icons from react-icons
import Image from "next/image";

interface Props {
  children: ReactNode;
}

export function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(" ");
}
export default function SiteNav({ children }: Props) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [adminDetails, setadminDetails] = useState<any | null>(null);
  const [userInitials, setUserInitials] = useState<string>("");
  const { currentUser, organisationId, isSuperAdmin } = useAuthContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // const isSuperAdmin = useMemo(() => adminDetails?.roles.includes('super_admin'), [adminDetails]);

  const toggleNotificationDropdown = () => {
    console.log("Toggling dropdown");
    setShowDropdown(!showDropdown);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const auth = getAuth(firebaseApp);

        onAuthStateChanged(auth, (user) => {
          if (user) {
            const email = user.email;
            const adminsCollectionRef = collection(fbDb, "admins");
            const queryRef = query(
              adminsCollectionRef,
              where("email", "==", email)
            );

            getDocs(queryRef)
              .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                  querySnapshot.forEach((doc) => {
                    const adminData = doc.data();
                    console.log("Admin Data:", adminData);
                    setadminDetails(adminData);

                    // Update user initials based on firstname and lastname
                    const initials =
                      adminData.firstname?.charAt(0).toUpperCase() +
                      adminData.lastname?.charAt(0).toUpperCase();
                    setUserInitials(initials);
                  });
                } else {
                  console.log("Admin document not found");
                }
              })
              .catch((error) => {
                console.error("Error fetching admin:", error);
              });
          } else {
            console.log("User not logged in");
          }
        });
      } catch (error) {
        console.error("Error fetching admin:", error);
      }
    };

    if (!currentUser) {
      return;
    }

    const fetchNotifications = async () => {
      try {
        // Reference to the notifications sub-collection for the current user
        const notificationsRef = collection(
          fbDb,
          `user_notifications/${currentUser.uid}/notifications`
        );

        const q = query(
          notificationsRef,
          where("organisationId", "==", organisationId)
        );
        console.log("Q", q);

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedNotifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            readBy: doc.data().readBy || [], // Ensure readBy is always an array
            ...doc.data(), // Get all data from the document
          }));
          console.log("loadedNotifications", loadedNotifications);

          const unreadNotifications = loadedNotifications.filter(
            (notification) =>
              notification.readBy &&
              !notification.readBy.includes(currentUser.uid)
          );
          console.log("unreadNotifications", unreadNotifications);

          setUnreadCount(unreadNotifications.length);
          console.log("unreadCount", unreadCount);

          setNotifications(loadedNotifications);
          console.log("notifications", notifications);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchAdmin();
    fetchNotifications();

    // const unsubscribeNotifications = fetchNotifications();
    // // Cleanup function
    // return () => {
    //   if (typeof unsubscribeNotifications === "function") {
    //     unsubscribeNotifications();
    //   }
    // };
  }, [currentUser, notifications, organisationId, unreadCount]);

  // const isSuperAdmin = adminDetails?.super_admin;
  console.log("Admin Details", adminDetails);

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
                  src="dashlogo.png"
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
                  <div className="flex items-center text-sm">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-800 rounded-full text-white">
                      <span className="font-bold">{userInitials}</span>
                    </div>
                    <div className="flex flex-col ml-2 mr-2 text-white">
                      <span>{`${adminDetails?.firstname} ${adminDetails?.lastname}`}</span>
                      <span>{adminDetails?.email}</span>
                    </div>
                    <button className="focus:outline-none">
                      <i
                        className="fa fa-chevron-down text-white"
                        aria-hidden="true"
                      ></i>
                    </button>
                  </div>
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
