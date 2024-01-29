import { fbDb } from "@/firebase/configs";
import { query, collection, where, onSnapshot, doc, updateDoc, getDoc } from "@firebase/firestore";
import { useState, useEffect } from "react";
import { DataSnapshot } from '@firebase/database-types'; 


interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  needsDisplay: boolean; // Add this line
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]); 
  const [numUsersToClose, setNumUsersToClose] = useState(3);


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(fbDb, 'notifications'), async (querySnapshot) => {
      const notificationsData: Notification[] = [];
  
      for (const docChange of querySnapshot.docChanges()) {
        const notificationDoc = docChange.doc;
  
        // Fetch the corresponding maintenance document
        const maintenanceDocRef = doc(fbDb, 'maintenance', notificationDoc.data().maintenanceId);
        const maintenanceDocSnapshot = await getDoc(maintenanceDocRef);
  
        const maintenanceData = maintenanceDocSnapshot.data();
        const isPending = maintenanceData && maintenanceData.status === 'Pending';
  
        if (
          docChange.type === 'added' &&
          isPending &&
          !notificationDoc.data().read &&
          notificationDoc.data().needsDisplay
        ) {
          notificationsData.push({
            id: notificationDoc.id,
            title: notificationDoc.data().title,
            message: notificationDoc.data().message,
            timestamp: notificationDoc.data().timestamp.toDate(),
            read: notificationDoc.data().read,
            needsDisplay: notificationDoc.data().needsDisplay,
          });
        }
      }
  
      setNotifications(notificationsData);
    });
  
    return () => unsubscribe();
  }, []);
  
  


  // const markNotificationAsRead = async (notificationId: string) => {
  //   try {
  //     await updateDoc(doc(fbDb, 'notifications', notificationId), {
  //       read: true,
  //       needsDisplay: false, // Add this line
  //     });
  //     console.log('Notification marked as read');
  //   } catch (error) {
  //     console.error('Error marking notification as read:', error);
  //   }
  // };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const notificationDocRef = doc(fbDb, 'notifications', notificationId);
      const notificationDocSnapshot = await getDoc(notificationDocRef);
  
      if (notificationDocSnapshot.exists()) {
        const maintenanceDocRef = doc(fbDb, 'maintenance', notificationDocSnapshot.data().maintenanceId);
        const maintenanceDocSnapshot = await getDoc(maintenanceDocRef);
  
        // Check if the maintenance status is "Approved"
        const isApproved = maintenanceDocSnapshot.exists() && maintenanceDocSnapshot.data()?.status === 'Approved';
  
        if (isApproved) {
          // Update the notification only if the status is "Approved"
          await updateDoc(notificationDocRef, {
            read: true,
            needsDisplay: false,
          });
  
          console.log('Notification marked as read');
        } else {
          console.warn('Notification not marked as read: Maintenance status is not "Approved"');
        }
      } else {
        console.error('Notification not found');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-md">
      <div className="p-4">
      </div>
      <ul>
        {notifications.map((notification:any) => (
          <li key={notification.id} className={`flex justify-between items-center py-4 px-4 border-b last:border-b-0 last:rounded-b-md ${notification.read ? 'bg-gray-100' : ''}`}>
            <div>
              <p className="text-sm font-semibold text-[#065AD8] p-2">
              {notification.title}
              </p> 
              <p className="text-sm p-2">
              {notification.message}
              </p>
              <p className="text-xs p-2">
              Time:{notification.timestamp.toLocaleString()} 
              </p> 
              <button className={`text-[#4FD1C5] p-2 text-sm hover:text-gray-700 focus:outline-none ${notification.read ? 'hidden' : ''}`} onClick={() => markNotificationAsRead(notification.id)}>Close</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;