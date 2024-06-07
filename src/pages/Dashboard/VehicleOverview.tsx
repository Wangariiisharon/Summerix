import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ScriptableContext } from "chart.js";
import { AnyObject } from "chart.js/dist/types/basic";
import { useEffect, useState } from "react";
import {
  DocumentData,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { useAuthContext } from "@/components/Authentication/AuthProvider";

// ChartJS.register(ArcElement, Tooltip);

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

export default function VehicleOverview() {
  const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);
  const { organisationId } = useAuthContext();

  useEffect(() => {
    const fetchedVehicles = async () => {
      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(fbDb, "vehicles"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);

          const vehiclesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFetchedVehicles(vehiclesData);
        } else {
          // Handle the case when organisationId is not available
          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching Vehicles:", error);
      }
    };
    fetchedVehicles();
  }, [organisationId]);

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
        data: [availableCount, allVehicles],
        borderJoinStyle: "round",
        borderWidth: 0,
        borderRadius: 100,
        radius: 60,
      },
      {
        backgroundColor: ["#FFC107", "#F7F8FA"],
        data: [outOfServiceCount, fetchedVehicles.length - outOfServiceCount],
        borderJoinStyle: "round",
        borderWidth: 0,
        borderRadius: 100,
        radius: 50,
      },
      {
        backgroundColor: ["#C9E2FF", "#F7F8FA"],
        data: [onRouteCount, fetchedVehicles.length - onRouteCount],
        borderJoinStyle: "round",
        borderWidth: 0,
        borderRadius: 100,
        radius: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to fill the height of the parent container
    plugins: {
      legend: {
        display: false, // We will create a custom legend
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
    },
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow w-90 h-64 ml-4">
        {/* <div className="w-[600px] h-[300px] flex-none p-[21px_0_29px] rounded-md bg-white"> */}
        <div className=" ">
          <section aria-labelledby="applicant-information-title ">
            {/* <div className=" shadow sm:rounded-lg lg:min-h-[60]"> */}
            <div className="px-4 py-4 sm:px-6 flex w-full items-center justify-between">
              <h2
                id="applicant-information-title"
                className="text-sm font-bold leading-6"
              >
                Vehicle Overview
              </h2>
            </div>
            <div className=" border-gray-200 flex flex-row">
              <div className="">
                <Doughnut data={data} options={options} className="" />
              </div>
              <div className="">
                <div className="font-bold text-sm">Total</div>
                <div className="font-bold text-sm">{allVehicles}</div>
                <div className="mr-4">
                  <div className="flex items-center  w-full mt-4">
                    {/* <div className="h-4 w-4 rounded-md bg-d-blue mr-4"></div> */}
                    <span className="fa-stack fa-lg smaller-icon">
                      <i
                        className="fa fa-circle fa-stack-2x text-[#F2F2F2]"
                        aria-hidden="true"
                      ></i>
                      <i
                        className="fa fa-truck fa-stack-1x fa-inverse text-[#065ad8]"
                        aria-hidden="true"
                      ></i>
                    </span>
                    <div className="text-sm">Available</div>
                    <div className="pl-10 mr-2 text-sm">{availableCount}</div>
                  </div>
                  <div className="flex items-center  w-full mt-4">
                    {/* <div className="h-4 w-4 rounded-md bg-yellow mr-4"></div> */}
                    <span className="fa-stack fa-lg smaller-icon">
                      <i
                        className="fa fa-circle fa-stack-2x text-[#FFF6DB]"
                        aria-hidden="true"
                      ></i>
                      <i
                        className="fa fa-truck fa-stack-1x fa-inverse text-[#9F7801]"
                        aria-hidden="true"
                      ></i>
                    </span>
                    <div className="text-sm">
                      Under <br />
                      Maintenance
                    </div>
                    <div className="pl-4 mr-2 text-sm">{outOfServiceCount}</div>
                  </div>
                  <div className="flex items-center w-full mt-4">
                    {/* <div className="h-4 w-4 rounded-md bg-ll-blue mr-4 text-sm"></div> */}
                    <span className="fa-stack fa-lg smaller-icon">
                      <i
                        className="fa fa-circle fa-stack-2x text-[#ecf4ff]"
                        aria-hidden="true"
                      ></i>
                      <i
                        className="fa fa-truck fa-stack-1x fa-inverse text-[#065ad8]"
                        aria-hidden="true"
                      ></i>
                    </span>
                    <div className="text-sm">On Route</div>
                    <div className="pl-10 mr-2">{onRouteCount}</div>
                  </div>
                </div>
              </div>
            </div>
            {/* </div> */}
          </section>
        </div>
      </div>
    </>
  );
}
