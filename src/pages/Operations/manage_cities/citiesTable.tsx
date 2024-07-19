import { Tab } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Button, EditBtn } from "@/components/Buttons";
import SearchBar from "../../../components/Forms/input";
import { fbDb } from "@/firebase/configs";
import { DocumentData, doc, setDoc } from "firebase/firestore";

interface ClientsTableProps {
  clients: DocumentData[];
  filteredClients: DocumentData[];
  updateFetchedClients: (updatedClients: DocumentData[]) => void;
  handleEditClick: any;
  hasEditClientPermission: any;
  hasArchiveClientPermission: any;
}

export function CitiesTable({
  clients,
  updateFetchedClients,
  handleEditClick,
  hasEditClientPermission,
  hasArchiveClientPermission,
}: ClientsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const filteredClients = clients.filter((client) => {
    const fullName = `${client.name}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a.archive && !b.archive) {
      return 1; // a should come after b (archived vehicles come after non-archived)
    } else if (!a.archive && b.archive) {
      return -1; // a should come before b
    } else {
      return 0; // no change in order
    }
  });

  // const visibleClients = sortedClients.slice(startIndex, endIndex);
  const visibleClients = sortedClients.slice(startIndex, endIndex);
  // .filter((client) => !client.archive);
  const updateVehicleStatusInDatabase = async (
    clientId: string,
    newStatus: boolean
  ) => {
    try {
      const vehicleRef = doc(fbDb, "clients", clientId);
      await setDoc(vehicleRef, { archive: newStatus }, { merge: true });
      console.log("Vehicle status updated in the database:", clientId);

      const updatedVehicles = clients.map((client) =>
        client.id === clientId ? { ...client, archive: newStatus } : client
      );
      updateFetchedClients(updatedVehicles);
    } catch (error) {
      console.error("Error updating Vehicle status in database:", error);
    }
  };

  // const Headers = ["VEHICLE ID", "VEHICLE TYPE", "LICENSE PLATE"]

  return (
    <>
      <p className="text-base ml-10 font-bold">Clients</p>
      <div className="flex  text-base mt-2 ml-8 w-72 searchBarContainer">
        <SearchBar
          placeholder="Search For Clients"
          value={searchQuery}
          onChange={handleSearchChange}
          className="ml-5"
        />
      </div>

      <div className="ml-5 px-4 sm:px-6 lg:px-8">
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
                      CLIENT ID
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      NAME
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#FAFAFB]">
                  {visibleClients.map((clients, index) => {
                    // const clientId = `C${(index + 1)
                    //   .toString()
                    //   .padStart(3, "0")}`;
                    // console.log("Client ID", clientId);

                    return (
                      <Fragment key={index}>
                        <tr className="hover:bg-gray-100">
                          <td className="whitespace-nowrap font-nunito font-regular pt-1 pl-4 pr-3 text-d-blue text-base sm:pl-0">
                            {clients.clientId}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {clients.name}
                          </td>
                          {hasEditClientPermission &&
                            hasArchiveClientPermission && (
                              <td className="whitespace-nowrap px-2 py-2 relative flex flex-row">
                                <div onClick={() => handleEditClick(clients)}>
                                  <EditBtn />
                                </div>
                                <div>
                                  <button
                                    className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2 ml-4"
                                    onClick={() =>
                                      updateVehicleStatusInDatabase(
                                        clients.id,
                                        !clients.archive
                                      )
                                    }
                                  >
                                    {clients.archive ? "Unarchive" : "Archive"}
                                  </button>
                                </div>
                                <div className="h-10"></div>
                              </td>
                            )}
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
          disabled={endIndex >= filteredClients.length}
        >
          Next
        </button>
      </div>
    </>
  );
}
