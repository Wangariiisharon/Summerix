import { fbDb } from "@/firebase/configs";
import {
  getDocs,
  collection,
  doc,
  query,
  where,
  runTransaction,
} from "firebase/firestore";
import toast from "react-hot-toast";

export default function maintananceApproval() {
  // Function to fetch pending data for a specific user

  const fetchPendingData = async (userId: string) => {
    try {
      const q = query(
        collection(fbDb, "maintenance"),
        where("status", "==", "Pending")
      );
      const querySnapshot = await getDocs(q);

      const pendingData: { id: string }[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.approvals.includes(userId)) {
          pendingData.push({ id: doc.id, ...data });
        }
      });

      return pendingData;
    } catch (error) {
      console.error("Error fetching pending data:", error);
      throw error;
    }
  };

  // Function to approve or reject data
  const approveData = async (
    docId: string | undefined,
    userId: any,
    isApproved: any
  ) => {
    const docRef = doc(collection(fbDb, "maintenance"), docId);

    try {
      await runTransaction(fbDb, async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists()) {
          throw new Error("Document does not exist!");
        }

        const data = doc.data();

        if (data.approvals.includes(userId)) {
          throw new Error("User has already approved this data.");
        }

        if (isApproved) {
          data.approvals.push(userId);
        }

        // Update status to 'Approved' if approvals reach three
        if (data.approvals.length === 3) {
          data.status = "Approved";
        }

        transaction.update(docRef, data);
      });

      toast.success("Data approval updated successfully.");
    } catch (error) {
      console.error("Error updating data approval:", error);
    }
  };

  return <div></div>;
}
