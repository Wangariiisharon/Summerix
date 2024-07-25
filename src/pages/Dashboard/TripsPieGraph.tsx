import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Plugin,
  ChartTypeRegistry,
} from "chart.js";
import {
  DocumentData,
  Timestamp,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/Authentication/AuthProvider";

// Define a type for the custom plugin options
interface CenterTextPluginOptions {
  display: boolean;
  text: string;
}

ChartJS.register(ArcElement, Tooltip);

// Custom plugin to add text in the center of the doughnut chart

// Define the component
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

      const startDate = Timestamp.fromDate(startOfMonth);
      const endDate = Timestamp.fromDate(endOfMonth);

      try {
        if (organisationId) {
          const q = query(
            collection(db, "trips"),
            where("organisationId", "==", organisationId),
            where("timestamp", ">=", startDate),
            where("timestamp", "<=", endDate)
          );
          const querySnapshot = await getDocs(q);
          const tripsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Fetched trips:", tripsData); // Log fetched trips
          setfetchedTrips(tripsData);
        }
      } catch (error) {
        console.error("Error fetching Trips:", error);
      }
    };
    fetchTrips();
  }, [organisationId, selectedDate, selectedYear]);

  const currentDate = Date.now();

  const convertToMillis = (time: any) => {
    if (time instanceof Timestamp) {
      return time.toMillis();
    } else if (time instanceof Date) {
      return time.getTime();
    } else {
      // Assuming time is a string or another format, convert it to a Date object
      return new Date(time).getTime();
    }
  };

  const completedTrips = fetchedTrips.filter((trip) => {
    const startTime = convertToMillis(trip.start_time);
    const endTime = convertToMillis(trip.end_time);
    const isCompleted = trip.trip_status === "Done";

    console.log(
      `Trip ID: ${trip.id}, Status: ${trip.trip_status}, Start: ${new Date(
        startTime
      )}, End: ${new Date(endTime)}, Completed: ${isCompleted}`
    );
    return isCompleted;
  });

  const completedTripsCount = completedTrips.length;
  console.log("completedTripsCount:", completedTripsCount); // Log completed trips count

  const allTrips = fetchedTrips.length;
  console.log("allTrips:", allTrips); // Log all trips count

  const percentageCompleted =
    allTrips > 0 ? Math.round((completedTripsCount / allTrips) * 100) : 0;
  console.log("percentageCompleted:", percentageCompleted);

  const centerTextPlugin: Plugin = {
    id: "centerTextPlugin",
    beforeDraw: (chart) => {
      const {
        ctx,
        chartArea: { top, right, bottom, left, width, height },
      } = chart;
      ctx.save();
      ctx.font = "bolder 20px sans-serif";
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${completedTripsCount}`,
        left + width / 2,
        top + height / 2
      );
      ctx.restore();
    },
  };

  const completedTripsDataOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      centerTextPlugin: centerTextPlugin,
    },
    animation: {
      animateRotate: true,
    },
  };

  const completedTripsData = {
    datasets: [
      {
        data: [completedTripsCount, allTrips - completedTripsCount],
        backgroundColor: ["#20C997", "#E9ECEF"],
        borderWidth: 0,
        cutout: "80%",
        radius: "50%", // Full radius
      },
    ],
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="ml-[10px] mr-[10px] mt-[21px] flex flex-row">
          <h2 className="text-sm font-bold leading-6">
            Trips completed this month
          </h2>
        </div>
        <div className="border-b border-gray-200 mt-2"></div>
        <div className="relative h-48">
          {" "}
          {/* Reduced height */}
          <Doughnut
            data={completedTripsData}
            options={completedTripsDataOptions}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold">
              {completedTripsCount}
            </span>
          </div>
        </div>
        <div className="flex flex-row ml-[20px] mt-2">
          {" "}
          {/* Added margin-top */}
          <p className="text-sm ml-[16px]">
            Number of trips completed this month
          </p>
        </div>
      </div>
    </>
  );
}
