// import { getMessaging } from 'firebase/messaging';
// import firebaseApp, { fbDb } from "@/firebase/configs";


// export const getFCMToken = async () => { 
//     const messaging = getMessaging();

//   try {
//     const token = await messaging.getToken();
//     console.log('FCM token:', token);
//     // Store the FCM token in your Firebase Cloud Firestore database
//   } catch (error) {
//     console.error('Error getting FCM token:', error);
//   }
// }; 
// const fcmToken = await getFCMToken(); 

 import { getMessaging, getToken } from 'firebase/messaging';
import firebaseApp, { fbDb } from "@/firebase/configs";


export const getFCMToken = async () => { 
  const messaging = getMessaging(firebaseApp);
  
  try {
   const token = await getToken(messaging);
   console.log('FCM token:', token);

    // Store the FCM token in your Firebase Cloud Firestore database
    const db = getFirestore();
    await setDoc(doc(db, 'admins', userId), { fcmToken: token });

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return undefined;
  }
};




