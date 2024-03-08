import { useRouter } from 'next/router';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import firebaseApp, { fbDb } from "@/firebase/configs";

const messaging = getMessaging(firebaseApp);

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Request permission to receive notifications
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Register the service worker
        getToken(messaging, { vapidKey: 'BMiLEy0NT-toPT6b6Tmj2t0uSi3N7Pn9vsQGFFeY5f6GjiX_2CE7NaNBdjxr4-z3EJRXdiiL34OIZMfSFVfM6yk' }).then((currentToken) => {
          if (currentToken) {
            console.log('Token:', currentToken);
            // Send the token to your server and save it in the user document
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
      } else {
        console.log('Unable to get notification permission.');
      }
    });

    // Listen for incoming messages
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // Display the notification to the user
    });
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => router.push('/Vehicles/maintenance')}>Schedule Maintenance</button>
    </div>
  );
};

export default HomePage;


