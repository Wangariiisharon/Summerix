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
import { centerTextPlugin } from "./centerTextPlugin";

ChartJS.register(ArcElement, Tooltip);
ChartJS.register(centerTextPlugin);

interface VehicleData {
  id: string;
  availability_status: string;
}
export default function TripsPieGraph() {
  const [fetchedVehicles, setFetchedVehicles] = useState<VehicleData[]>([]);
  const [allVehicles, setAllVehicles] = useState<VehicleData[]>([]);

  const { organisationId } = useAuthContext();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "vehicles"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);
          const vehiclesData: VehicleData[] = [];

          querySnapshot.forEach((doc) => {
            const vehicle = {
              id: doc.id,
              availability_status: doc.data().availability_status,

              ...doc.data(),
            };
            // Check if the vehicle's status is "Out Of Service"
            if (vehicle.availability_status === "Out Of Service") {
              vehiclesData.push(vehicle);
            }
          });

          setFetchedVehicles(vehiclesData);
        }
      } catch (error) {
        console.error("Error fetching Vehicles:", error);
      }
    };
    const fetchAllVehicles = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "vehicles"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);
          const vehiclesData: VehicleData[] = []; // Define the array with the correct type

          querySnapshot.forEach((doc) => {
            // Cast the document data to the VehicleData type
            const vehicle: VehicleData = {
              ...(doc.data() as VehicleData), // Use a type assertion here
            };
            vehiclesData.push(vehicle); // Push each vehicle onto the array
          });

          setAllVehicles(vehiclesData); // Update state with all fetched vehicles
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
    fetchAllVehicles();
  }, [organisationId]);
  const outOfService = fetchedVehicles.length;
  const all = allVehicles.length;
  const completedPercentage = all > 0 ? outOfService / all : 0;
  const percentage = completedPercentage * 100;

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

  const data = {
    datasets: [
      {
        data: [outOfService, all],
        backgroundColor: ["#20C997", "#E9ECEF"],
        borderWidth: 0,
        cutout: "80%",
        radius: "80%", // Full radius
      },
    ],
  };

  ChartJS.register(ArcElement, Tooltip);
  ChartJS.register(centerTextPlugin);

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="ml-[10px] mr-[px] mt-[21px] flex flex-row">
          <h2 className="text-sm font-bold leading-6">
            {" "}
            Out of service vehicles
          </h2>
          {/* <button className="ml-[20px] mr-2 border border-[#065ad8] rounded-md bg-white">
            <span className="text-[#065ad8] flex flex-row py-2 px-2  text-sm">
              Viev All
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </span>
          </button> */}
          <button className="ml-[30px] flex items-center justify-center px-1 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors">
            View All
          </button>
        </div>
        <div className="border-b border-gray-200 mt-2"></div>
        <div className=" flex items-center justify-center">
          <Doughnut data={data} options={options} />
        </div>
        <div className="flex flex-row ml-[20px] mt-[30.7px]">
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
          <p className="text-sm ml-[16px]"> Vehicles out of service</p>
          <p className="text-sm  ml-[35px] font-semibold">{outOfService}</p>
        </div>
      </div>
    </>
  );
}
