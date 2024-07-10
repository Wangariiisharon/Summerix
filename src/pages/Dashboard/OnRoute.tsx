// In the OnRoute component
import {
  DocumentData,
  collection,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/Authentication/AuthProvider";

export default function OnRoute({ selectedDate, selectedYear }: any) {
  const [fetchedTrips, setFetchedTrips] = useState<DocumentData[]>([]);
  const { organisationId } = useAuthContext();

  useEffect(() => {
    const fetchTrips = async () => {
      const db = getFirestore();

      const startOfMonth = selectedDate
        ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        : new Date(selectedYear, new Date().getMonth(), 1);

      const endOfMonth = selectedDate
        ? new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            0,
            23,
            59,
            59
          )
        : new Date(selectedYear, new Date().getMonth() + 1, 0, 23, 59, 59);

      const startOfYear = new Date(
        selectedDate ? selectedDate.getFullYear() : selectedYear,
        0,
        1
      );
      const endOfYear = new Date(
        selectedDate ? selectedDate.getFullYear() : selectedYear,
        11,
        31,
        23,
        59,
        59
      );

      const startDate = selectedDate ? startOfMonth : startOfYear;
      const endDate = selectedDate ? endOfMonth : endOfYear;

      try {
        if (organisationId) {
          const q = query(
            collection(db, "trips"),
            where("organisationId", "==", organisationId),
            where("trip_status", "==", "On Route"),
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            where("timestamp", "<=", Timestamp.fromDate(endDate)),
            orderBy("start_time", "asc") // Adjust 'asc' to 'desc' if you need descending order
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tripsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setFetchedTrips(tripsData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Trips:", error);
      }
    };

    fetchTrips();
  }, [organisationId, selectedDate, selectedYear]);

  return (
    <div className=" h-[376px] w-full ml-[20px] mr-[20px] py-[20px] bg-white">
      <div className="flex justify-between items-center mb-6  h-[30px] px-[20px]">
        <h2 className="text-sm font-semibold">Trips Overview</h2>
        {/* <button className="text-sm border border-blue-500 hover:bg-blue-200 text-blue-500 h-[30px] font-semibold px-4 mt-3 rounded">
          View All
        </button> */}
      </div>
      <div className="w-full overflow-auto table-container">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-sm text-gray-700 h-[24px] bg-gray-50 sticky top-0">
            <tr>
              <th className="py-3 px-6"></th>
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
                <td className="py-4 px-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="size-6 text-[#628FD8]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                    />
                  </svg>
                </td>
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
