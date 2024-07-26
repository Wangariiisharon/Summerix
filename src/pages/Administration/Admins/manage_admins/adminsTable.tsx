import { useState } from "react";
import { fbDb } from "@/firebase/configs";
import { DocumentData, doc, setDoc, updateDoc } from "firebase/firestore";
import json2csv from "json2csv";
import toast from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import SearchBar from "@/components/Forms/input";
import { useRouter } from "next/router";
import { AnyPtrRecord } from "dns";
import { AnyObject } from "yup";

interface Admin {
  adminId: string;
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  department: any;
  status: boolean;
  archive: boolean;
  country: string;
  id?: string; // Make id optional
  phonenumber: string;
  additionalPermissions: string[];
  invitationSent: any;
  organisationId: any;
  super_admin: boolean;
  inviterUid: string | null;
}

interface AdminsTableProps {
  admins: Admin[];
  filteredAdmins: Admin[];
  updateFetchedAdmins: (updatedAdmins: Admin[]) => void;
  handleEditClick: any;
}

export default function AdminsTable({
  updateFetchedAdmins,
  handleEditClick,
  admins,
  filteredAdmins,
}: AdminsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState<Admin[]>([]);
  const router = useRouter();

  const handleCheckboxChange = (admin: Admin) => {
    const isAdminSelected = selectedAdmins.includes(admin);
    if (isAdminSelected) {
      setSelectedAdmins(
        selectedAdmins.filter((a) => a.userId !== admin.userId)
      );
    } else {
      setSelectedAdmins([...selectedAdmins, admin]);
    }
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedAdmins([]);
    } else {
      setSelectedAdmins(filteredAdmins);
    }
    setSelectAll(!selectAll);
  };

  const handleAdminClick = (admin: DocumentData) => {
    router.push(`Administration/Admins/manage_admins/viewAdmin?id=${admin.id}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const fetchedAdmins: Admin[] = (admins || []).filter(
    (admin: DocumentData): admin is Admin => {
      const fullName = `${admin.firstname} ${admin.lastname}`.toLowerCase();
      const nameMatch = fullName.includes(searchQuery.toLowerCase());
      // const isStatusTrue = admin.status === true || admin.status === "true";
      return nameMatch;
    }
  );

  const deleteSelectedUsers = () => {
    // Your delete handler logic here
  };

  const downloadSelectedFiles = () => {
    const fields = [
      { label: "ID", value: "adminId" },
      { label: "First Name", value: "firstname" },
      { label: "Last Name", value: "lastname" },
      { label: "Email", value: "email" },
      {
        label: "Role",
        value: (row: Admin) => row.role,
      },
      { label: "Department", value: "department" },
      {
        label: "Status",
        value: (row: Admin) => (row.status ? "Active" : "Inactive"),
      },
      {
        label: "Archive",
        value: (row: Admin) => (row.archive ? "Archived" : "Not Archived"),
      },
    ];
    const opts = { fields };
    const csv = json2csv.parse(selectedAdmins, opts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "selected_admins.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const updateVehicleStatusInDatabase = async (
  //   vehicleId: string,
  //   newStatus: boolean
  // ) => {
  //   try {
  //     if (!vehicleId) {
  //       throw new Error("Vehicle ID is undefined or null");
  //     }

  //     const vehicleRef = doc(fbDb, "admins", vehicleId);
  //     await setDoc(
  //       vehicleRef,
  //       { archive: newStatus, status: !newStatus },
  //       { merge: true }
  //     );
  //     toast.success("Admin archived successfully");

  //     const updatedVehicles = fetchedAdmins.map((admin) =>
  //       admin.userId.toString() === vehicleId
  //         ? { ...admin, archive: newStatus }
  //         : admin
  //     );
  //     updateFetchedAdmins(updatedVehicles);
  //   } catch (error) {
  //     console.error("Error updating Vehicle status in database:", error);
  //   }
  // };
  // const updateVehicleStatusInDatabase = async (
  //   adminsId: string,
  //   newStatus: boolean
  // ) => {
  //   try {
  //     const vehicleRef = doc(fbDb, "admins", adminsId);
  //     await setDoc(vehicleRef, { archive: newStatus }, { merge: true });

  //     const updatedVehicles = fetchedAdmins.map((admin) =>
  //       admin.userId === adminsId ? { ...admin, archive: newStatus } : admin
  //     );
  //     updateFetchedAdmins(updatedVehicles);
  //   } catch (error) {
  //     console.error("Error updating Department status in database:", error);
  //   }
  // };

  const toggleArchiveStatus = async (admin: Admin) => {
    try {
      const adminRef = doc(fbDb, "admins", admin.id as string);

      // Toggle the archive and status values
      const newArchiveStatus = !admin.archive;
      const newStatus = !newArchiveStatus; // if archive is true, status should be false and vice versa

      // Update the document
      await updateDoc(adminRef, {
        archive: newArchiveStatus,
        status: newStatus,
      });

      console.log(`Admin ${admin.adminId} updated successfully`);
      toast.success(
        `Admin ${admin.firstname} ${admin.lastname} updated successfully`
      );

      // Update the fetchedAdmins state
      const updatedAdmins = admins.map((a) =>
        a.adminId === admin.adminId
          ? { ...a, archive: newArchiveStatus, status: newStatus }
          : a
      );
      updateFetchedAdmins(updatedAdmins);
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("Error updating admin. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white">
      <div className="overflow-x-auto bg-gray-100 shadow-md rounded-lg">
        <div className="flex flex-row">
          <h2 className="font-semibold py-3 px-6 text-[#030229]">
            Manage Users
          </h2>
          <div className="ml-[470px] py-3 px-6">
            <SearchBar
              placeholder="Search User"
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-6"
            />
          </div>
        </div>
        <div className="overflow-y-auto flow-root max-h-96">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-6 text-left">
                  <input
                    type="checkbox"
                    className="mr-3"
                    onChange={handleSelectAllChange}
                  />
                  Name
                </th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Department</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {fetchedAdmins.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b"
                  onClick={() => handleAdminClick(admin)}
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-3"
                        checked={selectedAdmins.includes(admin)}
                        onChange={() => handleCheckboxChange(admin)}
                      />
                      <div>
                        <p className="font-semibold">
                          {admin.firstname} {admin.lastname}
                        </p>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        admin.role
                          ? "bg-[#065ad8] text-white"
                          : "bg-[#065ad8] text-white"
                      }`}
                    >
                      {admin.role ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="px-3 py-1 rounded-full text-sm bg-[#f7d4d6] text-[#c91010]">
                      {admin.department}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        admin.status
                          ? "bg-[#b9f9cf] text-[#11a849]"
                          : "bg-[#f4f4f4] text-[#030229]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full mr-2 ${
                          admin.status ? "bg-[#11a849]" : "bg-[#030229]"
                        }`}
                      ></span>
                      {admin.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-500 hover:text-blue-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEditClick(admin);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-600"
                        onClick={deleteSelectedUsers}
                      >
                        <FaTrash />
                      </button>

                      <button
                        className="bg-[#eae8fd] text-[#786cf1] h-8 w-18 py-1 px-2 ml-4"
                        onClick={(e) => {
                          e.stopPropagation();

                          toggleArchiveStatus(admin);
                        }}
                      >
                        {admin.archive ? "Unarchive" : "Archive"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Object.keys(selectedAdmins).filter(
            (key) => selectedAdmins[Number(key)]
          ).length > 0 && (
            <div className="flex justify-between items-center mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
              <div className="flex flex-row">
                <span>
                  {
                    Object.keys(selectedAdmins).filter(
                      (key) => selectedAdmins[Number(key)]
                    ).length
                  }{" "}
                  selected
                </span>
                <p
                  className="text-red-500  px-4 rounded mr-2 	text-decoration-line: underline"
                  onClick={deleteSelectedUsers}
                >
                  Delete
                </p>
              </div>
              <div>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                  onClick={downloadSelectedFiles}
                >
                  Download Files
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
