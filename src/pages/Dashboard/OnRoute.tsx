import { CardIcon } from "@/components/images";
import {
  DocumentData,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { useState, useEffect } from "react";
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";

export default function OnRoute() {
  const [fetchedTrips, setFetchedTrips] = useState<DocumentData[]>([]);
  const { organisationId } = useAuthContext();

  // @ts-ignore

  useEffect(() => {
    const fetchTrips = async () => {
      if (organisationId) {
        const q = query(
          collection(fbDb, "trips"),
          where("organisationId", "==", organisationId)
        );
        const querySnapshot = await getDocs(q);
        const tripsData: DocumentData[] = [];

        const currentDate = new Date(); // Get the current date and time

        querySnapshot.forEach((doc) => {
          const trip = doc.data();

          // Parse the start_time and end_time from the trip data
          const startTime = new Date(trip?.start_time?.seconds * 1000);
          const endTime = new Date(trip?.end_time?.seconds * 1000); // Assuming end_time is also stored as Timestamp
          // return currentDate >= startTime;
          console.log(
            "currentDate: ",
            currentDate,
            "startTime: ",
            startTime,
            "endTime: ",
            endTime
          );

          // Check if the current date is between start_time and end_time
          if (currentDate >= startTime) {
            tripsData.push({
              id: doc.id,
              ...trip,
            });
          }
        });

        setFetchedTrips(tripsData);
      } else {
        console.log("Organisation ID is not avaiSlable for fetching trips.");
      }
    };

    try {
      fetchTrips();
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  }, [organisationId]);

  return (
    <div className=" h-[376px] w-full ml-[20px] mr-[20px] py-[20px] bg-white">
      <div className="flex justify-between items-center mb-6  h-[30px] px-[20px]">
        <h2 className="text-sm font-semibold">Vehicle Overview</h2>
        <button className="text-sm border border-blue-500 hover:bg-blue-200 text-blue-500 h-[30px] font-semibold px-4 mt-3 rounded">
          View All
        </button>
      </div>
      <div className="w-full overflow-auto table-container">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-sm text-gray-700 h-[24px] bg-gray-50 sticky top-0">
            <tr>
              <th className="py-3 px-6">Starting Route</th>
              <th className="py-3 px-6">Ending Route</th>
              <th className="py-3 px-6">License Plate</th>
              <th className="py-3 px-6">Trips Completed</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {fetchedTrips.map((trip, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-4 px-6">{trip.pick_up_location}</td>
                <td className="py-4 px-6">{trip.drop_off_location}</td>
                <td className="py-4 px-6">{trip.vehicle}</td>
                <td className="py-4 px-6">15</td>
                <td className="py-4 px-6">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {trip.trip_status}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// <>
//   {/* <div className="max-w-6xl mx-auto mt-5">  */}
//   <div className=" h-[376px] w-full ml-[20px] mr-[20px] py-[20px] rounded-md bg-white">
//     <div className="w-full h-[30px] px-[20px] flex justify-between px-[20px]">
//       <h2 className="text-sm font-bold flex">Vehicle Overview</h2>
//       <button className="text-sm font-bold ">View All</button>
//     </div>
//     <table className="w-full min-w-full table-auto border-collapse bg-white">
//       <thead>
//         <tr className="text-left w-full text-gray-700  bg-gray-50">
//           <th className="px-6 py-3 flex flex-row">
//             <img
//               src="img/vuesax-bulk-location-tick.png"
//               className="w-3.5 h-3.5 m-[2px_10px_2px_0] object-contain"
//             ></img>
//             Starting Route
//           </th>
//           <th className="px-6 py-3">Ending Route</th>
//           <th className="px-6 py-3">License Plate</th>
//           <th className="px-6 py-3">Trips Completed</th>
//           <th className="px-6 py-3">Status</th>
//         </tr>
//       </thead>
//       <tbody className="text-gray-700">
//         {fetchedTrips.map((trip, index) => (
//           <tr key={index} className="border-t border-gray-200">
//             <td className="px-6 py-4">{trip.pick_up_location}</td>
//             <td className="px-6 py-4">{trip.drop_off_location}</td>
//             <td className="px-6 py-4">{trip.vehicle}</td>
//             <td className="px-6 py-4">15</td>
//             <td className="px-6 py-4">
//               <span
//                 className={`inline-block px-3 py-1 text-sm font-semibold text-green-900 bg-green-200 rounded-full ${
//                   trip.status === "On Route"
//                     ? ""
//                     : "bg-red-200 text-red-900"
//                 }`}
//               >
//                 {trip.status}
//               </span>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// </>
