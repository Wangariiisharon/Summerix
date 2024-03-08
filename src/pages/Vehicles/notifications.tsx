// import { useState, useEffect } from "react";
// import { useAuthContext } from "@/components/Authentication/AuthProvider";
// import { collection, onSnapshot, doc, getDoc, updateDoc, setDoc } from "@firebase/firestore";
// import { fbDb } from "@/firebase/configs";


// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   timestamp: Date;
//   needsDisplay: boolean;
// }

// interface UserData {
//   super_admin: boolean;
//   email: string;
// }

// interface AuthContextData {
//   organisationId: string;
//   userData: UserData | null;
// }

// const Notifications = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const { organisationId, userData } = useAuthContext() as AuthContextData;
//   const [hasNewNotifications, setHasNewNotifications] = useState(false);


//   useEffect(() => {
//     if (organisationId && userData) {
//       const unsubscribe = onSnapshot(collection(fbDb, 'notifications'), async (querySnapshot) => {
//         const notificationsData: Notification[] = [];
//         let hasNew = false; // Initialize hasNew variable


//         for (const docChange of querySnapshot.docChanges()) {
//           const notificationDoc = docChange.doc;

//           if (docChange.type === 'added') {
//             const notificationData = notificationDoc.data();
//             const viewed = await isNotificationViewed(notificationDoc.id, userData.email);

//             if (notificationData.needsDisplay && !viewed) {
//               notificationsData.push({
//                 id: notificationDoc.id,
//                 title: notificationData.title,
//                 message: notificationData.message,
//                 timestamp: notificationData.timestamp.toDate(),
//                 needsDisplay: notificationData.needsDisplay,
//               }); 
//               hasNew = true; // Set hasNew to true if there are new notifications

//             }
//           }
//         }
//         setNotifications(notificationsData);
//         setHasNewNotifications(true);

//       });

//       return () => unsubscribe();
//     }
//   }, [organisationId, userData]);

//   const markNotificationAsRead = async (notificationId: string, userEmail: string) => {
//     try {
//       if (userEmail) {
//         const userDocRef = doc(fbDb, 'user_notifications', userEmail);
//         const userDocSnapshot = await getDoc(userDocRef);

//         if (userDocSnapshot.exists()) {
//           const userData = userDocSnapshot.data();
//           const viewedNotifications = userData?.viewedNotifications || [];
//           viewedNotifications.push(notificationId);

//           await updateDoc(userDocRef, {
//             viewedNotifications: viewedNotifications,
//           });
//         } else {
//           await setDoc(userDocRef, {
//             viewedNotifications: [notificationId],
//           });
//         }

//         // Remove the notification from the state
//         setNotifications(notifications => notifications.filter(notification => notification.id !== notificationId));
//       } else {
//         console.error('User email is undefined');
//       }
//     } catch (error) {
//       console.error('Error marking notification as read:', error);
//     }
//   };

//   const isNotificationViewed = async (notificationId: string, userEmail: string) => {
//     try {
//       const userDocRef = doc(fbDb, 'user_notifications', userEmail);
//       const userDocSnapshot = await getDoc(userDocRef);

//       if (userDocSnapshot.exists()) {
//         const userData = userDocSnapshot.data();
//         return userData?.viewedNotifications?.includes(notificationId) || false;
//       } else {
//         console.error('User document not found');
//         return false;
//       }
//     } catch (error) {
//       console.error('Error checking notification status:', error);
//       return false;
//     }
//   };

//   return (
//     <div className="bg-white shadow rounded-md">
//       <div className="p-4"></div>
//       <ul>
//         {notifications.map((notification: Notification) => (
//           <li key={notification.id} className={`flex justify-between items-center py-4 px-4 border-b last:border-b-0 last:rounded-b-md`}>
//             <div>
//               <p className="text-sm font-semibold text-[#065AD8] p-2">{notification.title}</p>
//               <p className="text-sm p-2">{notification.message}</p>
//               <p className="text-xs p-2">Time: {notification.timestamp.toLocaleString()}</p>
//               <button
//                 className={`text-[#4FD1C5] p-2 text-sm hover:text-gray-700 focus:outline-none`}
//                 onClick={() => {
//                   if (userData && userData.email) {
//                     markNotificationAsRead(notification.id, userData.email);
//                   }
//                 }}
//                 >
//                 Close
//               </button>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Notifications;


