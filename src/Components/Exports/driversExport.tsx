import firebaseApp, { fbDb } from "@/firebase/configs"; 
import { getDocs, collection, DocumentData } from "firebase/firestore";

export default async function exportDriverDataToCSV() {
    try {
      const data: DocumentData[] = [];
      const snapshot = await getDocs(collection(fbDb, "drivers"));
  
      snapshot.forEach((doc) => {
        data.push(doc.data());
      });
  
      if (data.length === 0) {
        return "No data found in Firestore";
      }

      const csvData = data.map((driver) => ({
        Name: driver.name,
        PhoneNumber: driver.phonenumber, 
        Email: driver.email_adress,
        Country: driver.country,
        City: driver.city, 
      }));
      // Create the CSV string
      const csvString = "Name,PhoneNumber,Email,Country,City\n" + csvData.map((item) => Object.values(item).join(",")).join("\n");
      return csvString;
    } catch (error) {
      console.error("Error exporting Firestore data:", error);
      throw new Error("An error occurred");
    }
  }