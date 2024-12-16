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

  // Prepare CSV Data
  const csvData = data.map((trip) => ({
    From: trip.from?.location || 'N/A', // Ensure fallback for missing fields
    To: trip.to?.location || 'N/A',
    Distance: trip.distance?.text || 'N/A',
    Vehicle: trip.vehicle?.regNumber || 'N/A',
    Driver: trip.driver?.displayName || 'N/A',
    UpdatedBy: trip.updatedBy?.email || 'N/A',
    Status: trip.status || 'N/A',
  }));

  // Escape and format each cell for CSV
  const escapeCsvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`;

  const header = ['From', 'To', 'Distance', 'Vehicle', 'Driver', 'UpdatedBy', 'Status']
    .map(escapeCsvValue)
    .join(',');

  const rows = csvData
    .map((item) =>
      Object.values(item)
        .map((value) => escapeCsvValue(value as string))
        .join(','),
    )
    .join('\n');

  return `${header}\n${rows}`;
}
