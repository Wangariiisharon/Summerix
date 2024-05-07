// import firebaseApp, { fbDb } from "@/firebase/configs";
// import fs from 'fs';
// import fastcsv from 'fast-csv';
// import { getDocs, collection, DocumentData } from "firebase/firestore";

// export default async function exportDataToCSV() {
//     try {
//       const data: DocumentData[] = [];
//       const snapshot = await getDocs(collection(fbDb, "trips"));

//       snapshot.forEach((doc) => {
//         data.push(doc.data());
//       });

//       if (data.length === 0) {
//         return "No data found in Firestore";
//       }

//       const csvData = data.map((trip) => ({
//         Drop_Off_Location: trip.drop_off_location,
//         Pick_Up_Location: trip.pick_up_location,
//         Driver: trip.requested_by.name,
//         Vehicle: trip.vehicle,
//         Cargo_Type: trip.cargo_type,
//         Cargo_Quantity: trip.cargo_quantity,
//         Company: trip.company,
//         Trip_Status:trip.trip_status,
//         Client:trip.client,
//         DealValue:trip.dealValue,
//         Fuel:trip.fuel,
//         Mileage_Fee:trip.mileage_fee,
//         Distance:trip.distance,
//         Start_Time:trip.start_time,
//         End_Time:trip.end_time

//       }));

//       // Create the CSV string
//       const csvString = "Drop_Off_Location,Pick_Up_Location,Driver,Vehicle,Cargo_Type,Cargo_Quantity,Company,Trip_Status,Client,DealValue,Fuel,Mileage_Fee,Distance,Start_Time,End_Time\n" + csvData.map((item) => Object.values(item).join(",")).join("\n");

//       return csvString;
//     } catch (error) {
//       console.error("Error exporting Firestore data:", error);
//       throw new Error("An error occurred");
//     }
//   }
import { fbDb } from "@/firebase/configs";
import { getDocs, collection, DocumentData } from "firebase/firestore";

function toDate(value: any): Date | null {
  if (value?.toDate) {
    return value.toDate();
  } else if (value instanceof Date) {
    return value;
  } else if (typeof value === "string") {
    let date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export async function exportDataToCSV(filterStatus?: string) {
  const tripsCollection = collection(fbDb, "trips");
  const snapshot = await getDocs(tripsCollection);
  let data: DocumentData[] = [];

  snapshot.forEach((doc) => {
    const docData = doc.data();
    data.push({
      ...docData,
      id: doc.id,
      tripId: docData.tripId,
      start_time: toDate(docData.start_time),
      end_time: toDate(docData.end_time),
    });
  });

  if (data.length === 0) {
    return "No data found in Firestore.";
  }

  if (filterStatus && filterStatus !== "all") {
    data = data.filter((trip) => {
      const startTime = toDate(trip.start_time);
      const endTime = toDate(trip.end_time);
      switch (filterStatus) {
        case "all":
          return true;
        case "onRoute":
          return trip.trip_status == "On Route";
        case "waiting":
          return (
            trip.trip_status == "At the border" ||
            trip.trip_status == "Offloading dest" ||
            trip.trip_status == "Mechanical" ||
            trip.trip_status == "Booked" ||
            trip.trip_status == "Returning the Container"
          );
        case "complete":
          return trip.trip_status == "Done";
        default:
          return false;
      }
    });

    if (data.length === 0) {
      return `No data found for the status: ${filterStatus}.`;
    }
  }

  const csvData = data.map((trip) => ({
    Trip_ID: trip.tripId,
    Drop_Off_Location: `"${trip.drop_off_location}"`,
    Pick_Up_Location: `"${trip.pick_up_location}"`,
    Driver: trip.requested_by?.name ? `"${trip.requested_by.name}"` : "",
    Vehicle: trip.vehicle,
    Cargo_Type: trip.cargo_type,
    Cargo_Quantity: trip.cargo_quantity,
    Company: `"${trip.company}"`,
    Trip_Status: trip.trip_status,
    Client: `"${trip.client}"`,
    DealValue: trip.dealValue,
    Fuel: trip.fuel,
    Mileage_Fee: trip.mileage_fee,
    Distance: trip.distance,
    Start_Time: trip.start_time ? trip.start_time.toISOString() : "",
    End_Time: trip.end_time ? trip.end_time.toISOString() : "",
  }));

  const header =
    "Trip_ID,Drop_Off_Location,Pick_Up_Location,Driver,Vehicle,Cargo_Type,Cargo_Quantity,Company,Trip_Status,Client,DealValue,Fuel,Mileage_Fee,Distance,Start_Time,End_Time";
  const csvString = [
    header,
    ...csvData.map((item) => Object.values(item).join(",")),
  ].join("\n");

  return csvString;
}

// cargo_quantity
// "0123456"
// (string)

// cargo_type
// "Fragile"
// (string)

// client
// "Farmers Choice"
// (string)

// company
// "KINA"
// (string)

// dealValue
// 70000
// (number)

// distance
// "832 km"
// (string)

// drop_off_location
// "Westlands, Nairobi, Kenya"
// (string)

// fuel
// 150
// (number)

// memo
// "Please see documents"
// (string)

// mileage_fee
// 30000
// (number)

// organisationId
// "34MnH362BHagGIE2shhC"
// (string)

// pick_up_location
// "Tanzania Immigration Head Office - Uhamiaji House, Liliondo St, Dar es Salaam, Tanzania"
// (string)

// requested_by
// (map)

// id
// "0jVmUzBi7JRyyYEzjH73"
// (string)

// name
// "Melvis Maina"
// (string)

// phonenumber
// "0789654321"
// (string)

// start_time
// May 6, 2024 at 12:00:00 AM UTC+3
// (timestamp)

// tripId
// "May 02 KFDW1"
// (string)

// trip_status
// "Booked"
// (string)

// vehicle
// "KFDW1"
