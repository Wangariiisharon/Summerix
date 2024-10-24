import Vehicles from "./Vehicles";
import { Tab } from "@headlessui/react";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { AddButton, Button, EditBtn } from "@/components/Buttons";
import { doc, setDoc, DocumentData } from "firebase/firestore";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router";
import { useAuthContext } from "@/components/Authentication/AuthProvider";

interface VehiclesTableProps {
  selectedTab: number;
  vehicles?: DocumentData[];
  updateFetchedVehicles: (updatedDrivers: DocumentData[]) => void;
  handleEditClick: any;
  hasEditVehiclesPermission: any;
  hasArchivePermission: any;
}

VehiclesTable.defaultProps = {
  vehicles: [],
};

export default function VehiclesTable({
  vehicles = [],
  updateFetchedVehicles,
  handleEditClick,
  hasEditVehiclesPermission,
  hasArchivePermission,
}: VehiclesTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 3;
  const router = useRouter();
  const { currentUser } = useAuthContext();

  if (!vehicles || vehicles.length === 0) {
    return <div>No vehicles data available.</div>;
  }

  const activeVehicles = vehicles.filter((vehicle) => vehicle.status);

  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (a.archive && !b.archive) {
      return 1;
    } else if (!a.archive && b.archive) {
      return -1;
    } else {
      return 0;
    }
  });

  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const visibleVehicles = sortedVehicles.slice(startIndex, endIndex);
  const updateVehicleStatusInDatabase = async (
    vehicleId: string,
    newStatus: boolean
  ) => {
    try {
      const vehicleRef = doc(fbDb, "vehicles", vehicleId);
      await setDoc(
        vehicleRef,
        { archive: newStatus, addedBy: currentUser?.email },
        { merge: true }
      );
      console.log("Vehicle status updated in the database:", vehicleId);

      const updatedVehicles = vehicles.map((vehicle) =>
        vehicle.id === vehicleId ? { ...vehicle, archive: newStatus } : vehicle
      );
      updateFetchedVehicles(updatedVehicles);
    } catch (error) {
      console.error("Error updating Vehicle status in database:", error);
    }
  };

  const handleVehicleClick = (vehicle: any) => {
    router.push(`Operations/Vehicles/vehiclesDetails?id=${vehicle.id}`);
  };

  return (
    <div className="px-4 ml-2 sm:px-6 lg:px-8">
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    VEHICLE ID
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    VEHICLE TYPE
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    LICENSE PLATE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#FAFAFB]">
                {visibleVehicles.map((vehicle, index) => {
                  return (
                    <Fragment key={index}>
                      <tr className="hover:bg-gray-100">
                        <td
                          className="whitespace-nowrap font-nunito font-regular pr-3  pl-4 pr-3  text-d-blue text-base sm:pl-0"
                          onClick={() => handleVehicleClick(vehicle)}
                        >
                          {vehicle.vehiclesId}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {vehicle.vehicle_type}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 relative">
                          {vehicle.lisence_plate}
                        </td>

                        <td className="whitespace-nowrap px-2 py-2 relative flex flex-row">
                          {hasEditVehiclesPermission && (
                            <div onClick={() => handleEditClick(vehicle)}>
                              <EditBtn />
                            </div>
                          )}
                          {hasArchivePermission && (
                            <div>
                              <button
                                className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2 ml-4"
                                onClick={() =>
                                  updateVehicleStatusInDatabase(
                                    vehicle.id,
                                    !vehicle.archive
                                  )
                                }
                              >
                                {vehicle.archive ? "Unarchive" : "Archive"}
                              </button>
                            </div>
                          )}
                          <div className="h-10"></div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>

            <div className="flex flex-row justify-center my-4 ui-selected:border-b-4 outline-none text-sm font-nunito font-bold uppercase">
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
                disabled={endIndex >= sortedVehicles.length}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
