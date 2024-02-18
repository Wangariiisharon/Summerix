import { fbDb } from "@/firebase/configs";
import { collection, onSnapshot, doc, updateDoc, getDoc } from "@firebase/firestore";
import { useState, useEffect } from "react";
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  needsDisplay: boolean;
}

interface UserData {
  email: string;
  super_admin: boolean;
}

interface AuthContextData {
  organisationId: string;
  userData: UserData;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { organisationId, userData } = useAuthContext() as AuthContextData;

  useEffect(() => {
    if (organisationId) {
      const unsubscribe = onSnapshot(collection(fbDb, 'notifications'), async (querySnapshot) => {
        const notificationsData: Notification[] = [];
  
// ... (inside the useEffect)
for (const docChange of querySnapshot.docChanges()) {
  const notificationDoc = docChange.doc;

  // Check if notification document has maintenanceId
  if (notificationDoc.data().maintenanceId) {
    const maintenanceDocRef = doc(fbDb, 'maintenance', notificationDoc.data().maintenanceId);
    const maintenanceDocSnapshot = await getDoc(maintenanceDocRef);

    const maintenanceData = maintenanceDocSnapshot.data();
    const isPending = maintenanceData && maintenanceData.status === 'Pending';

    if (
      docChange.type === 'added' &&
      isPending &&
      notificationDoc.data().needsDisplay &&
      !(await isNotificationRead(userData.email, notificationDoc.id))
    ) {
      notificationsData.push({
        id: notificationDoc.id,
        title: notificationDoc.data().title,
        message: notificationDoc.data().message,
        timestamp: notificationDoc.data().timestamp.toDate(),
        needsDisplay: notificationDoc.data().needsDisplay,
      });
    }
  }
}
// ...

  
        setNotifications(notificationsData);
      });
  
      return () => unsubscribe();
    }
  }, []);
  

  const isNotificationRead = async (userEmail: string, notificationId: string) => {
    try {
      const userNotificationDocRef = doc(
        fbDb,
        'admins',
        userData.email || '' // Use a default value or handle undefined userEmail
      );
  
      const userNotificationDocSnapshot = await getDoc(userNotificationDocRef);
  
      // Ensure that userNotificationDocSnapshot.data()?.read is a boolean
      const isRead = userNotificationDocSnapshot.exists() && userNotificationDocSnapshot.data()?.read === true;
  
      if (isRead) {
        console.log('Notification has already been read by the user');
      }
  
      return isRead;
    } catch (error) {
      console.error('Error checking if notification is read:', error);
      return false;
    }
  };
  
  

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const notificationDocRef = doc(fbDb, 'notifications', notificationId);
      const notificationDocSnapshot = await getDoc(notificationDocRef);
  
      if (notificationDocSnapshot.exists()) {
        // Check if the user has already read this notification
        const userNotificationDocRef = doc(
          fbDb,
          'admins',
          userData?.email || '' // Use a default value or handle undefined userData.email
        );
  
        const userNotificationDocSnapshot = await getDoc(userNotificationDocRef);
        
        // Explicitly check if userNotificationDocSnapshot.data() is defined and has read property
        if (
          userNotificationDocSnapshot.exists() &&
          userNotificationDocSnapshot.data() &&
          typeof userNotificationDocSnapshot.data().read === 'boolean' &&
          userNotificationDocSnapshot.data().read
        ) {
          console.log('Notification has already been read by the user');
          return;
        }
  
        // Update the notification to mark it as read
        await updateDoc(notificationDocRef, {
          needsDisplay: false,
        });
  
        console.log('Notification marked as read');
      } else {
        console.error('Notification not found');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-md">
      <div className="p-4"></div>
      <ul>
        {notifications.map((notification: any) => (
          <li key={notification.id} className={`flex justify-between items-center py-4 px-4 border-b last:border-b-0 last:rounded-b-md`}>
            <div>
              <p className="text-sm font-semibold text-[#065AD8] p-2">{notification.title}</p>
              <p className="text-sm p-2">{notification.message}</p>
              <p className="text-xs p-2">Time: {notification.timestamp.toLocaleString()}</p>
              <button className={`text-[#4FD1C5] p-2 text-sm hover:text-gray-700 focus:outline-none`} onClick={() => markNotificationAsRead(notification.id)}>
                Close
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
