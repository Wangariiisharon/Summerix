import { fbDb } from '@/firebase/configs';
import { getDocs, collection } from 'firebase/firestore';
import Constants from '@/Constants';
import { CLASS } from '@/models/class';
export async function exportDataToCSV(companyId: string, status?: string) {
  const classesCollection = collection(fbDb, Constants.fbClasses);
  const snapshot = await getDocs(classesCollection);
  let data: CLASS[] = [];

  if (snapshot.empty) {
    return 'No data found in Firestore.';
  }

  snapshot.forEach((doc) => {
    const docData = doc.data() as CLASS;

    if (docData?.company?.docId === companyId) {
      data.push({
        ...docData,
        docId: doc.id,
      });
    }
  });

  if (data.length === 0) {
    return 'No data found for the given company ID.';
  }

  if (status && status !== 'all') {
    data = data.filter((department) => {
      if (status === 'active') {
        return department.isActive; // Active
      } else if (status === 'inactive') {
        return !department.isActive; // Inactive
      }
      return false; // Invalid status
    });

    if (data.length === 0) {
      return `No data found for the status: ${status}.`;
    }
  }

  const csvData = data.map((department) => ({
    Name: department.name || 'NA',
    Description: department.description || 'NA',
    Status: department.isActive ? 'Active' : 'Inactive',
    UpdatedBy: department.updatedBy?.email || 'NA',
  }));

  const escapeCsvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`;
  const header = ['Name', 'Description', 'Status', 'UpdatedBy'].map(escapeCsvValue).join(',');
  const rows = csvData
    .map((item) =>
      Object.values(item)
        .map((value) => escapeCsvValue(String(value)))
        .join(','),
    )
    .join('\n');

  return `${header}\n${rows}`;
}
