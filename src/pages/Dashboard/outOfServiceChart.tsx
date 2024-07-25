import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ChartData,
  ChartOptions,
} from "chart.js";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { collection, getDocs, query, where } from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/Authentication/AuthProvider";

ChartJS.register(ArcElement, Tooltip);

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
  }, [organisationId]);

  const outOfService = fetchedVehicles.length;
  const all = allVehicles.length;
  const completedPercentage = all > 0 ? outOfService / all : 0;
  const percentage = completedPercentage * 100;

  const data: ChartData<"doughnut", number[], unknown> = {
    labels: ["Out Of Service", "In Service"],
    datasets: [
      {
        backgroundColor: ["#20C997", "#F7F8FA"],
        data: [outOfService, all - outOfService],
        borderWidth: 20,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "70%",
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw as number;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-[445px] h-[378px] flex-none p-[14px_0_29px] rounded-md bg-white">
      <div className="sm:px-6 flex w-full items-center justify-between">
        <h2
          id="applicant-information-title"
          className="text-xl font-bold leading-6"
        >
          Out of Service Vehicles
        </h2>
        <div className="text-sm flex items-center">
          This Week
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center relative">
        <div className="font-extrabold text-3xl absolute pl-4">
          {all > 0 ? `${percentage.toFixed(2)}%` : "N/A"}
        </div>
        <Doughnut id="pp" data={data} options={options} className="!bg-white" />
        <div className="w-56 text-center text-lg absolute bottom-2">
          Number of Vehicles Out of Service
        </div>
      </div>
    </div>
  );
}
