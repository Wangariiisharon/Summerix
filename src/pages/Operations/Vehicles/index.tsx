import { Fragment, useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import {
  DocumentData,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { format } from "date-fns";
import Maintenance from "./maintanance";
import { useRouter } from "next/router";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import Vehicles from "./manage_vehicles/Vehicles";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function VehiclesComponent() {
  const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);
  const [vehicleTrips, setVehicleTrips] = useState<Record<string, number>>({}); // To store the trip counts for each vehicle
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
    departmentData,
  } = useAuthContext();
  const headers = [
    { name: "Vehicle Profile", href: "#", current: selectedTabIndex === 0 },
    { name: "All Status", href: "#", current: selectedTabIndex === 1 },
    { name: "On Route ", href: "#", current: selectedTabIndex === 2 },
    { name: "Available ", href: "#", current: selectedTabIndex === 3 },
    { name: "Out of Service", href: "#", current: selectedTabIndex === 4 },
    { name: "Maintenance", href: "#", current: selectedTabIndex === 5 },
  ];

  useEffect(() => {
    const savedIndex = localStorage.getItem("selectedTabIndex");
    if (savedIndex !== null) {
      setSelectedIndex(parseInt(savedIndex, 10));
    }
    const fetchVehicles = async () => {
      try {
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
        }
      } catch (error) {
        console.error("Error fetching Vehicles:", error);
      }
    };

    const fetchTripsAndCount = async () => {
      try {
        const querySnapshot = await getDocs(collection(fbDb, "trips"));

        const tripsData: DocumentData[] = [];
        const updatedVehicleTrips: Record<string, number> = {};
        const recentTrips: Record<string, DocumentData> = {};

        querySnapshot.forEach((doc) => {
          const trip = doc.data();
          const vehicle = trip.vehicle;

          // Initialize the trip count for each vehicle
          if (!updatedVehicleTrips[vehicle]) {
            updatedVehicleTrips[vehicle] = 0;
          }

          // Increment the trip count for the vehicle
          updatedVehicleTrips[vehicle]++;

          // Check if the trip is the most recent for the vehicle
          if (
            !recentTrips[vehicle] ||
            trip.start_time > recentTrips[vehicle].start_time
          ) {
            recentTrips[vehicle] = trip;
          }
        });

        setVehicleTrips(updatedVehicleTrips);
      } catch (error) {
        console.error("Error fetching Trips:", error);
      }
    };

    fetchVehicles();
    fetchTripsAndCount();
  }, [organisationId]);

  const hasAllocatePermission =
    userClaims?.additionalPermissions?.includes("Allocate Vehicles") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Allocate Vehicles");

  const hasAddPermission =
    userClaims?.additionalPermissions?.includes("Add Vehicles") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Add Vehicles");
  const hasScheduleMaintenancePermission =
    userClaims?.additionalPermissions?.includes("Schedule Maintenance") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Schedule Maintenance");
  const hasEditVehiclesPermission =
    userClaims?.additionalPermissions?.includes("Edit Vehicles") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Edit Vehicles");
  const hasArchivePermission =
    userClaims?.additionalPermissions?.includes("Archive Vehicles") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Archive Vehicles");

  return (
    <div>
      <div className="bg-[#FAFAFB]">
        <div className="mt-6">
          <Tab.Group>
            <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start mt-3 mb-3 ml-1">
              {headers.filter(Boolean).map((tab: any, index: any) => (
                <Fragment key={index}>
                  <Tab
                    className={classNames(
                      "border-d-green outline-none text-sm font-nunito font-bold uppercase flex flex-row ml-10",
                      tab?.current
                        ? "ui-selected border-b-4 ui-selected:text-d-green"
                        : ""
                    )}
                    onClick={() => setSelectedTabIndex(index)}
                  >
                    {tab?.name}
                  </Tab>
                </Fragment>
              ))}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <div className="">
                  <Vehicles
                    hasAllocatePermission={hasAllocatePermission}
                    hasAddPermission={hasAddPermission}
                    hasEditVehiclesPermission={hasEditVehiclesPermission}
                    hasArchivePermission={hasArchivePermission}
                  />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="">
                  <DummyTable
                    selectedTab={selectedTabIndex}
                    vehicles={fetchedVehicles}
                    vehicleTrips={vehicleTrips}
                  />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="">
                  <DummyTable
                    selectedTab={selectedTabIndex}
                    vehicles={fetchedVehicles}
                    vehicleTrips={vehicleTrips}
                  />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="">
                  <DummyTable
                    selectedTab={selectedTabIndex}
                    vehicles={fetchedVehicles}
                    vehicleTrips={vehicleTrips}
                  />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="">
                  <DummyTable
                    selectedTab={selectedTabIndex}
                    vehicles={fetchedVehicles}
                    vehicleTrips={vehicleTrips}
                  />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="">
                  <Maintenance
                    hasScheduleMaintenancePermission={
                      hasScheduleMaintenancePermission
                    }
                  />
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
        <div></div>
      </div>
    </div>
  );
}

