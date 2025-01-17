import { fbDb } from '@/firebase/configs';
import { getDocs, collection } from 'firebase/firestore';
import Constants from '@/Constants';
import { DEPARTMENT } from '@/models/department';

export async function exportDataToCSV(companyId: string, status?: string) {
  const departmentsCollection = collection(fbDb, Constants.fbDepartments);
  const snapshot = await getDocs(departmentsCollection);
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
      if (status === 'active') {
        return department.isActive; // Active vehicles
      } else if (status === 'inactive') {
        return !department.isActive; // Inactive vehicles
      }
      return false; // Invalid status
    });

    if (data.length === 0) {
      return `No data found for the status: ${status}.`;
    }
  }

  const csvData = data.map((department) => ({
    Name: department.name || 'NA',
    Roles: department.roles.join(', ') || 'NA',
    Status: department.isActive ? 'Active' : 'Inactive',
    UpdatdBy: department.updatedBy.email || 'NA',
  }));

  const escapeCsvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`; // Wrap in quotes and escape internal quotes
  const header = ['Name', 'Roles', 'Status', 'UpdatdBy'].map(escapeCsvValue).join(',');

  const rows = csvData
    .map((item) =>
      Object.values(item)
        .map((value) => escapeCsvValue(String(value))) // Convert each value to string and escape
        .join(','),
    )
    .join('\n');

  return `${header}\n${rows}`;
}
