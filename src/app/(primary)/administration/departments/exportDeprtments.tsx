import { fbDb } from '@/firebase/configs';
import { getDocs, collection } from 'firebase/firestore';
import Constants from '@/Constants';
import { DEPARTMENT } from '@/models/department';

export async function exportDataToCSV(companyId: string, status?: string) {
  const tripsCollection = collection(fbDb, Constants.fbDepartments);
  const snapshot = await getDocs(tripsCollection);
  let data: DEPARTMENT[] = [];

  snapshot.forEach((doc) => {
    const docData = doc.data() as DEPARTMENT;
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
    data = data.filter((department) => {
      switch (status) {
        case 'all':
          return true;
        case 'active':
          return department.isActive === true;
        case 'inactive':
          return department.isActive === false;

        default:
          return false;
      }
    });

    if (data.length === 0) {
      return `No data found for the status: ${status}.`;
    }
  }

  const csvData = data.map((department) => ({
    Name: department.name,
    Status: department.isActive ? 'Active' : 'Inactive',
  }));

  const header = 'Name,Status';
  const csvString = [header, ...csvData.map((item) => Object.values(item).join(','))].join('\n');

  return csvString;
}
