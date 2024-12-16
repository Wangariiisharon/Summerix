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
    data = data.filter((vehicle) => {
      switch (status) {
        case 'all':
          return true;
        case 'active':
          return vehicle.isArchived === true;
        case 'inactive':
          return vehicle.isArchived === false;

        default:
          return false;
      }
    });

    if (data.length === 0) {
      return `No data found for the status: ${status}.`;
    }
  }

  const csvData = data.map((vehicle) => ({
    Name: vehicle.name,
    RegNumber: vehicle.regNumber,
    Make: vehicle.make,
    Model: vehicle.model,
    Type: vehicle.type,
    Cargo: vehicle.cargo.capacity,
    Ownership: vehicle.ownership.status,
    Status: vehicle.isArchived ? 'Active' : 'Inactive',
  }));

  const header = 'Name,RegNumber,Make,Model,Type,Cargo,Ownership,Status';
  const csvString = [header, ...csvData.map((item) => Object.values(item).join(','))].join('\n');

  return csvString;
}
