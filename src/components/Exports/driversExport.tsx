import firebaseApp, { fbDb } from "@/firebase/configs";
import {
  getDocs,
  collection,
  DocumentData,
  where,
  query,
} from "firebase/firestore";

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`; // Escape double quotes and wrap in double quotes
  }
  return value;
}

export default async function ExportDriverDataToCSV(
  organisationId: string | null
) {
  try {
    const driversCollection = collection(fbDb, "drivers");
    const q = query(
      driversCollection,
      where("organisationId", "==", organisationId)
    );
    const snapshot = await getDocs(q);

    const driversData = snapshot.docs.map((doc) => {
      const driver = doc.data();
      return {
        Drivers_ID: escapeCSV(driver.driversId || ""),
        Name: escapeCSV(driver.name || ""),
        Email: escapeCSV(driver.email_adress || ""),
        Phonenumber: escapeCSV(driver.phonenumber || ""),
        City: escapeCSV(driver.city || ""),
        Archive: driver.archive.toString(),
        GoodConduct: escapeCSV(driver.good_conduct || ""),
        IdentityCard: escapeCSV(driver.identity_card || ""),
        MedicalReport: escapeCSV(driver.medical_report || ""),
        Profile: escapeCSV(driver.profile || ""),
        RegistrationDate: driver.registration_date
          ? new Date(driver.registration_date.seconds * 1000).toISOString()
          : "",
      };
    });

    if (driversData.length === 0) {
      return "No data found in Firestore for the given organisationId";
    }

    const header =
      "Drivers_ID,Name,Email,Phonenumber,City,Archive,GoodConduct,IdentityCard,MedicalReport,Profile,RegistrationDate";
    const csvString = [
      header,
      ...driversData.map((driver) => Object.values(driver).join(",")),
    ].join("\n");

    return csvString;
  } catch (error) {
    console.error("Error exporting Firestore data:", error);
    throw new Error("An error occurred");
  }
}

// archive
// false
// (boolean)

// city
// "Juline"
// (string)

// driversId
// "D004"
// (string)

// email_adress
// "melvis@gmail.com"
// (string)

// good_conduct
// "https://firebasestorage.googleapis.com/v0/b/truck-it-bf0b2.appspot.com/o/good_conduct%2F_Truck%20Mate_%20Report_%20Evaluation%20and%20Recommendations%20(2).pdf?alt=media&token=24ab5d8d-8840-45a4-b770-a2e3e9155bbc"
// (string)

// identity_card
// "https://firebasestorage.googleapis.com/v0/b/truck-it-bf0b2.appspot.com/o/id_images%2F_Truck%20Mate_%20Report_%20Evaluation%20and%20Recommendations%20(2).pdf?alt=media&token=6abfcf03-e00c-46df-b83d-080fe9af2601"
// (string)

// medical_report
// "https://firebasestorage.googleapis.com/v0/b/truck-it-bf0b2.appspot.com/o/medical_report%2F_Truck%20Mate_%20Report_%20Evaluation%20and%20Recommendations%20(2).pdf?alt=media&token=bb9fed35-356d-422f-ab20-3bac056b0fdb"
// (string)

// name
// "Melvis Maina"
// (string)

// organisationId
// "34MnH362BHagGIE2shhC"
// (string)

// phonenumber
// "0789654321"
// (string)

// profile
// "https://firebasestorage.googleapis.com/v0/b/truck-it-bf0b2.appspot.com/o/profile_images%2Fexported-data%20(25).csv?alt=media&token=8399c449-adfb-454c-9a1f-6d83ddf395f6"
// (string)

// registration_date
// April 26, 2024 at 12:45:10 AM UTC+3
