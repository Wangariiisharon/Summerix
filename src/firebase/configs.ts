// import 'firebase/auth';
// import { initializeApp, getApps } from 'firebase/app';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { getFirestore, Timestamp } from 'firebase/firestore';
// import { getMessaging, isSupported } from 'firebase/messaging'; // Add this import

// const apps = getApps();

// if (!apps.length || apps.length === 0) {
//   console.debug('do initialize firebase...');

//   try {
//     const firebaseConfig = {
//       apiKey: "AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE",
//       authDomain: "truck-it-bf0b2.firebaseapp.com",
//       projectId: "truck-it-bf0b2",
//       storageBucket: "truck-it-bf0b2.appspot.com",
//       messagingSenderId: "444807794647",
//       appId: "1:444807794647:web:a2754d536a13ff3df90592"
//     };

//     initializeApp(firebaseConfig);
//   } catch (error) {
//     console.error('FIREBASE INIT ERROR:::', error);
//   }
// }

// const firebaseApp = getApps()[0];

// export const fbDb = getFirestore(firebaseApp);

// // Check if messaging is supported and if the code is running on the client side
// const initializeMessaging = async () => {
//   const messagingSupported = await isSupported();
//   if (messagingSupported && typeof window !== 'undefined') {
//     return getMessaging(firebaseApp);
//   }
//   return null;
// };

// export const messaging = initializeMessaging();
// export const fromMillis = Timestamp.fromMillis;

// export default firebaseApp;



import 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Timestamp } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging'; // Add this import


const apps = getApps();

if (!apps.length || apps.length === 0) {
  console.debug('do initialize firebase...');

  try {
    const firebaseConfig = {
      apiKey:"AIzaSyAS4T5BD102vZhk0O9OQciWH2lzZmVkch8",
      authDomain: "next-authentication-89fda.firebaseapp.com",
      projectId: 'next-authentication-89fda', // Use a different project ID for development
      storageBucket: 'next-authentication-89fda.appspot.com',
      messagingSenderId: '341470080439',
      appId: '1:341470080439:web:949a9127e14dcf15f3cc32',
    };

    initializeApp(firebaseConfig);
  } catch (error) {
    console.error('FIREBASE INIT ERROR:::', error);
  }
}

const firebaseApp = getApps()[0];
export const fbDb = getFirestore(firebaseApp);
// const messaging = getMessaging(firebaseApp);
// export { messaging };
export const fromMillis = Timestamp.fromMillis;

export default firebaseApp;