interface VehiclesTableProps {
  selectedTab: number;
  vehicles: DocumentData[];
  vehicleTrips: Record<string, number>;
}

const Headers = ["License Plate ", "Status", "Registration", "Trips Completed"];

export function DummyTable({
  selectedTab,
  vehicles,
  vehicleTrips,
}: VehiclesTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const router = useRouter();

  const filteredVehicles = vehicles.filter(
    (vehicles) =>
      selectedTab === 0 ||
      selectedTab === 1 ||
      (selectedTab === 2 && vehicles.availability_status === "On Route") ||
      (selectedTab === 3 && vehicles.availability_status === "Available") ||
      (selectedTab === 4 &&
        vehicles.availability_status === "Out Of Service") ||
      (selectedTab === 5 && vehicles)
  );
  const visibleVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handleVehicleClick = (vehicle: any) => {
    router.push(`Operations/Vehicles/vehiclesDetails?id=${vehicle.id}`);
  };

  return (
    <div className="px-4 ml-1 sm:px-6 lg:px-8">
      <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    License Plate
                  </th>

                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Registration Date
                  </th>

                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Trips Completed
                  </th>
                  <th
                    scope="col"
                    className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0"
                  >
                    <span className="sr-only"></span>
                  </th>
                </tr>
              </thead>

              <tbody className=" bg-[#FAFAFB]">
                {visibleVehicles.map((vehicle: any, index: any) => {
                  const { seconds } = vehicle?.registration_date;
                  const updatedDate = new Date(seconds * 1000);
                  const tripsCompleted =
                    vehicleTrips[vehicle.lisence_plate] || 0; // Get the trip count for the vehicle

                  return (
                    <Fragment key={index}>
                      <div className="w-full mb-2 font-nunito font-regular"></div>
                      <tr key={vehicle.id} className="hover:bg-gray-100">
                        <td
                          className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium  text-blue-700 sm:pl-0"
                          onClick={() => handleVehicleClick(vehicle)}
                        >
                          {vehicle.lisence_plate}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 relative">
                          {/*      className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"  */}

                          <div
                            className={`rounded-full inline-block text-sm h-8 absolute transform -translate-y-1/2 ${
                              vehicle?.availability_status === "Available"
                                ? "bg-[#E2E9FB] text-[#0068DD]"
                                : vehicle?.availability_status === "On Route"
                                ? "bg-[#B9F3EE] text-[#076960]"
                                : "bg-[#EAEAEA] text-[#364250]"
                            }`}
                            style={{
                              width: `${
                                (vehicle?.availability_status?.length || 0) * 7
                              }px`,
                              left: "-8px",
                            }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center">
                              {vehicle?.availability_status}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(updatedDate, "MM/dd/yy")}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-bold text-black">
                          {tripsCompleted} Trips
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        className="flex flex-row justify-center my-4 ui-selected:border-b-4  outline-none
          text-sm font-nunito font-bold uppercase bg-[#FAFAFB]"
      >
        <button
          className="ml-5"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Prev
        </button>
        <span className="ml-5">{currentPage + 1}</span>
        <button
          className="ml-5"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={endIndex >= filteredVehicles.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}
