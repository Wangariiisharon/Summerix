export interface EXPENSE {
  docId?: string;
  name: string;
  amount: number;
  category: string;
  date: any; // Firestore timestamp
  company: {
    docId: string;
    name: string;
  };
  createdBy: {
    authId: string;
    email: string;
  };
  lastUpdated: any; // Firestore timestamp
}
