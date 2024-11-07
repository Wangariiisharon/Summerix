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
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { formatDistanceToNow } from "date-fns";
import { useAuthContext } from "../../auth-provider";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { currentUser, organisationId } = useAuthContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!organisationId || !currentUser) return;

    const notificationsRef = collection(
      fbDb,
      `user_notifications/${currentUser.uid}/notifications`
    ); // Use adminId here

    const q = query(
      notificationsRef,
      where("organisationId", "==", organisationId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(results);
    });

    return () => unsubscribe();
  }, [currentUser, organisationId]);

  const markAllAsRead = async () => {
    const batch = writeBatch(fbDb);

    notifications.forEach((notification) => {
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
