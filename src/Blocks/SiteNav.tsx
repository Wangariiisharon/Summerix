import {
  Fragment,
  ReactNode,
  useRef,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import {
  CalendarIcon,
  ChartPieIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  UsersIcon,
  TruckIcon,
  ArrowUpRightIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { DashLogo } from "@/components/images";
import { useRouter } from "next/router";
import React from "react";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  DocumentData,
  getDoc,
  where,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { createContext } from "react";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { NotificationDropdown } from "./notificationDropdown";
import Link from "next/link";

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
  const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);
  const [adminDetails, setadminDetails] = useState<any | null>(null);
  const [userInitials, setUserInitials] = useState<string>("");
  const { currentUser, organisationId, isSuperAdmin } = useAuthContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { hasPermission } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");

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
    // Function to fetch notifications and calculate the unread count
    const fetchNotifications = () => {
      if (!currentUser || !organisationId) {
        return;
      }
      // const notificationsRef = collection(fbDb, 'notifications');
      const notificationsRef = collection(
        fbDb,
        `user_notifications/${currentUser.uid}/notifications`
      );

      const q = query(
        notificationsRef,
        where("organisationId", "==", organisationId)
      );

      // Directly return the unsubscribe function from onSnapshot
      return onSnapshot(
        q,
        (snapshot) => {
          const loadedNotifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            readBy: doc.data().readBy || [], // Ensure readBy is always an array
            ...doc.data(),
          }));

          const unreadNotifications = loadedNotifications.filter(
            (notification) =>
              notification.readBy &&
              !notification.readBy.includes(currentUser.uid)
          );

          setUnreadCount(unreadNotifications.length);

          console.log("Unread Count", unreadCount);

          setNotifications(loadedNotifications);
        },
        (error) => {
          console.error("Error fetching notifications:", error);
        }
      );
    };

    fetchAdmin();

    const unsubscribeNotifications = fetchNotifications();

    // Cleanup function
    return () => {
      if (typeof unsubscribeNotifications === "function") {
        unsubscribeNotifications();
      }
    };
  }, [organisationId]);

  // const isSuperAdmin = adminDetails?.super_admin;
  console.log("Admin Details", adminDetails);

  const navigation = useMemo(
    () => [
      { name: "Dashboard", href: "/Dashboard", icon: HomeIcon, visible: true },
      {
        name: "Administration",
        href: "/Administration",
        icon: UsersIcon,
        visible: isSuperAdmin,
      },
      {
        name: "Operations",
        href: "/Operations",
        icon: DocumentDuplicateIcon,
        visible: true,
      },
      {
        name: "Report",
        href: "/Clients",
        icon: DocumentDuplicateIcon,
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
              className={`flex flex-row fixed top-0 h-14 bg-[#065AD8] flex items-center shadow-inner ${
                isDrawerOpen ? " w-full" : "w-full lg:w-auto"
              }`}
            >
              <div className="flex h-10 py-3 pb-4 shrink-0 items-center">
                <DashLogo />
              </div>
              <div
                className={`ml-4 ${
                  isDrawerOpen ? "fixed left-60 ml-16 lg:fixed" : "fixed left-7"
                } cursor-pointer`}
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
            className={`flex flex-col bg-white h-screen overflow-y-auto py-10 lg:w-60 sm:w-60 ${
              isDrawerOpen ? "block" : "hidden"
            }`}
          >
            <nav className="mt-16 flex-1 w-full">
              <ul className="flex flex-col gap-y-4 w-full border-[#0068dd] bg-[#ecf4ff] h-[48px] w-[275px]">
                {/* <ul className="w-[269px] h-[48px] flex flex-col justify-center gap-y-4 m-[17px_0_6px] p-[12px_10px_12px_35px] border-2 border-[#0068dd] bg-[#ecf4ff]"> */}
                {navigation
                  .filter((item) => item.visible)
                  .map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      passHref
                      className={classNames(
                        router.pathname === item.href
                          ? "bg-blue-100 text-[#065AD8]" // Active item style
                          : "text-gray-700 hover:text-blue-800 hover:bg-blue-100", // Non-active item style
                        "group flex items-center gap-x-4 rounded-md py-3 px-4 text-sm leading-6 font-semibold"
                      )}
                    >
                      {/* <div class="w-[269px] h-[48px] flex flex-col justify-center items-start gap-2.5 m-[17px_0_6px] p-[12px_10px_12px_35px] border-2 border-[#0068dd] bg-[#ecf4ff]">
                       */}
                      <item.icon
                        className={classNames(
                          router.pathname === item.href
                            ? "text-blue-800" // Active icon style
                            : "text-gray-400 group-hover:text-blue-800", // Non-active icon style
                          "h-4 w-4 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      <span>{item.name}</span>
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
