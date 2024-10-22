import { Tab } from "@headlessui/react";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { AddButton, Button, EditBtn } from "@/components/Buttons";
import Table, { DummyTable } from "@/components/Table/Table";
import {
  CheckCircleIcon,
  PlusIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BodyCell, HeaderCell } from "../../../../components/Table/Cells";
import { TableBody } from "../../../../components/Table/Row";
import {
  DocumentData,
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import * as Yup from "yup";
import { fbDb } from "@/firebase/configs";
import { FormModal, NewFormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import { FaEdit, FaTrash } from "react-icons/fa";
import json2csv from "json2csv";
import { useRouter } from "next/router";
import SiteLayout from "@/Layout/SiteLayout";

// interface DepatmentDetailsProps {
//   id: string;
//   departmentId: string;
//   department: {
//     departmentId?: string;
//     name: string;
//     members: number;
//     permissions: string[];
//     update: Date;
//     archive: boolean;
//     status: boolean;
//   };
// }
interface Department {
  status: boolean;
  members: number;
  id: string;
  departmentId: string;
  name: string;
  updated: string | { seconds: number; nanoseconds: number };
  organisationId: string;
  archive: boolean;
  permissions: string[];
}
type PermissionObject = { name: string; checked: boolean };
type Permissions = { [key: string]: PermissionObject[] };

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

export default function ViewDepatment() {
  const [departments, setDepartments] = useState<Department | null>(null);
  const [fetchedDepartments, setFetchedDepartments] = useState<DocumentData[]>(
    []
  );
  const [fetchedPermissions, setFetchedPermissions] = useState<DocumentData[]>(
    []
  );
  const [departmentPermissions, setDepartmentPermissions] = useState<
    DocumentData[]
  >([]);
  const [adminCount, setAdminCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [allChecked, setAllChecked] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { organisationId } = useAuthContext();
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    departmentId: "",
    name: "",
    updated: "",
    archive: false,
    organisationId: "",
    permissions: [] as string[],
    status: true,
    members: 0,
    id: "",
  });

  const router = useRouter();
  const { id } = router.query;
  console.log("This is the ID", id);

  async function countAdminsInDepartment(
    departmentName: string
  ): Promise<number> {
    if (!departmentName) {
      throw new Error("Department name is required");
    }

    try {
      const adminsQuery = query(
        collection(fbDb, "admins"),
        where("department", "==", departmentName)
      );
      const querySnapshot = await getDocs(adminsQuery);

      return querySnapshot.size; // The number of matching documents
    } catch (error) {
      console.error("Error counting admins in department: ", error);
      throw new Error("Failed to count admins in the department");
    }
  }

  useEffect(() => {
    let unsubscribe = () => {};

    const fetchPermissions = async () => {
      const permissionsCollection = collection(fbDb, "permisions");
      const permissionsSnapshot = await getDocs(permissionsCollection);
      const permissionsData: Permissions = {};
      permissionsSnapshot.forEach((doc) => {
        const data = doc.data();
        Object.keys(data).forEach((key) => {
          permissionsData[key] = data[key].map((permission: string) => ({
            name: permission,
            checked: false,
          }));
        });
      });
      setPermissions(permissionsData);
      return permissionsData;
    };

    const updatePermissions = (
      permissionsData: Permissions,
      departmentPermissions: string[]
    ) => {
      const updatedPermissions = { ...permissionsData };
      Object.keys(updatedPermissions).forEach((section) => {
        updatedPermissions[section] = updatedPermissions[section].map(
          (permission) => ({
            ...permission,
            checked: departmentPermissions.includes(permission.name),
          })
        );
      });
      setPermissions(updatedPermissions);
    };

    const fetchDepartmentData = async (permissionsData: Permissions) => {
      if (id) {
        const departmentId = id as string;
        const departmentDocRef = doc(fbDb, "departments", departmentId);

        // Subscribe to changes using onSnapshot
        unsubscribe = onSnapshot(departmentDocRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const departmentData = docSnapshot.data() as Department;
            departmentData.departmentId = docSnapshot.id; // Ensure departmentId is set

            setDepartments(departmentData);
            updatePermissions(permissionsData, departmentData.permissions);

            // Fetch other departments with the same organisationId
            if (organisationId) {
              const departmentsQuery = query(
                collection(fbDb, "departments"),
                where("organisationId", "==", organisationId)
              );
              const querySnapshot = await getDocs(departmentsQuery);
              const departmentsList: DocumentData[] = [];
              querySnapshot.forEach((doc) => {
                departmentsList.push(doc.data());
              });
              setFetchedDepartments(departmentsList);
            }

            // Count admins in the same department
            if (departmentData.name) {
              try {
                const count = await countAdminsInDepartment(
                  departmentData.name
                );
                setAdminCount(count);
              } catch (error) {
                console.error(
                  "Failed to count admins in the department:",
                  error
                );
              }
            }
          }
        });
      }
    };

    fetchPermissions().then(fetchDepartmentData);

    // Clean up function to unsubscribe from snapshot listener
    return () => {
      unsubscribe();
    };
  }, [id, organisationId]);

  //
  const handleFullPermissionChange = () => {
    const newAllChecked = !allChecked;
    setAllChecked(newAllChecked);

    const updatedPermissions = { ...permissions };
    Object.keys(updatedPermissions).forEach((section) => {
      updatedPermissions[section] = updatedPermissions[section].map(
        (permission) => ({
          ...permission,
          checked: newAllChecked,
        })
      );
    });
    setPermissions(updatedPermissions);
  };

  const handleSectionSelectAllChange = (section: string) => {
    const updatedPermissions = { ...permissions };
    const allChecked =
      updatedPermissions[section]?.every((p) => p.checked) || false;
    updatedPermissions[section] = updatedPermissions[section].map(
      (permission) => ({
        ...permission,
        checked: !allChecked,
      })
    );
    setPermissions(updatedPermissions);
  };

  const handlePermissionChange = (section: string, permissionName: string) => {
    const updatedPermissions = { ...permissions };
    updatedPermissions[section] = updatedPermissions[section].map(
      (permission) =>
        permission.name === permissionName
          ? { ...permission, checked: !permission.checked }
          : permission
    );
    setPermissions(updatedPermissions);
  };

  const handleSaveChanges = async () => {
    const { id } = router.query;

    if (!id || Array.isArray(id)) {
      toast.error("Department ID is missing");
      return;
    }

    const selectedPermissions: string[] = [];
    Object.keys(permissions).forEach((section) => {
      permissions[section].forEach((permission: any) => {
        if (permission.checked) {
          selectedPermissions.push(permission.name);
        }
      });
    });

    const settingsRef = doc(fbDb, "departments", id as string);

    try {
      await setDoc(
        settingsRef,
        {
          permissions: selectedPermissions,
        },
        { merge: true }
      );

      console.log("Permissions successfully updated!");
      toast.success("Permissions successfully updated!");
    } catch (error) {
      console.error("Error updating Permissions: ", error);
      toast.error("Error updating Permissions");
    }
  };

  const handleEditClick = (department: Department) => {
    const updated =
      typeof department.updated === "object" && "seconds" in department.updated
        ? new Date(department.updated.seconds * 1000).toISOString()
        : department.updated;
    setEditFormInitialValues({
      departmentId: department.departmentId,
      name: department.name,
      organisationId: department.organisationId,
      archive: department.archive,
      updated: updated,
      permissions: department.permissions,
      status: true,
      members: 0,
      id: "",
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (values: {
    departmentId: any;
    name: any;
    organisationId: any;
    archive: any;
    updated: any;
    permissions: any;
    status: any;
    members: any;
    id: any;
  }) => {
    const { id } = router.query;
    try {
      if (!values.name) {
        console.error("Required form fields are missing");
        toast.error("please fill the Name field");
        return;
      }
      // Update the vehicle data in the database using the selectedVehicle.id
      const vehicleRef = doc(fbDb, "departments", id as string);
      await setDoc(vehicleRef, {
        departmentId: values.departmentId,
        name: values.name,
        organisationId: values.organisationId,
        archive: values.archive,
        updated: values.updated,
        permissions: values.permissions,
        status: values.status,
        members: values.members,
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedDepartments.map((department) =>
        department.id === id
          ? {
              ...department,
              departmentId: values.departmentId,
              name: values.name,
              organisationId: values.organisationId,
              archive: values.archive,
              updated: values.updated,
              permissions: values.permissions,
              status: values.status,
              members: values.members,
            }
          : department
      );

      setFetchedDepartments(updatedVehicles);

      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Vehicle:", error);
    }
  };

  return (
    <SiteLayout>
      <>
        <div className="flex flex-col justify-center items-start gap-2.5 mt-17.5 mb-13 py-2.5 pl-9 bg-white">
          <div className="flex-grow-0 flex justify-center items-center gap-2.5 py-2.5 px-4">
            <div className="flex-grow-0 font-custom text-custom-size flex justify-center font-semibold text-left text-custom-color">
              Administration
            </div>
          </div>
        </div>
        <div className="ml-[50px] flex flex-col mr-[77px]">
          <div className="mt-[27px]  font-custom text-custom-size font-semibold">
            <p>Department</p>
          </div>
          <div className="mt-[23px] bg-[#f7f8fa]  border border-[#dee8f8]">
            <div className="flex justify-start mt-[25px] ml-[32px] mb-[25px]">
              <div className="ml-[18px] bg-white ">
                <div className="flex flex-col p-[20px]">
                  <div className="flex flex-row">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 text-[#065AD8]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>

                    <p className="text-[#6b6b73] text-sm ml-[10px]">
                      Department
                    </p>
                  </div>
                  <p className="mt-[5px] text-[#] text-sm font-semibold ml-[34px]">
                    {departments?.name}
                  </p>
                </div>
              </div>

              <div className="ml-[18px] bg-white ">
                <div className="flex flex-col  p-[20px]">
                  <div className="flex flex-row">
                    {/* <i className="fa fa-user-circle-o text-[#065AD8]"></i>  */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6 text-[#065AD8]"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                      />
                    </svg>

                    <p className="text-[#6b6b73] text-sm ml-[10px]">Members</p>
                  </div>
                  <p className="mt-[5px] text-[#] text-sm font-semibold ml-[34px]">
                    {adminCount}
                  </p>
                </div>
              </div>
              <div className="ml-[18px] bg-white ">
                <div className="flex flex-col p-[20px]">
                  <div className="flex flex-row">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6 text-[#065AD8]"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
                      />
                    </svg>

                    <p className="text-[#6b6b73] text-sm ml-[10px]">Status</p>
                  </div>
                  <p className="mt-[5px] text-[#000000] text-sm font-semibold ml-[34px]">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        departments?.status
                          ? "bg-[#b9f9cf] text-[#11a849]"
                          : "bg-[#f4f4f4] text-[#030229]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full mr-2 ${
                          departments?.status ? "bg-[#11a849]" : "bg-[#065ad8]"
                        }`}
                      ></span>
                      {departments?.status ? "Active" : "Offline"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="ml-[100px]">
                <div className="flex space-x-4 p-[20px]">
                  <button className="bg-teal-400 hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded flex items-center">
                    <svg
                      className="h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Set Permission
                  </button>

                  <button
                    className="bg-white border border-teal-400 text-teal-400 hover:bg-teal-50 font-semibold py-2 px-4 rounded flex items-center"
                    onClick={() => departments && handleEditClick(departments)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="h-4 w-4 mr-2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-y border-gray-200 mt-[43px]"></div>

          {/* Permissions section */}
          <div className="p-6 bg-white shadow-md rounded-lg mt-[43px]">
            <div className="mt-[45px]  font-custom text-custom-size font-semibold flex flex-row">
              <p>Permissions</p>
              <label className="flex items-center ml-2">
                <input
                  type="checkbox"
                  className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                  checked={allChecked}
                  onChange={handleFullPermissionChange}
                />
                <span className="ml-2 text-gray-700">Full Permission</span>
              </label>
            </div>

            <div className="mt-[23px] bg-[#f7f8fa]  border border-[#dee8f8]">
              <div className="flex justify-start mt-[25px] ml-[32px] mb-[25px] ">
                <div className="ml-[18px] ">
                  <div className="flex flex-col p-[20px]">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="flex flex-col w-full mb-4 ">
                          <h2 className="text-lg font-semibold mt-4 text-sm">
                            Dashboard
                          </h2>
                          <label className="flex items-center mt-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              // checked={allChecked}
                              checked={
                                permissions["Dashboard"]?.every(
                                  (p) => p.checked
                                ) || false
                              }
                              onChange={() =>
                                handleSectionSelectAllChange("Dashboard")
                              }
                            />
                            <span className="ml-2 text-gray-700">
                              Select All
                            </span>
                          </label>
                        </div>

                        {permissions["Dashboard"]?.map((permission) => (
                          <label
                            key={permission.name}
                            className="flex items-center mt-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={permission.checked}
                              onChange={() =>
                                handlePermissionChange(
                                  "Dashboard",
                                  permission.name
                                )
                              }
                            />
                            <span className="ml-2 text-gray-700">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div>
                        <div className="flex flex-col w-ful mb-4">
                          <h2 className="text-sm font-semibold mt-4">
                            Vehicles
                          </h2>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={
                                permissions["Vehicles"]?.every(
                                  (p) => p.checked
                                ) || false
                              }
                              onChange={() =>
                                handleSectionSelectAllChange("Vehicles")
                              }
                            />
                            <span className="ml-2 text-sm text-gray-700 mt-2">
                              Select All
                            </span>
                          </label>
                        </div>
                        {permissions["Vehicles"]?.map((permission) => (
                          <label
                            key={permission.name}
                            className="flex items-center mt-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={permission.checked}
                              onChange={() =>
                                handlePermissionChange(
                                  "Vehicles",
                                  permission.name
                                )
                              }
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div>
                        <div className="flex flex-col mb-4">
                          <h2 className="text-lg font-semibold mt-4 text-sm">
                            Drivers
                          </h2>
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={
                                permissions["Drivers"]?.every(
                                  (p) => p.checked
                                ) || false
                              }
                              onChange={() =>
                                handleSectionSelectAllChange("Drivers")
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm mt-2">
                              Select All
                            </span>
                          </label>
                        </div>

                        {permissions["Drivers"]?.map((permission) => (
                          <label
                            key={permission.name}
                            className="flex items-center mt-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={permission.checked}
                              onChange={() =>
                                handlePermissionChange(
                                  "Drivers",
                                  permission.name
                                )
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div>
                        <div className="flex flex-col mb-4">
                          <h2 className="text-lg font-semibold mt-4 text-sm">
                            Trips
                          </h2>
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={
                                permissions["Trips"]?.every((p) => p.checked) ||
                                false
                              }
                              onChange={() =>
                                handleSectionSelectAllChange("Trips")
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm mt-2">
                              Select All
                            </span>
                          </label>
                        </div>

                        {permissions["Trips"]?.map((permission) => (
                          <label
                            key={permission.name}
                            className="flex items-center mt-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={permission.checked}
                              onChange={() =>
                                handlePermissionChange("Trips", permission.name)
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div className="mt-6">
                        <div className="flex flex-col mb-4">
                          <h2 className="text-lg font-semibold mt-4 text-sm">
                            Client
                          </h2>
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={
                                permissions["Client"]?.every(
                                  (p) => p.checked
                                ) || false
                              }
                              onChange={() =>
                                handleSectionSelectAllChange("Client")
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm mt-2">
                              Select All
                            </span>
                          </label>
                        </div>
                        {permissions["Client"]?.map((permission) => (
                          <label
                            key={permission.name}
                            className="flex items-center mt-2 text-sm  rounded"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={permission.checked}
                              onChange={() =>
                                handlePermissionChange(
                                  "Client",
                                  permission.name
                                )
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div className="mt-6">
                        <div className="flex flex-col mb-4">
                          <h2 className="text-lg font-semibold mt-4 text-sm">
                            Class
                          </h2>
                          <label className="flex items-center text-sm ">
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={
                                permissions["Class"]?.every((p) => p.checked) ||
                                false
                              }
                              onChange={() =>
                                handleSectionSelectAllChange("Class")
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm mt-2">
                              Select All
                            </span>
                          </label>
                        </div>
                        {permissions["Class"]?.map((permission) => (
                          <label
                            key={permission.name}
                            className="flex items-center mt-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={permission.checked}
                              onChange={() =>
                                handlePermissionChange("Class", permission.name)
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div className="mt-6">
                        <div className="flex flex-col mb-4">
                          <h2 className="text-sm font-semibold mt-4">
                            Suppliers
                          </h2>
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={
                                permissions["Suppliers"]?.every(
                                  (p) => p.checked
                                ) || false
                              }
                              onChange={() =>
                                handleSectionSelectAllChange("Suppliers")
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm mt-2">
                              Select All
                            </span>
                          </label>
                        </div>
                        {permissions["Suppliers"]?.map((permission) => (
                          <label
                            key={permission.name}
                            className="flex items-center mt-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={permission.checked}
                              onChange={() =>
                                handlePermissionChange(
                                  "Suppliers",
                                  permission.name
                                )
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div className="mt-6">
                        <div className="flex flex-col mb-4">
                          <h2 className="text-lg font-semibold mt-4 text-sm">
                            Report
                          </h2>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={
                                permissions["Report"]?.every(
                                  (p) => p.checked
                                ) || false
                              }
                              onChange={() =>
                                handleSectionSelectAllChange("Report")
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm mt-2">
                              Select All
                            </span>
                          </label>
                        </div>
                        {permissions["Report"]?.map((permission) => (
                          <label
                            key={permission.name}
                            className="flex items-center mt-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={permission.checked}
                              onChange={() =>
                                handlePermissionChange(
                                  "Report",
                                  permission.name
                                )
                              }
                            />
                            <span className="ml-2 text-gray-700 text-sm">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveChanges}
                        className="flex justify-end mt-[30px] bg-[#4fd1c5] rounded-md text-sm"
                      >
                        <span className="text-white py-[12px]  px-[12px]">
                          Save Changes
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {editModalOpen && (
          <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
            <div>
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">
                  Edit Department Details
                </div>
                <Button
                  className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                  handleClick={handleEditModalClose}
                >
                  <XMarkIcon className="h-6 w-6 text-red-400" />
                </Button>
              </div>

              <Formik
                initialValues={editFormInitialValues}
                validationSchema={validationSchema}
                onSubmit={handleEditSubmit}
              >
                {({ values, errors, touched, isSubmitting }) => (
                  <Form>
                    <div className="">
                      <div className="flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">NAME</label>
                          <Field
                            type="text"
                            name="name"
                            value={values.name}
                            className="form-input mt-1 block w-96 bg-gray-100"
                          />
                        </label>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-400 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => setEditModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-[#4FD1C5] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                          disabled={isSubmitting} // Disable button while submitting
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </FormModal>
        )}
      </>
    </SiteLayout>
  );
}
