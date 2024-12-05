import { Timestamp } from 'firebase/firestore';

export interface PARAMS_FILTER {
  dateRange: string;
  filterByDate: string;
  startDate: Timestamp;
  endDate: Timestamp;
}


