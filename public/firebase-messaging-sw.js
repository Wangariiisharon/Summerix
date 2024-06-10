self.importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE",
  authDomain: "truck-it-bf0b2.firebaseapp.com",
  projectId: "truck-it-bf0b2",
  storageBucket: "truck-it-bf0b2.appspot.com",
  messagingSenderId: "444807794647",
  appId: "1:444807794647:web:a2754d536a13ff3df90592"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo-black.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});