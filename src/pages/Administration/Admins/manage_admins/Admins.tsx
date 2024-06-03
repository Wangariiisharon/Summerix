import firebase from "firebase/app";
import "firebase/firestore";
import { Tab } from "@headlessui/react";
import { AddButton, Button } from "@/components/Buttons";
import { SetStateAction, useEffect, useState } from "react";
import SearchBar from "../../../../components/Forms/input";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import router, { useRouter } from "next/router";
import { FormModal, NewFormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import firebaseApp, { fbDb } from "@/firebase/configs";
import AddAdmin from "./AddAdmin";
import {
  User,
  createUserWithEmailAndPassword,
  getAuth,
  sendSignInLinkToEmail,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  getDocs,
  where,
  DocumentData,
  getDoc,
  onSnapshot,
  DocumentReference,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import axios from "axios";
import "firebase/firestore";
import * as Yup from "yup";
import { FaEdit, FaTrash, FaArchive } from "react-icons/fa";
import json2csv from "json2csv"; // Ensure this import matches your library setup

interface DepartmentData {
  name: string;
}
// interface AdminData {
//   id: string;
//   firstname: string;
//   lastname: string;
//   email: string;
//   department: DocumentReference<DocumentData> | string;
//   status: boolean;
//   super_admin: boolean;
//   archive: boolean;
// }
interface Admin {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  super_admin: boolean;
  department: any;
  status: boolean;
  archive: boolean;
}
interface Country {
  cca3: string;
  name: {
    common: string;
  };
}

export default function Admins() {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [fetchedAdmins, setFetchedAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<DocumentData | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  const [editFormInitialValues, setEditFormInitialValues] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    super_admin: false,
    status: true,
    additionalPermissions: [],
    department: "",
    adminId: "",
    invitationSent: false,
    organisationId: "",
    userId: "",
    archive: false,
  });
  const [departments, setDepartments] = useState<DocumentData[]>([]);
  let { currentUser, organisationId, isSuperAdmin } = useAuthContext();

  const [departmentReference, setDepartmentReference] =
    useState<DocumentReference<DocumentData> | null>(null);

  const EditvalidationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    email: Yup.string().required("Email details are required"),
    phonenumber: Yup.string().required("Phone number address is required"),
    department: Yup.string().required("Department is required"),
  });

  const handleAddAdmin = () => {
    setOpen(true);
  };
  const handleExport = () => {};
  const handleReset = () => {
    setOpen(false);
  };
  const updateFetchedVehicles = (updatedAdmins: SetStateAction<Admin[]>) => {
    setFetchedAdmins(updatedAdmins);
  };
  useEffect(() => {
    const fetchedAdmins = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "admins"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const adminsData = await Promise.all(
              querySnapshot.docs.map(async (doc) => {
                const adminData = doc.data() as Admin;
                let departmentName = "Unknown Department";

                if (adminData.department instanceof DocumentReference) {
                  const deptDoc = await getDoc(adminData.department);
                  if (deptDoc.exists()) {
                    const deptData = deptDoc.data() as DepartmentData;
                    departmentName = deptData.name;
                  }
                } else {
                  departmentName = adminData.department;
                }

                return {
                  ...adminData,
                  department: departmentName,
                };
              })
            );
            setFetchedAdmins(adminsData);
          });

          return () => unsubscribe();
        } else {
          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching Admins:", error);
      }
    };

    fetchedAdmins();
  }, [organisationId]);

  const updateFetchedAdmins = (updatedAdmins: SetStateAction<Admin[]>) => {
    setFetchedAdmins(updatedAdmins);
  };

  const handleEditClick = (admin: DocumentData) => {
    setSelectedAdmin(admin);
    console.log("Edit clicked for:", admin.firstname); // Check if this logs when clicked
    setEditFormInitialValues({
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      phonenumber: admin.phonenumber,
      super_admin: admin.super_admin,
      status: admin.status,
      additionalPermissions: admin.additionalPermissions || [], // Ensure default value
      department: admin.department,
      adminId: admin.adminId,
      invitationSent: admin.invitationSent,
      organisationId: admin.organisationId,
      userId: admin.userId,
      archive: admin.archive,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedAdmin(null);
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (values: {
    firstname: any;
    lastname: any;
    email: any;
    phonenumber: any;
    super_admin: any;
    status: any;
    additionalPermissions: any;
    adminId: any;
    invitationSent: any;
    organisationId: any;
    userId: any;
    department: any;
    archive: any;
  }) => {
    if (!selectedAdmin) {
      console.error("No selected Admin to update");
      return;
    }

    console.log("Edited Values:", values);

    try {
      // Update the vehicle data in the database using the selectedVehicle.id
      const AdminRef = doc(fbDb, "admins", selectedAdmin.id);
      await setDoc(AdminRef, {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phonenumber: values.phonenumber,
        super_admin: values.super_admin,
        status: values.status,
        additionalPermissions: values.additionalPermissions || [],
        department: values.department,
        adminId: values.adminId,
        invitationSent: values.invitationSent,
        organisationId: values.organisationId,
        userId: values.userId,
        archive: values.archive,
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedAdmins.map((admin) =>
        admin.id === selectedAdmin.id
          ? {
              ...admin,
              firstname: values.firstname,
              lastname: values.lastname,
              email: values.email,
              phonenumber: values.phonenumber,
              super_admin: values.super_admin,
              status: values.status,
              additionalPermissions: values.additionalPermissions || [],
              department: values.department,
              adminId: values.adminId,
              invitationSent: values.invitationSent,
              organisationId: values.organisationId,
              userId: values.userId,
              archive: values.archive,
            }
          : admin
      );
      setFetchedAdmins(updatedVehicles);

      setSelectedAdmin(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Admin:", error);
    }
  };

  return (
    <>
      <div className="bg-[#FFFFFF]">
        <div className="mt-2 max-h-[700px]">
          <Tab.Group>
            <div className="mb-2 flex w-full">
              <div className="mr-[550px] flex flex-col ml-6">
                <h2 className="font-semibold text-[#030229]">Users</h2>
                <div className="mt-[8px] text-sm text-[#6b6b73]">
                  Manage your teams & user permissions.
                </div>
              </div>
              <div className="flex justify-end text-base mr-2">
                <div className="ml-2">
                  <AddButton name="Add User" handleAddClick={handleAddAdmin} />
                </div>
              </div>
            </div>

            <Tab.Panels>
              <Tab.Panel>
                <div className="h-full overflow-y-auto">
                  <AdminsTable
                    selectedTab={selectedTab}
                    admins={fetchedAdmins}
                    filteredAdmins={fetchedAdmins}
                    updateFetchedAdmins={updateFetchedAdmins}
                    handleEditClick={handleEditClick}
                  />
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
          <div>
            <AddAdmin open={open} setOpen={setOpen} />

            {editModalOpen && selectedAdmin && (
              <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
                <div>
                  <div className="flex w-full h-full justify-between items-center mb-12">
                    <div className="text-xl font-semibold ">
                      Edit User Details
                    </div>
                    <Button
                      className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                      handleClick={handleEditModalClose}
                    >
                      <XMarkIcon className="h-6 w-6 text-red-400" />
                    </Button>
                  </div>
                  <Formik
                    validationSchema={EditvalidationSchema}
                    initialValues={editFormInitialValues}
                    onSubmit={handleEditSubmit}
                  >
                    {({ values, errors, touched, setFieldValue }) => (
                      <Form>
                        <div className="">
                          <div className="flex w-full justify-between">
                            <label className="block">
                              <label className="form-label">FIRSTNAME</label>
                              <Field
                                type="text"
                                name="firstname"
                                value={values.firstname}
                                className="form-input bg-grey w-48"
                              />
                              {errors.firstname && touched.firstname ? (
                                <div className="text-red-600 text-sm">
                                  {errors.firstname}
                                </div>
                              ) : null}
                            </label>
                            <label className="block">
                              <label className="form-label">LASTNAME</label>
                              <Field
                                type="text"
                                name="lastname"
                                value={values.lastname}
                                className="form-input bg-grey w-48"
                              />
                              {errors.lastname && touched.lastname ? (
                                <div className="text-red-600 text-sm">
                                  {errors.lastname}
                                </div>
                              ) : null}
                            </label>
                          </div>
                          <div className="flex w-full justify-between mt-8">
                            <label className="block">
                              <label className="form-label">EMAIL</label>
                              <Field
                                type="email"
                                name="email"
                                value={values.email}
                                className="form-input bg-grey w-48"
                              />
                              {errors.email && touched.email ? (
                                <div className="text-red-600 text-sm">
                                  {errors.email}
                                </div>
                              ) : null}
                            </label>
                            <label className="block">
                              <label className="form-label">PHONE NUMBER</label>
                              <Field
                                type="text"
                                name="phonenumber"
                                value={values.phonenumber}
                                className="form-input bg-grey w-48"
                              />
                              {errors.phonenumber && touched.phonenumber ? (
                                <div className="text-red-600 text-sm">
                                  {errors.phonenumber}
                                </div>
                              ) : null}
                            </label>
                          </div>
                          <div className="flex w-full justify-between mt-8">
                            <label className="block">
                              <label className="form-label">DEPARTMENT</label>
                              <Field
                                as="select"
                                name="department"
                                value={
                                  values.department ? values.department : ""
                                }
                                onChange={(
                                  event: React.ChangeEvent<HTMLSelectElement>
                                ) => {
                                  const selectedDepartmentName =
                                    event.target.value;
                                  setFieldValue(
                                    "department",
                                    selectedDepartmentName
                                  );
                                }}
                                className="form-input bg-grey w-48"
                              >
                                <option value="">Select Department</option>
                                {departments.map((department: any) => (
                                  <option
                                    key={department.id}
                                    value={department.name}
                                  >
                                    {department.name}
                                  </option>
                                ))}
                              </Field>
                              {errors.department && touched.department ? (
                                <div className="text-red-600 text-sm">
                                  {errors.department}
                                </div>
                              ) : null}
                            </label>

                            <label className="block">
                              <label className="form-label">ADMIN</label>
                              <Field
                                type="checkbox"
                                name="super_admin"
                                checked={values.super_admin}
                                className="form-checkbox bg-gray-200"
                              />
                            </label>
                          </div>
                          <div className="flex w-full justify-end mt-24 ">
                            <Button
                              className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32"
                              handleClick={handleReset}
                            >
                              Reset
                            </Button>
                            {/* <Submit name="save" handleSubmit={handleSubmit}/> */}
                            <button
                              className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4"
                              type="submit"
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
          </div>
        </div>
      </div>
    </>
  );
}

interface AdminsTableProps {
  selectedTab: number;
  admins: Admin[];
  filteredAdmins: Admin[];
  updateFetchedAdmins: (updatedAdmins: Admin[]) => void;
  handleEditClick: any;
}

export function AdminsTable({
  selectedTab,
  updateFetchedAdmins,
  handleEditClick,
  admins,
  filteredAdmins,
}: AdminsTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  console.log("Filtered Admins", filteredAdmins);
  const [selectedAdmins, setSelectedAdmins] = useState<Admin[]>([]);

  const handleCheckboxChange = (admin: Admin) => {
    const isAdminSelected = selectedAdmins.includes(admin);
    if (isAdminSelected) {
      setSelectedAdmins(selectedAdmins.filter((a) => a.id !== admin.id));
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    console.log("Search Query:", query);
    setSearchQuery(query);
  };

  const fetchedAdmins: Admin[] = admins.filter(
    (admin: DocumentData): admin is Admin => {
      const fullName = `${admin.firstname} ${admin.lastname}`.toLowerCase();
      const nameMatch = fullName.includes(searchQuery.toLowerCase());
      const isStatusTrue = admin.status === true || admin.status === "true";
      return isStatusTrue && nameMatch;
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
        value: (row: Admin) => (row.super_admin ? "Admin" : "User"),
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

  const updateVehicleStatusInDatabase = async (
    vehicleId: number,
    newStatus: boolean
  ) => {
    try {
      const vehicleRef = doc(fbDb, "admins", vehicleId.toString());
      await setDoc(vehicleRef, { archive: newStatus }, { merge: true });
      console.log("Admin status updated in the database:", vehicleId);
      toast.success("Admin archived successfully");

      const updatedVehicles = fetchedAdmins.map((admin) =>
        admin.id === vehicleId ? { ...admin, archive: newStatus } : admin
      );
      updateFetchedAdmins(updatedVehicles);
    } catch (error) {
      console.error("Error updating Vehicle status in database:", error);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
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
                <tr key={admin.id} className="border-b">
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
                        admin.super_admin
                          ? "bg-[#065ad8] text-white"
                          : "bg-[#065ad8] text-white"
                      }`}
                    >
                      {admin.super_admin ? "Admin" : "User"}
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
                        onClick={() =>
                          updateVehicleStatusInDatabase(
                            admin.id,
                            !admin.archive
                          )
                        }
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
