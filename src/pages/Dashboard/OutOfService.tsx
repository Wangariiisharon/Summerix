import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Plugin } from "chart.js";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/Authentication/AuthProvider";

ChartJS.register(ArcElement, Tooltip);

interface VehicleData {
  id: string;
  availability_status: string;
}

export default function OutOfServiceVehicles({
  selectedDate,
  selectedYear,
}: any) {
  const [fetchedVehicles, setFetchedVehicles] = useState<VehicleData[]>([]);
  const [allVehicles, setAllVehicles] = useState<VehicleData[]>([]);

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
            where("availability_status", "==", "Out Of Service"),
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            where("timestamp", "<=", Timestamp.fromDate(endDate))
          );
          const querySnapshot = await getDocs(q);

          const vehiclesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            availability_status: doc.data().availability_status,
            ...doc.data(),
          }));
          setFetchedVehicles(vehiclesData);
        }
      } catch (error) {
        console.error("Error fetching Out of Service Vehicles:", error);
      }
    };

    const fetchAllVehicles = async () => {
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
            collection(fbDb, "vehicles"),
            where("organisationId", "==", organisationId),
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            where("timestamp", "<=", Timestamp.fromDate(endDate))
          );
          const querySnapshot = await getDocs(q);
          const vehiclesData: VehicleData[] = [];

          querySnapshot.forEach((doc) => {
            const vehicle: VehicleData = {
              id: doc.id,
              availability_status: doc.data().availability_status,
              ...doc.data(),
            };
            vehiclesData.push(vehicle);
          });

          setAllVehicles(vehiclesData);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
    fetchAllVehicles();
  }, [organisationId, selectedDate, selectedYear]);

  const outOfService = fetchedVehicles.length;
  const all = allVehicles.length;
  const completedPercentage = all > 0 ? outOfService / all : 0;
  const percentage = completedPercentage * 100;

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
      ctx.fillText(`${outOfService}`, left + width / 2, top + height / 2);
      ctx.restore();
    },
  };

  const outOfServiceVehiclesDataOptions = {
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

  const outOfServiceVehiclesData = {
    datasets: [
      {
        data: [outOfService, all - outOfService],
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
            Out of service vehicles
          </h2>
        </div>
        <div className="border-b border-gray-200 mt-2"></div>
        <div className="relative h-48">
          {" "}
          {/* Reduced height */}
          <Doughnut
            data={outOfServiceVehiclesData}
            options={outOfServiceVehiclesDataOptions}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold">{outOfService}</span>
          </div>
        </div>
        <div className="flex flex-row ml-[20px] mt-2">
          {" "}
          {/* Added margin-top */}
          <div className="bg-[#cddcff] rounded-md p-1">
            {" "}
            {/* Added padding */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 text-[#628FD8]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
          </div>
          <p className="text-sm ml-[16px]"> Vehicles out of service</p>
          <p className="text-sm  ml-[35px] font-semibold">{outOfService}</p>
        </div>
      </div>
    </>
  );
}
