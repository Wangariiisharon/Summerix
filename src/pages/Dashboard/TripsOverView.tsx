import { fbDb } from "@/firebase/configs";
import { ChevronRightIcon, SignalIcon } from "@heroicons/react/20/solid";
import {
  getDocs,
  collection,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";

export default function TripsOverView() {
  const [fetchedTrips, setFetchedTrips] = useState<DocumentData[]>([]);
  const { organisationId } = useAuthContext();
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "trips"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);

          const tripsData: DocumentData[] = [];

          querySnapshot.forEach((doc) => {
            const trip = {
              id: doc.id,
              ...doc.data(),
            };
            tripsData.push(trip);
          });

          setFetchedTrips(tripsData);
        } else {
          console.log("Organisation ID is not available for fetching Trips .");
        }
      } catch (error) {
        console.error("Error fetching Trips:", error);
      }
    };

    fetchTrips();
  }, [organisationId]);
  const currentDate = new Date().toISOString();
  const liveTripsCount = fetchedTrips.filter(
    (trip) => currentDate >= trip.start_time && currentDate < trip.end_time
  ).length;

  const scheduledTripsCount = fetchedTrips.filter(
    (trip) => trip.start_time > new Date().toISOString()
  ).length;

  const completedTripsCount = fetchedTrips.filter(
    (trip) =>
      trip.start_time <= new Date().toISOString() &&
      trip.end_time <= new Date().toISOString()
  ).length;
  console.log("Live Trips Count", liveTripsCount);
  console.log("Scheduled Trips Count", scheduledTripsCount);
  console.log("Completed Trips Count", completedTripsCount);

  const trips = [
    {
      name: "Live Trips",
      title: liveTripsCount,
    },
    {
      name: "Scheduled",
      title: scheduledTripsCount,
      color: "light-yellow",
    },
    {
      name: "Completed",
      title: completedTripsCount,
    },
  ];

  return (
    <>
      <div className="rounded-lg w-1/3 h-24 bg-white shadowlg:min-w-1/3 h-full">
        <div className="px-4 pt-8 sm:px-6   ">
          <h2
            id="applicant-information-title"
            className="text-xl font-bold leading-6"
          >
            Trips
          </h2>
          <div className="text-sm mt-2">Trips Data</div>
        </div>
        <div className=" px-4 py-2 sm:px-6 flex flex-col items-center">
          <div className="w-full">
            <div className=" overflow-x-auto">
              <div className="inline-block min-w-full py-2 align-middle ">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white font-bold ">
                    {trips.map((trip, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap  pl-4 pr-3 sm:pl-0">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 flex items-center">
                              <SignalIcon className="h-6 w-6 text-d-blue" />
                            </div>
                            <div className="ml-4">
                              <div className="">{trip.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3  ">
                          <div className="text-gray-900">{trip.title}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <ChevronRightIcon className="h-6 w-6 font-extrabold" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
