import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ScriptableContext,
} from "chart.js";
import { AnyObject } from "chart.js/dist/types/basic";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  DocumentData,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";

ChartJS.register(ArcElement, Tooltip);

export default function TripsPieGraph() {
  const [fetchedTrips, setfetchedTrips] = useState<DocumentData[]>([]);
  const { organisationId } = useAuthContext();

  // @ts-ignore
  useEffect(() => {
    const fetchedTrips = async () => {
      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(fbDb, "trips"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);
          const tripsData: DocumentData[] = [];
          console.log(tripsData);

          querySnapshot.forEach((doc) => {
            const trips = {
              id: doc.id,
              ...doc.data(),
            };
            tripsData.push(trips);
          });
          setfetchedTrips(tripsData);
        } else {
          // Handle the case when organisationId is not available
          console.error(
            "Organisation ID is not available for fetching Trips ."
          );
        }
      } catch (error) {
        console.error("Error fetching Trips:", error);
      }
    };

    fetchedTrips();
  }, [organisationId]);

  const currentDate = Date.now();
  const completedTripsCount = fetchedTrips.filter(
    (trip) => trip.start_time < currentDate && trip.end_time < currentDate
  ).length;

  const allTrips = completedTripsCount;
  const completedPercentage = allTrips > 0 ? completedTripsCount / allTrips : 0;
  const percentage = completedPercentage * 100;
  const passedTripsCount = fetchedTrips.filter(
    (trip) => trip.start_time < currentDate || trip.end_time < currentDate
  ).length;
  console.log("Passed trips count", passedTripsCount);

  interface dataset {
    datasets: {
      backgroundColor: string[];
      data: number[];
      borderJoinStyle:
        | "round"
        | "bevel"
        | "miter"
        | ((
            ctx: ScriptableContext<"doughnut">,
            options: AnyObject
          ) => CanvasLineJoin | undefined);
      borderWidth: number;
      borderRadius: number;
      borderAlign:
        | "inner"
        | "center"
        | ((
            ctx: ScriptableContext<"doughnut">,
            options: AnyObject
          ) => "inner" | "center" | undefined)
        | readonly ("inner" | "center" | undefined)[]
        | undefined;
      spacing: number;
      radius: number;
    }[];
  }

  //   const data: dataset = {
  //     // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  //     datasets: [
  //       {
  //         backgroundColor: ["#20C997", "#F7F8FA"],
  //         data: [passedTripsCount, allTrips],
  //         borderJoinStyle: "round",
  //         borderWidth: 20,
  //         borderRadius: 100,
  //         borderAlign: "inner",
  //         spacing: 15,
  //         radius: 50,
  //       },
  //     ],
  //   };
  //   const options = {
  //     cutout: 130,
  //   };
  const data = {
    datasets: [
      {
        data: [passedTripsCount, allTrips - passedTripsCount],
        backgroundColor: ["#20C997", "#F7F8FA"],
        borderWidth: 0,
        cutout: "80%",
        radius: "80%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    animation: {
      animateRotate: true,
    },
  };
  // return (
  //   <>
  //     <div className="relative flex flex-col items-center justify-center bg-white rounded-lg shadow w-70 h-64 mr-4">
  //       <h2 className="text-sm font-bold  mt-12 flex items-center justify-between w-full border-b border-[#E9ECEF]">
  //         Completd Trips{" "}
  //         <button className="text-blue-500 text-xs flex flex-row border border-blue-500 py-1 mt-1 rounded-mb">
  //           View All
  //           <ChevronDownIcon className="ml-1 w-4 h-4" />
  //         </button>
  //       </h2>
  //       <Doughnut data={data} options={options} className="mb-6" />
  //       <div className="absolute bottom-10">
  //         {/* <p className="text-3xl font-bold text-center mb-4">{allTrips}</p> */}
  //         {/* <p className="text-sm text-center">Total Vehicles</p> */}
  //       </div>
  //       <div className="absolute bottom-0 mb-4 text-xs">
  //         Vehicles out of service {allTrips}
  //       </div>
  //     </div>
  //     {/* </div> */}
  //   </>
  // );
  return (
    <>
      <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow w-70 h-64">
        <h2 className="text-xs font-bold w-full flex justify-between items-center border-b border-[#E9ECEF] p-2">
          Completd Trips
          <button className="w-[90px] h-[34px] flex justify-center items-center text-xs gap-2.5 rounded border border-[#c0d7fa]">
            View All
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </h2>
        <div className="w-full flex items-center justify-center h-full">
          <Doughnut data={data} options={options} />
        </div>
        <div className="w-full flex flex-col items-center justify-center pb-4">
          {/* <p className="text-3xl font-bold absolute">{all}</p> */}
          <p className="text-sm">Vehicles out of service {allTrips}</p>
        </div>
      </div>
    </>
  );
}
