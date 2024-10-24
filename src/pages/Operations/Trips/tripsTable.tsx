import { Fragment, SetStateAction, useEffect, useState } from "react";
import { fbDb } from "@/firebase/configs";
import {
  getDocs,
  collection,
  DocumentData,
  Timestamp,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getFirestore,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";

interface TripsTableProps {
  selectedTab: number;
  trips: DocumentData[];
  filteredTrips: DocumentData[];
  handleEditClick: any;
  hasViewTripermission: any;
  hasEditTripermission: any;
}

interface TripsPerVehicle {
  [key: string]: {
    count: number;
    lastMonth: string;
  };
}

export default function TripsTable({
  selectedTab,
  trips,
  filteredTrips = [],
  handleEditClick,
  hasViewTripermission,
  hasEditTripermission,
}: TripsTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const totalTrips = filteredTrips.length;
  const totalPages = Math.ceil(totalTrips / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const router = useRouter();

  const handleTripClick = (trip: any) => {
    router.push(`Operations/Trips/viewTrip?id=${trip.id}`);
  };

  const tripsPerVehicle: TripsPerVehicle = {};
  const currentDate = new Date();

  const filteredAllocation = filteredTrips.filter((trip) => {
    const startTime = new Date(trip?.start_time?.seconds * 1000);
    const endTime = new Date(trip?.end_time?.seconds * 1000);

    switch (selectedTab) {
      case 0: // First tab: Show all trips
        return true;
      case 1: // Second tab: Trips whose status is 'On Route'
        return trip.trip_status === "On Route";
      case 2: // Second last tab: Trips with specific statuses
        return ["Mechanical", "Booked"].includes(trip.trip_status);
      case 3: // Last tab: Show completed trips ('Done')
        return trip.trip_status === "Done";
      default:
        return false;
    }
  });

  console.log("Selected Tab", selectedTab);
  const visibleTrips = filteredAllocation.slice(startIndex, endIndex);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const pageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages = [0, 1, 2, 3, "...", totalPages - 1];
    }
    return pages;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Trip ID
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Pick Up
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Drop off
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Trip Identification
                  </th>
                  {hasEditTripermission && (
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                  )}
                  <th
                    scope="col"
                    className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0"
                  >
                    <span className="sr-only"></span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#FAFAFB]">
                {visibleTrips.map((trip, index) => (
                  <Fragment key={index}>
                    <div className="w-full mb-2 font-nunito font-regular"></div>
                    <tr
                      className="bg-[#FAFAFB] hover:bg-gray-100"
                      onClick={
                        hasViewTripermission
                          ? () => handleTripClick(trip)
                          : undefined
                      }
                      style={{
                        cursor: hasViewTripermission ? "pointer" : "default",
                      }}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-700 sm:pl-0">
                        {trip.trip_id}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 relative">
                        {trip.vehicle}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trip.pick_up_location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trip.drop_off_location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trip.tripId}
                      </td>
                      {hasEditTripermission && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button
                            className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(trip);
                            }}
                          >
                            {[
                              "Booked",
                              "On Route",
                              "Mechanical",
                              "Done",
                            ].includes(trip.trip_status)
                              ? trip.trip_status
                              : "Status"}
                          </button>
                        </td>
                      )}
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <button onClick={() => handlePageClick(0)} disabled={currentPage === 0}>
          {"<<"}
        </button>
        {pageNumbers().map((num, index) =>
          typeof num === "number" ? (
            <button key={index} onClick={() => handlePageClick(num)}>
              {num + 1}
            </button>
          ) : (
            <span key={index}>...</span>
          )
        )}
        <button
          onClick={() => handlePageClick(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}
