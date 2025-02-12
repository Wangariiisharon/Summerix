import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { TRIP } from '@/models/trip';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const checkInvoiceNumber = async (trip: TRIP): Promise<number> => {
  try {
    const tripsCollection = collection(fbDb, Constants.fbTrips);
    const q = query(
      tripsCollection,
      where('company.docId', '==', trip.company.docId),
      where('invoiceUrl', '!=', null),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
  } catch (error) {
    console.error('Error checking invoice number:', error);
    return 0;
  }
};
