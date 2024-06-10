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
