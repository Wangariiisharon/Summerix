import firebaseApp, { fbDb } from "@/firebase/configs";
import { getDocs, collection, DocumentData, where, query } from "firebase/firestore";
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";

export default async function ExportDriverDataToCSV() {
  const { organisationId } = useAuthContext();

  try {
    const data: DocumentData[] = [];

    if (organisationId) {
      // Use a query with a where clause to filter by organisationId
      const q = query(collection(fbDb, "drivers"), where("organisationId", "==", organisationId));
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        data.push(doc.data());
      });

      if (data.length === 0) {
        return "No data found in Firestore for the given organisationId";
      }

      const csvData = data.map((driver) => ({
        Name: driver.name,
        PhoneNumber: driver.phonenumber,
        Email: driver.email_adress,
        Country: driver.country,
        City: driver.city,
        Profile: driver.profile,
        Id: driver.identity_card,
        GoodConduct: driver.good_conduct,
        MedicalReport: driver.medical_report,
        Archive: driver.archive,
        Driver_Id:driver.driversId,

      }));

      // Create the CSV string
      const csvString = "Name,PhoneNumber,Email,Country,City,Profile,Id,GoodConduct\n" + csvData.map((item) => Object.values(item).join(",")).join("\n");
      return csvString;
    } else {
      // Handle the case when organisationId is not available
      console.error('Organisation ID is not available.');
      throw new Error("Organisation ID is not available");
    }
  } catch (error) {
    console.error("Error exporting Firestore data:", error);
    throw new Error("An error occurred");
  }
}


