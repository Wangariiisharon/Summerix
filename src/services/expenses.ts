import { fbDb } from '@/firebase/configs';
import Constants from '@/Constants';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export async function calculateTotalExpenses(
  companyId: string,
  startDate: Date | null,
  endDate: Date | null,
): Promise<number> {
  try {
    console.log({ companyId, startDate, endDate });
    let q = query(collection(fbDb, Constants.fbExpenses), where('company.docId', '==', companyId));

    // Add date range filters if provided
    if (startDate && endDate) {
      q = query(
        q,
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
      );
    }

    const querySnapshot = await getDocs(q);
    const total = querySnapshot.docs.reduce((sum, doc) => {
      const expense = doc.data();
      return sum + (expense.amount || 0);
    }, 0);

    return total;
  } catch (error) {
    console.error('Error calculating total expenses:', error);
    return 0;
  }
}

export async function calculateTotalIncome(
  companyId: string,
  startDate: Date | null,
  endDate: Date | null,
): Promise<number> {
  try {
    let q = query(collection(fbDb, Constants.fbTrips), where('company.docId', '==', companyId));

    // Add date range filters if provided
    if (startDate && endDate) {
      q = query(
        q,
        where('dateCreated', '>=', Timestamp.fromDate(startDate)),
        where('dateCreated', '<=', Timestamp.fromDate(endDate)),
      );
    }

    const querySnapshot = await getDocs(q);
    const total = querySnapshot.docs.reduce((sum, doc) => {
      const trip = doc.data();
      return sum + (trip.payments?.paidAmount || 0);
    }, 0);

    return total;
  } catch (error) {
    console.error('Error calculating total income:', error);
    return 0;
  }
}

export async function calculateAverageExpensesPerTruck(
  companyId: string,
  startDate: Date | null,
  endDate: Date | null,
  totalVehicles: number,
): Promise<number> {
  try {
    if (totalVehicles === 0) return 0;

    const totalExpenses = await calculateTotalExpenses(companyId, startDate, endDate);
    return totalExpenses / totalVehicles;
  } catch (error) {
    console.error('Error calculating average expenses per truck:', error);
    return 0;
  }
}

export async function calculateAverageIncomePerTruck(
  companyId: string,
  startDate: Date | null,
  endDate: Date | null,
  totalVehicles: number,
): Promise<number> {
  try {
    if (totalVehicles === 0) return 0;

    const totalIncome = await calculateTotalIncome(companyId, startDate, endDate);
    return totalIncome / totalVehicles;
  } catch (error) {
    console.error('Error calculating average income per truck:', error);
    return 0;
  }
}
