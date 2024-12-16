import { fbDb } from '@/firebase/configs';
import { getDocs, collection } from 'firebase/firestore';
import Constants from '@/Constants';
import { TRIP } from '@/models/trip';

export async function exportDataToCSV(companyId: string, status?: string) {
  const tripsCollection = collection(fbDb, Constants.fbTrips);
  const snapshot = await getDocs(tripsCollection);
  let data: TRIP[] = [];

  snapshot.forEach((doc) => {
    const docData = doc.data() as TRIP;
    if (docData.company.docId === companyId) {
      data.push({
        ...docData,
        docId: doc.id,
      });
    }
  });

  if (data.length === 0) {
    return 'No data found in Firestore.';
  }

  if (status && status !== 'all') {
    data = data.filter((trip) => {
      switch (status) {
        case 'all':
          return true;
        case 'active':
          return trip.status === 'active';
        case 'booked':
          return trip.status === 'booked';
        case 'completed':
          return trip.status === 'completed';
        case 'cancelled':
          return trip.status === 'cancelled';

        default:
          return false;
      }
    });

    if (data.length === 0) {
      return `No data found for the status: ${status}.`;
    }
  }

  const csvData = data.map((trip) => ({
    From: trip.from.location,
    To: trip.to.location,
    Distance: trip.distance.text,
    Vehicle: trip.vehicle?.regNumber,
    Driver: trip.driver.displayName,
    UpdatedBy: trip.updatedBy.email,
    Status: trip.status,
  }));

  const header = 'From,To,Distance,Vehicle,Driver,updatedBy,Status';
  const csvString = [header, ...csvData.map((item) => Object.values(item).join(','))].join('\n');

  return csvString;
}
