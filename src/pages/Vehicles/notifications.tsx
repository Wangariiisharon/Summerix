import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import firebaseApp, { fbDb } from "@/firebase/configs";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]); 
  const [numUsersToClose, setNumUsersToClose] = useState(3);


  useEffect(() => {
    const q = query(collection(fbDb, "notifications"), where("read", "==", false));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData: Notification[] = [];
      querySnapshot.forEach((doc) => {
        notificationsData.push({
          id: doc.id,
          title: doc.data().title,
          message: doc.data().message,
          timestamp: doc.data().timestamp.toDate(),
          read: doc.data().read,
        });
      });
      setNotifications(notificationsData);
    });

    return () => unsubscribe();
  }, []);

  const markNotificationAsRead = async (notificationId: string) => {
    const notificationRef = doc(fbDb, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  };

  return (
    <div className="bg-white shadow rounded-md">
      <div className="p-4">
      </div>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id} className={`flex justify-between items-center py-4 px-4 border-b last:border-b-0 last:rounded-b-md ${notification.read ? 'bg-gray-100' : ''}`}>
            <div>
              {/* <strong>{notification.title}</strong> - {notification.message} */} 
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

// const [numUsersToClose, setNumUsersToClose] = useState(3);

// const markNotificationAsRead = async (notificationId: string) => {
//   const notificationRef = doc(fbDb, "notifications", notificationId);
//   const notificationDoc = await getDoc(notificationRef);
//   if (notificationDoc.exists() && !notificationDoc.data().read && notificationDoc.data().numUsersClosed < numUsersToClose) {
//     await updateDoc(notificationRef, {
//       numUsersClosed: notificationDoc.data().numUsersClosed + 1,
//     });
//   } else if (notificationDoc.exists() && notificationDoc.data().read && notificationDoc.data().numUsersClosed >= numUsersToClose) {
//     await updateDoc(notificationRef, {
//       read: true,
//     });
//   }
// };