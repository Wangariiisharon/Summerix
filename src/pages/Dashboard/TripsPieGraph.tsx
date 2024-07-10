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
  Timestamp,
  collection,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";
import { centerTextPlugin } from "../../centerTextPlugin";

ChartJS.register(centerTextPlugin);
ChartJS.register(ArcElement, Tooltip);

export default function TripsPieGraph({ selectedDate, selectedYear }: any) {
  const [fetchedTrips, setfetchedTrips] = useState<DocumentData[]>([]);
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
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            where("timestamp", "<=", Timestamp.fromDate(endDate))
          );
          const querySnapshot = await getDocs(q);

          const tripsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setfetchedTrips(tripsData);
        }
      } catch (error) {
        console.error("Error fetching Trips:", error);
      }
    };
    fetchTrips();
    fetchTrips();
  }, [organisationId, selectedDate, selectedYear]);

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

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="ml-[10px] mr-[px] mt-[21px] flex flex-row">
          <h2 className="text-sm font-bold leading-6">
            {" "}
            Trips completed this month{" "}
          </h2>
        </div>
        <div className="border-b border-gray-200 mt-2"></div>
        <div className=" flex items-center justify-center">
          <Doughnut data={data} options={options} />
        </div>
        <div className="flex flex-row ml-[20px] mt-[30.7px]">
          <p className="text-sm ml-[16px]">
            Number of trips completed this month
          </p>
        </div>
      </div>
    </>
  );
}
