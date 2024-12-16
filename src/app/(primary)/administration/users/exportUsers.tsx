import { fbDb } from '@/firebase/configs';
import { getDocs, collection } from 'firebase/firestore';
import Constants from '@/Constants';
import { ADMIN } from '@/models/admin';

export async function exportDataToCSV(companyId: string, status?: string) {
  const adminsCollection = collection(fbDb, Constants.fbAdmins);
  const snapshot = await getDocs(adminsCollection);
  let data: ADMIN[] = [];

  snapshot.forEach((doc) => {
    const docData = doc.data() as ADMIN;
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
    data = data.filter((admin) => {
      switch (status) {
        case 'all':
          return true;
        case 'active':
          return admin.rolesMap.isActive === true;
        case 'inactive':
          return admin.rolesMap.isActive === false;

        default:
          return false;
      }
    });

    if (data.length === 0) {
      return `No data found for the status: ${status}.`;
    }
  }

  const csvData = data.map((admin) => ({
    Name: admin.displayName,
    Email: admin.email,
    Department: admin.department?.name || 'N/A',
    PhoneNumber: admin.phoneNumber,
    updatedBy: admin.updatedBy.email,
    Status: admin.rolesMap.isActive ? 'Active' : 'Inactive',
  }));

  const header = 'Name,Email,Department,PhoneNumber,updatedBy,Status';
  const csvString = [header, ...csvData.map((item) => Object.values(item).join(','))].join('\n');

  return csvString;
}
