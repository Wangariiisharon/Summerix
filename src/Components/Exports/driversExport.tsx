// driversExport.tsx
import firebaseApp, { fbDb } from "@/firebase/configs";
import {
  getDocs,
  collection,
  DocumentData,
  where,
  query,
} from "firebase/firestore";

export default async function ExportDriverDataToCSV(
  organisationId: string | null
) {
  if (!organisationId) {
    console.error("Organisation ID is not available.");
    throw new Error("Organisation ID is not available");
  }

  try {
    const data: DocumentData[] = [];
    const q = query(
      collection(fbDb, "drivers"),
      where("organisationId", "==", organisationId)
    );
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
      data.push(doc.data());
    });

    if (data.length === 0) {
      return "No data found in Firestore for the given organisationId";
    }

    const csvString =
      "Name,PhoneNumber,Email,Country,City,Profile,Id,GoodConduct\n" +
      data.map((driver) => Object.values(driver).join(",")).join("\n");
    return csvString;
  } catch (error) {
    console.error("Error exporting Firestore data:", error);
    throw new Error("An error occurred");
  }
}
