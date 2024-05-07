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
        } else {
          console.error("Organisation ID is not available.");
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
        } else {
          console.error("Organisation ID is not available.");
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

  const data: dataset = {
    // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        backgroundColor: ["#20C997", "#F7F8FA"],
        data: [outOfService, all],
        borderJoinStyle: "round",
        borderWidth: 20,
        borderRadius: 100,
        borderAlign: "inner",
        spacing: 15,
        radius: 50,
      },
    ],
  };
  const options = {
    cutout: 130,
  };
  return (
    <>
      {/* <div className="rounded-lg w-1/4 bg-white shadow lg:min-w-[20] h-full max-h-[24]">  */}
      <div className="w-[445px] h-[378px] flex-none p-[14px_0_29px] rounded-md bg-white">
        <div className="sm:px-6 flex w-full items-center justify-between">
          <h2
            id="applicant-information-title"
            className="text-xl font-bold leading-6"
          >
            Out of service vehicles{" "}
          </h2>
          <div className="text-sm flex items-center">
            This Week
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center relative">
          <div className="font-extrabold text-3xl absolute pl-4">
            {all > 0 ? `${percentage}%` : "N/A"}
          </div>
          <Doughnut
            id="pp"
            data={data}
            options={options}
            className="!bg-white "
          />
          <div className="w-56 text-center text-lg absolute bottom-2">
            Number of trips Completed this Month
          </div>
        </div>
      </div>
    </>
  );
}
