import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ScriptableContext,
} from "chart.js";
import { AnyObject } from "chart.js/dist/types/basic";
import { useEffect, useState } from "react";
import {
  DocumentData,
  Timestamp,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import { centerTextPlugin } from "../../centerTextPlugin";

ChartJS.unregister(centerTextPlugin);
ChartJS.register(ArcElement, Tooltip);

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
        ) => CanvasLineJoin | undefined)
      | undefined;
    borderWidth: number;
    borderRadius: number;
    radius: number;
  }[];
}

export default function VehicleOverview({ selectedDate, selectedYear }: any) {
  const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);
  const { organisationId } = useAuthContext();

  useEffect(() => {
    const fetchVehicles = async () => {
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
            collection(db, "vehicles"),
            where("organisationId", "==", organisationId),
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            where("timestamp", "<=", Timestamp.fromDate(endDate))
          );
          const querySnapshot = await getDocs(q);

          const vehiclesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFetchedVehicles(vehiclesData);
        }
      } catch (error) {
        console.error("Error fetching Vehicles:", error);
      }
    };
    fetchVehicles();
  }, [organisationId, selectedDate, selectedYear]);

  const allVehicles = fetchedVehicles.length;
  const onRouteCount = fetchedVehicles.filter(
    (vehicle) => vehicle.availability_status === "On Route"
  ).length;
  const outOfServiceCount = fetchedVehicles.filter(
    (vehicle) => vehicle.availability_status === "Out Of Service"
  ).length;
  const availableCount = fetchedVehicles.filter(
    (vehicle) => vehicle.availability_status === "Available"
  ).length;

  const data: dataset = {
    datasets: [
      {
        backgroundColor: ["#165DFF", "#F7F8FA"],
        data: [availableCount, allVehicles - availableCount],
        borderJoinStyle: "round",
        borderWidth: 0,
        borderRadius: 100,
        radius: 60,
      },
      {
        backgroundColor: ["#FFC107", "#F7F8FA"],
        data: [outOfServiceCount, allVehicles - outOfServiceCount],
        borderJoinStyle: "round",
        borderWidth: 0,
        borderRadius: 100,
        radius: 50,
      },
      {
        backgroundColor: ["#C9E2FF", "#F7F8FA"],
        data: [onRouteCount, allVehicles - onRouteCount],
        borderJoinStyle: "round",
        borderWidth: 0,
        borderRadius: 100,
        radius: 40,
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
      centerText: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="ml-[35px] mt-[21px]">
        <h2 className="text-sm font-bold leading-6">Trips Overview</h2>
      </div>
      <div className="border-b border-gray-200 mt-2"></div>
      <div className="flex flex-row mt-4 mb-[29px]">
        <div className="w-2/4 ">
          <Doughnut data={data} options={options} />
        </div>
        <div className="flex flex-col ml-[30px] mr-[30px]">
          <div className="font-bold text-lg">Total</div>
          <div className="font-bold text-4xl">{allVehicles}</div>
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <div className="flex justify-between w-full">
                <div className="bg-[#cddcff] rounded-md">
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
                </div>
                <div className="text-sm">Available</div>
                <div className="text-sm">{availableCount}</div>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <div className="flex justify-between w-full">
                <div className="bg-[#fff6db] rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="size-6 text-[#C5AA57]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                    />
                  </svg>
                </div>
                <div className="text-sm">Out Of Service</div>
                <div className="text-sm">{outOfServiceCount}</div>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <div className="flex justify-between w-full">
                <div className="bg-[#C9E2FF] rounded-md">
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
                </div>
                <div className="text-sm">On Route</div>
                <div className="text-sm">{onRouteCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
