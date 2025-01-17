import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { DEPARTMENT } from '@/models/department';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const checkHasUsers = async (department: DEPARTMENT): Promise<boolean> => {
  const adminsRef = collection(fbDb, Constants.fbAdmins);
  const q = query(adminsRef, where('department.docId', '==', department.docId));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
