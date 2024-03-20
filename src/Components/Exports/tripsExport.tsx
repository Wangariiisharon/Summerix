import firebaseApp, { fbDb } from "@/firebase/configs"; 
import fs from 'fs';
import fastcsv from 'fast-csv';
import { getDocs, collection, DocumentData } from "firebase/firestore";

export default async function exportDataToCSV() {
    try {
      const data: DocumentData[] = [];
      const snapshot = await getDocs(collection(fbDb, "trips"));
  
      snapshot.forEach((doc) => {
        data.push(doc.data());
      });
  
      if (data.length === 0) {
        return "No data found in Firestore";
      }

      const csvData = data.map((trip) => ({
        Drop_Off_Location: trip.drop_off_location,
        Pick_Up_Location: trip.pick_up_location, 
        Driver: trip.requested_by.name,
        Vehicle: trip.vehicle,
        Cargo_Type: trip.cargo_type,
        Cargo_Quantity: trip.cargo_quantity,
        Company: trip.company, 
        Trip_Status:trip.trip_status, 
        Client:trip.client,
        DealValue:trip.dealValue,
        Fuel:trip.fuel, 
        Mileage_Fee:trip.mileage_fee,
        Distance:trip.distance,
        Start_Time:trip.start_time,
        End_Time:trip.end_time

      }));
  
      // Create the CSV string
      const csvString = "Drop_Off_Location,Pick_Up_Location,Driver,Vehicle,Cargo_Type,Cargo_Quantity,Company,Trip_Status,Client,DealValue,Fuel,Mileage_Fee,Distance,Start_Time,End_Time\n" + csvData.map((item) => Object.values(item).join(",")).join("\n");
  
      return csvString;
    } catch (error) {
      console.error("Error exporting Firestore data:", error);
      throw new Error("An error occurred");
    }
  } 
