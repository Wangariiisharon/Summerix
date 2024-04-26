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
import {
  getDocs,
  collection,
  query,
  where,
  DocumentData,
} from "firebase/firestore";

/**
 * Converts a value that may be a Firestore Timestamp, a Date object, or a string
 * into a JavaScript Date object.
 * @param value The value to convert.
 */
function toDate(value: any): Date | null {
  if (value?.toDate) {
    // Firestore Timestamp
    return value.toDate();
  } else if (value instanceof Date) {
    // JavaScript Date object
    return value;
  } else if (typeof value === "string") {
    // Date string
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } else {
    return null;
  }
}
/**
 * Exports trips data to CSV format, optionally filtered by trip status.
 * @param filterStatus Optional filter for trip status based on the selected tab.
 */
export async function exportDataToCSV(filterStatus?: string) {
  const tripsCollection = collection(fbDb, "trips");
  const now = new Date();
  let data: DocumentData[] = [];
  let filteredData: DocumentData[] = [];

  // Retrieve all trips from Firestore.
  const snapshot = await getDocs(tripsCollection);

  // Convert snapshot docs to data array.
  snapshot.forEach((doc) => {
    const docData = doc.data();
    data.push({
      ...docData,
      id: doc.id,
      start_time: toDate(docData.start_time),
      end_time: toDate(docData.end_time),
    });
  });

  if (data.length === 0) {
    return "No data found in Firestore.";
  }

  // Apply filtering based on the selected tab's status.
  filteredData =
    filterStatus === "all"
      ? data
      : data.filter((trip) => {
          const startTime = toDate(trip.start_time);
          const endTime = toDate(trip.end_time);

          if (!startTime || !endTime) {
            // If there's no valid start or end time, exclude the trip
            return false;
          }
          if (filterStatus === "onRoute") {
            return startTime <= now;
            // && now < endTime;
          } else if (filterStatus === "waiting") {
            return now > endTime;
          } else if (filterStatus === "complete") {
            return now > endTime;
          }
          // Add other cases here as needed
          return false;
        });

  if (filteredData.length === 0) {
    return `No data found for the status: ${filterStatus}.`;
  }

  // Map the filtered data to CSV format.
  const csvData = filteredData.map((trip) => ({
    Trip_ID: trip.id,
    Drop_Off_Location: trip.drop_off_location,
    Pick_Up_Location: trip.pick_up_location,
    Driver: trip.requested_by?.name,
    Vehicle: trip.vehicle,
    Cargo_Type: trip.cargo_type,
    Cargo_Quantity: trip.cargo_quantity,
    Company: trip.company,
    Trip_Status: trip.trip_status,
    Client: trip.client,
    DealValue: trip.dealValue,
    Fuel: trip.fuel,
    Mileage_Fee: trip.mileage_fee,
    Distance: trip.distance,
    Start_Time: trip.start_time ? trip.start_time.toISOString() : "",
    End_Time: trip.end_time ? trip.end_time.toISOString() : "",
  }));

  // Construct the CSV string.
  const header =
    "Trip_ID,Drop_Off_Location,Pick_Up_Location,Driver,Vehicle,Cargo_Type,Cargo_Quantity,Company,Trip_Status,Client,DealValue,Fuel,Mileage_Fee,Distance,Start_Time,End_Time";
  const csvString = [
    header,
    ...csvData.map((item) => Object.values(item).join(",")),
  ].join("\n");

  return csvString;
}
