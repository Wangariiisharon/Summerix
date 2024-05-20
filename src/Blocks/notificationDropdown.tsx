import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  writeBatch,
  doc,
  Timestamp,
  arrayUnion,
  orderBy,
  getFirestore,
} from "firebase/firestore";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import { TableBody } from "@/components/Table/Row";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Timestamp;
  maintenanceId: string;
  needsDisplay: boolean;
  readBy: string[];
}

export const NotificationDropdown = ({ isOpen, onClose }: any) => {
  const { currentUser, organisationId } = useAuthContext();
  const [isClosed, setIsClosed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!organisationId || !currentUser) return;

    // const notificationsRef = collection(fbDb, "notifications");
    const notificationsRef = collection(
      fbDb,
      `user_notifications/${currentUser.uid}/notifications`
    ); // Use adminId here

    const q = query(
      notificationsRef,
      where("organisationId", "==", organisationId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      const unreadNotifications = loadedNotifications.filter(
        (notification) => !notification.readBy.includes(currentUser.uid)
      );

      setUnreadCount(unreadNotifications.length);
      setNotifications(loadedNotifications);
    });

    return () => unsubscribe();
  }, [currentUser, organisationId]);

  const markAllAsRead = async () => {
    const batch = writeBatch(fbDb);
    notifications.forEach((notification) => {
      // const notificationRef = doc(fbDb, `notifications`, notification.id);
      // `user_notifications/${currentUser.uid}/notifications`
      const notificationRef = doc(
        fbDb,
        `user_notifications/${currentUser?.uid}/notifications`,
        notification.id
      );

      batch.update(notificationRef, {
        readBy: arrayUnion(currentUser?.uid),
      });
    });
    await batch.commit();

    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      readBy: [...notification.readBy, currentUser?.uid].filter(
        Boolean
      ) as string[], // Filter out undefined values
    }));

    setNotifications(updatedNotifications);
    setIsClosed(false);
    setUnreadCount(0);
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md py-2 z-10">
          <div className="flex justify-between items-center px-4 py-2">
            <span className="font-semibold">Notifications</span>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          </div>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {notifications.map((notification) => {
              const updatedDate = notification.timestamp.toDate();
              return (
                <div
                  key={notification.id}
                  className="py-2 divide-y divide-solid"
                >
                  <div className="px-4 py-1 hover:bg-gray-100">
                    <span className="font-semibold">{notification.title}</span>:{" "}
                    {notification.message}
                    <span className="block text-gray-500 text-sm">
                      {formatDistanceToNow(updatedDate, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   timestamp: Timestamp;
//   maintenanceId: string;
//   needsDisplay: boolean;
//   readBy: string[];
// }

// export const NotificationDropdown = ({ isOpen, onClose }: any) => {
//   const { currentUser, organisationId } = useAuthContext(); // Use the context values
//   const [isClosed, setIsClosed] = useState(false);
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     // Ensure we have the necessary IDs before querying
//     if (!organisationId || !currentUser) return;

//     const notificationsRef = collection(fbDb, "notifications");

//     const q = query(
//       notificationsRef,
//       where("organisationId", "==", organisationId)
//       // orderBy('timestamp', 'desc')
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const loadedNotifications = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as Notification[];
//       const unreadNotifications = loadedNotifications.filter(
//         (notification) => !notification.readBy.includes(currentUser.uid)
//       );
//       setUnreadCount(unreadNotifications.length);
//       setNotifications(unreadNotifications);
//     });

//     return () => unsubscribe();
//   }, [currentUser, organisationId]);

//   const markAllAsRead = async () => {
//     const batch = writeBatch(fbDb);
//     notifications.forEach((notification) => {
//       const notificationRef = doc(fbDb, `notifications`, notification.id);

//       batch.update(notificationRef, {
//         readBy: arrayUnion(currentUser?.uid), // Add the current user's ID to the readBy array
//       });
//     });
//     await batch.commit();

//     // Update the local notifications state to reflect the changes
//     const updatedNotifications = notifications.map((notification) => ({
//       ...notification,
//       readBy: [...notification.readBy, currentUser?.uid], // Ensure we're not duplicating IDs
//     }));

//     setIsClosed(false); // Assuming you want to close the dropdown here
//     setUnreadCount(0); // Reset unread count after marking all as read
//   };

//   const dropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: any) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         onClose(); // Call the onClose prop function to inform the parent to close the dropdown
//       }
//     };
//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md py-2 z-10">
//           <div className="flex justify-between items-center px-4 py-2">
//             <span className="font-semibold">Notifications</span>
//             <button
//               onClick={markAllAsRead}
//               className="text-sm text-blue-600 hover:underline"
//             >
//               Mark all as read
//             </button>
//           </div>
//           <div style={{ maxHeight: "200px", overflowY: "auto" }}>
//             {" "}
//             {/* Add scrollable styles here */}
//             <TableBody>
//               {notifications.map((notification) => {
//                 const { seconds } = notification?.timestamp || {}; // Use optional chaining
//                 const updatedDate = new Date(seconds * 1000);
//                 return (
//                   <div
//                     key={notification.id}
//                     className="py-2 divide-y divide-solid"
//                   >
//                     <div className="px-4 py-1 hover:bg-gray-100">
//                       <span className="font-semibold">
//                         {notification.title}{" "}
//                       </span>
//                       : {notification.message}
//                       <span className="font-semibold px-4 py-1 text-[#6A6B6C] text-sm">
//                         {formatDistanceToNow(updatedDate)}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </TableBody>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
