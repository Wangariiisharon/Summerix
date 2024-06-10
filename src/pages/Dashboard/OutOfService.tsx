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
      centerText: {}, // Activate your custom plugin
    },
    animation: {
      animateRotate: true,
    },
  };

  const data = {
    datasets: [
      {
        data: [outOfService, all - outOfService],
        backgroundColor: ["#20C997", "#E9ECEF"],
        borderWidth: 0,
        cutout: "80%",
        radius: "80%", // Full radius
      },
    ],
  };

  ChartJS.register(ArcElement, Tooltip);

  const centerTextPlugin = {
    id: "centerText",
    afterDraw: (chart: any) => {
      const {
        ctx,
        chartArea: { top, bottom, left, right },
        data,
      } = chart;
      ctx.save();
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const totalVehicles = data.datasets[0].data.reduce(
        (a: any, b: any) => a + b,
        0
      );
      const text = `${totalVehicles}`;
      const textX = (left + right) / 2;
      const textY = (top + bottom) / 2;
      ctx.fillText(text, textX, textY - 10); // Adjust text position as needed
      ctx.font = "16px Arial text-lg";
      // ctx.fillText("Total Vehicles", textX, textY + 20);
      ctx.restore();
    },
  };

  ChartJS.register(centerTextPlugin);
  // return (
  //   <>
  //     <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow w-70 h-64">
  //       <h2 className="text-xs font-bold w-full flex justify-between items-center border-b border-[#E9ECEF] p-4">
  //         Out of service vehicles
  //         <button className="w-[90px] h-[34px] flex justify-center items-center text-xs gap-2.5 rounded border border-[#c0d7fa]">
  //           View All
  //           <ChevronDownIcon className="w-4 h-4" />
  //         </button>
  //       </h2>
  //       <div className="flex flex-grow items-center justify-center w-full">
  //         <Doughnut data={data} options={options} />
  //       </div>
  //       <div className="w-full flex flex-col items-center justify-center pb-4">
  //         <p className="text-3xl font-bold absolute">{all}</p>
  //         <p className="text-sm">Total Vehicles</p>
  //       </div>
  //       <div className="text-xs">Vehicles out of service {outOfService}</div>
  //     </div>
  //   </>
  // );
  return (
    <>
      <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow w-70 h-64">
        <h2 className="text-xs font-bold w-full flex justify-between items-center border-b border-[#E9ECEF] p-2">
          Out of service vehicles
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
          <p className="text-sm">Total Vehicles</p>
        </div>
      </div>
    </>
  );
}
