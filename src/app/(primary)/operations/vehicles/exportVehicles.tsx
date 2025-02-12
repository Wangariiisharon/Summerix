import { fbDb } from '@/firebase/configs';
import { getDocs, collection } from 'firebase/firestore';
import Constants from '@/Constants';
import { VEHICLE } from '@/models/vehicle';

export async function exportDataToCSV(companyId: string, status?: string) {
  const vehiclesCollection = collection(fbDb, Constants.fbVehicles);
  const snapshot = await getDocs(vehiclesCollection);
  let data: VEHICLE[] = [];

  snapshot.forEach((doc) => {
    const docData = doc.data() as VEHICLE;
    if (docData.company?.docId === companyId) {
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
    data = data.filter((vehicle) => {
      if (status === 'available') {
        return vehicle.status === 'available';
      } else if (status === 'on-route') {
        return vehicle.status === 'on-route';
      } else if (status === 'out-of-service') {
        return vehicle.status === 'out-of-service';
      } else if (status === 'under-maintenance') {
        return vehicle.status === 'under-maintenance';
      }
      return false; // Invalid status
    });

    if (data.length === 0) {
      return `No data found for the status: ${status}.`;
    }
  }

  const csvData = data.map((vehicle) => ({
    RegNumber: vehicle.regNumber || 'N/A',
    Make: vehicle.make || 'N/A',
    Model: vehicle.model || 'N/A',
    Type: vehicle.type || 'N/A',
    Cargo: vehicle.cargo?.capacity || 'N/A',
    Ownership: vehicle.ownership?.status || 'N/A',
    Status: vehicle.status || 'N/A',
  }));

  // Escape CSV values to prevent breaking structure
  const escapeCsvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`; // Wrap in quotes and escape internal quotes

  const header = ['RegNumber', 'Make', 'Model', 'Type', 'Cargo', 'Ownership', 'Status']
    .map(escapeCsvValue)
    .join(',');

  const rows = csvData
    .map((item) =>
      Object.values(item)
        .map((value) => escapeCsvValue(String(value))) // Convert each value to string and escape
        .join(','),
    )
    .join('\n');

  return `${header}\n${rows}`;
}
