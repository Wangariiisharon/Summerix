import { clientConfig } from '@/config';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const apps = getApps();
console.debug('apps:', apps);
if (!apps.length || apps.length === 0) {
  console.debug('do initialize firebase...');

  try {
    initializeApp(clientConfig);
  } catch (error) {
    console.error('FIREBASE INIT ERROR:::', error);
  }
}
console.debug('apps:', getApps());
const firebaseApp = getApps()[0];
export const fbDb = getFirestore(firebaseApp);
export const fbAuth = getAuth(firebaseApp);
export const fbStorage = getStorage(firebaseApp);

export default firebaseApp;
