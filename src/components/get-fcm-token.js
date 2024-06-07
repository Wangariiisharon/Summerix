import { getMessaging, getToken } from "firebase/messaging";
import firebaseApp from "@/firebase/configs";

export const getFCMToken = async () => {
  const messaging = getMessaging(firebaseApp);

  try {
    const token = await getToken(messaging);

    // Store the FCM token in your Firebase Cloud Firestore database
    const db = getFirestore();
    await setDoc(doc(db, "admins", userId), { fcmToken: token });

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return undefined;
  }
};
