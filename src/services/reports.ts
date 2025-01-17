import { fbDb } from '@/firebase/configs';
import Constants from '@/Constants';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface ReportFilters {
  startDate: Date | null;
  endDate: Date | null;
  truckId?: string;
  driverId?: string;
}

export interface ProfitLossData {
  date: string;
  income: number;
  expenses: number;
  profit: number;
}

export async function fetchProfitLossData(
  companyId: string,
  filters: ReportFilters,
): Promise<ProfitLossData[]> {
  try {
    // Get expenses
    let expensesQuery = query(
      collection(fbDb, Constants.fbExpenses),
      where('company.docId', '==', companyId),
    );

    // Get income from trips
    let tripsQuery = query(
      collection(fbDb, Constants.fbTrips),
      where('company.docId', '==', companyId),
    );

    if (filters.startDate && filters.endDate) {
      expensesQuery = query(
        expensesQuery,
        where('date', '>=', Timestamp.fromDate(filters.startDate)),
        where('date', '<=', Timestamp.fromDate(filters.endDate)),
      );

      tripsQuery = query(
        tripsQuery,
        where('dateCreated', '>=', Timestamp.fromDate(filters.startDate)),
        where('dateCreated', '<=', Timestamp.fromDate(filters.endDate)),
      );
    }

    if (filters.truckId) {
      expensesQuery = query(expensesQuery, where('vehicle.docId', '==', filters.truckId));
      tripsQuery = query(tripsQuery, where('vehicle.docId', '==', filters.truckId));
    }

    if (filters.driverId) {
      tripsQuery = query(tripsQuery, where('driver.docId', '==', filters.driverId));
    }

    const [expensesSnapshot, tripsSnapshot] = await Promise.all([
      getDocs(expensesQuery),
      getDocs(tripsQuery),
    ]);

    const expenses = expensesSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const trips = tripsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Aggregate data by date
    const aggregatedData = new Map<string, ProfitLossData>();

    expenses.forEach((expense: any) => {
      const date = new Date(expense.date.toDate()).toISOString().split('T')[0];
      if (!aggregatedData.has(date)) {
        aggregatedData.set(date, { date, income: 0, expenses: 0, profit: 0 });
      }
      const data = aggregatedData.get(date)!;
      data.expenses += expense.amount || 0;
      data.profit = data.income - data.expenses;
    });

    trips.forEach((trip: any) => {
      const date = new Date(trip.dateCreated.toDate()).toISOString().split('T')[0];
      if (!aggregatedData.has(date)) {
        aggregatedData.set(date, { date, income: 0, expenses: 0, profit: 0 });
      }
      const data = aggregatedData.get(date)!;
      data.income += trip.payments?.paidAmount || 0;
      data.profit = data.income - data.expenses;
    });

    return Array.from(aggregatedData.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching profit/loss data:', error);
    return [];
  }
}
