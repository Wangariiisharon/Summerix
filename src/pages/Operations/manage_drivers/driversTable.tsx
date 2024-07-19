import { Tab } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { AddButton, Button, EditBtn } from "@/components/Buttons";
import Table from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "@/components/Table/Cells";
import { TableBody } from "@/components/Table/Row";
import SearchBar from "@/components/Forms/input";
import { setDoc, DocumentData } from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router";
import { doc } from "firebase/firestore";

interface DriversTableProps {
  drivers: DocumentData[];
  updateFetchedDrivers: (updatedDrivers: DocumentData[]) => void;
  handleEditClick: any;
  hasEditDriverPermission: any;
  hasArchiveDriverPermission: any;
}

export default function DriversTable({
  drivers = [], // Default to an empty array
  updateFetchedDrivers,
  handleEditClick,
  hasEditDriverPermission,
  hasArchiveDriverPermission,
}: DriversTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const router = useRouter();

  const handleSearchChange = (e: any) => {
    setSearchQuery(e.target.value);
  };

  if (!drivers) {
    return <p>Loading...</p>;
  }

  // Filter and sort drivers
  const filteredDrivers = drivers.filter((driver) => {
    const fullName = `${driver.name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const sortedDrivers = [...filteredDrivers].sort((a, b) =>
    a.archive ? 1 : -1
  );
  const endIndex = (currentPage + 1) * rowsPerPage;
  const visibleDrivers = sortedDrivers.slice(
    currentPage * rowsPerPage,
    endIndex
  );

  // Update current page if necessary
  if (currentPage > 0 && visibleDrivers.length === 0) {
    setCurrentPage(currentPage - 1);
  }

  const updateDriverStatusInDatabase = async (
    driverId: string,
    newStatus: boolean
  ) => {
    try {
      const driverRef = doc(fbDb, "drivers", driverId);
      await setDoc(driverRef, { archive: newStatus }, { merge: true });

      const updatedDrivers = drivers.map((driver) =>
        driver.id === driverId ? { ...driver, archive: newStatus } : driver
      );
      updateFetchedDrivers(updatedDrivers);
    } catch (error) {
      console.error("Error updating Driver status in database:", error);
    }
  };

  const handleDriverClick = (driver: any) => {
    router.push(`Operations/manage_drivers/driversDetails?id=${driver.id}`);
  };

  return (
    <>
      <p className="text-base font-bold ml-10">Drivers</p>
      <div className="flex text-base mt-4 w-80 ml-10">
        <SearchBar
          placeholder="Search Driver"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className="px-4 ml-3 sm:px-6 lg:px-8">
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    {["DRIVER ID", "NAME", "MOBILE", "ADDRESS"].map(
                      (header, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-[#FAFAFB]">
                  {visibleDrivers.map((driver, index) => (
                    <Fragment key={index}>
                      <tr className="hover:bg-gray-100">
                        <td
                          className="whitespace-nowrap font-nunito font-regular pr-3 pt-1 pl-4 pr-3 text-d-blue text-base sm:pl-0"
                          onClick={() => handleDriverClick(driver)}
                        >
                          {driver.driversId}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {driver.name}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {driver.phonenumber}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 relative">
                          {driver.city}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 relative flex flex-row">
                          {hasEditDriverPermission && (
                            <div onClick={() => handleEditClick(driver)}>
                              <EditBtn />
                            </div>
                          )}
                          {hasArchiveDriverPermission && (
                            <button
                              className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2 ml-2"
                              onClick={() =>
                                updateDriverStatusInDatabase(
                                  driver.id,
                                  !driver.archive
                                )
                              }
                            >
                              {driver.archive ? "Unarchive" : "Archive"}
                            </button>
                          )}
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center my-4 ui-selected:border-b-4 outline-none text-sm font-nunito font-bold uppercase bg-[#FAFAFB]">
        <button
          className="ml-5"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          Prev
        </button>
        <span className="ml-5">{currentPage + 1}</span>
        <button
          className="ml-5"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={endIndex >= sortedDrivers.length}
        >
          Next
        </button>
      </div>
    </>
  );
}
