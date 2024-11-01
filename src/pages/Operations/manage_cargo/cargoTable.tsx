import { Fragment, useState } from "react";
import { EditBtn } from "@/components/Buttons";
import SearchBar from "../../../components/Forms/input";
import { fbDb } from "@/firebase/configs";
import { DocumentData, doc, setDoc } from "firebase/firestore";
import { useAuthContext } from "@/components/Authentication/AuthProvider";

interface CargoTableProps {
  cargos?: DocumentData[];
  filteredCargos: DocumentData[];
  handleEditClick: any;
  updateFetchedCargos: (updatedCargos: DocumentData[]) => void;
  hasEditClassPermission: any;
  hasArchiveClassPermission: any;
}

export default function CargoTable({
  cargos = [],
  handleEditClick,
  updateFetchedCargos,
  hasEditClassPermission,
  hasArchiveClassPermission,
}: CargoTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
    departmentData,
  } = useAuthContext();

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    console.log("Search Query:", query);
    setSearchQuery(query);
  };

  const filteredClients = cargos.filter((cargo) => {
    const fullName = `${cargo.name}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const sortedCargos = [...filteredClients].sort((a, b) => {
    if (a.archive && !b.archive) {
      return 1; // a should come after b (archived vehicles come after non-archived)
    } else if (!a.archive && b.archive) {
      return -1; // a should come before b
    } else {
      return 0; // no change in order
    }
  });

  const visibleCargos = sortedCargos.slice(startIndex, endIndex);

  const updateCargoStatusInDatabase = async (
    cargoId: string,
    newStatus: boolean
  ) => {
    try {
      const cargoRef = doc(fbDb, "cargos", cargoId);
      await setDoc(
        cargoRef,
        { archive: newStatus, addedBy: currentUser?.email },
        { merge: true }
      );
      console.log("Cargo status updated in the database:", cargoId);

      const updatedCargos = cargos.map((cargo) =>
        cargo.id === cargoId ? { ...cargo, archive: newStatus } : cargo
      );
      updateFetchedCargos(updatedCargos);
    } catch (error) {
      console.error("Error updating Cargo status in database:", error);
    }
  };

  return (
    <>
      <p className="text-base ml-10 font-bold">Cargo</p>
      <div className="flex  text-base mt-2 ml-8 w-72 searchBarContainer">
        <SearchBar
          placeholder="Search For Cargo"
          value={searchQuery}
          onChange={handleSearchChange}
          className="ml-5"
        />
      </div>

      <div className="ml-2 px-4 sm:px-6 lg:px-8">
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
                      CARGO ID
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
                  {visibleCargos.map((cargos, index) => {
                    return (
                      <Fragment key={index}>
                        <tr className="hover:bg-gray-100">
                          <td className="whitespace-nowrap font-nunito font-regular pr-3 pt-1 pl-4 pr-3 text-d-blue text-base sm:pl-0">
                            {cargos.cargoId}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {cargos.name}
                          </td>
                          {hasEditClassPermission &&
                            hasArchiveClassPermission && (
                              <td className="whitespace-nowrap px-2 py-2 relative flex flex-row">
                                <div onClick={() => handleEditClick(cargos)}>
                                  <EditBtn />
                                </div>
                                <div>
                                  <button
                                    className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2 ml-4"
                                    onClick={() =>
                                      updateCargoStatusInDatabase(
                                        cargos.id,
                                        !cargos.archive
                                      )
                                    }
                                  >
                                    {cargos.archive ? "Unarchive" : "Archive"}
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
