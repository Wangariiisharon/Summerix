import { fbDb } from '@/firebase/configs';
import { getDocs, collection } from 'firebase/firestore';
import Constants from '@/Constants';
import { CLIENT } from '@/models/client';

export async function exportDataToCSV(companyId: string, status?: string) {
  const clientsCollection = collection(fbDb, Constants.fbClients);
  const snapshot = await getDocs(clientsCollection);
  let data: CLIENT[] = [];

  snapshot.forEach((doc) => {
    const docData = doc.data() as CLIENT;
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
    data = data.filter((client) => {
      switch (status) {
        case 'all':
          return true;
        case 'active':
          return client.isActive === true;
        case 'inactive':
          return client.isActive === false;

        default:
          return false;
      }
    });

    if (data.length === 0) {
      return `No data found for the status: ${status}.`;
    }
  }

  const csvData = data.map((client) => ({
    Name: client.displayName,
    Email: client.email,
    PhoneNumber: client.phoneNumber,
    updatedBy: client.updatedBy.email,
    Currency: client.currency,
    Status: client.isActive ? 'Active' : 'Inactive',
  }));

  const header = 'Name,Email,PhoneNumber,updatedBy,Currency,Status';
  const csvString = [header, ...csvData.map((item) => Object.values(item).join(','))].join('\n');

  return csvString;
}
