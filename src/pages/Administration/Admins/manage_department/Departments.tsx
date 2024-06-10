import { Tab } from "@headlessui/react";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { AddButton, Button, EditBtn } from "@/components/Buttons";
import Table, { DummyTable } from "@/components/Table/Table";
import {
  CheckCircleIcon,
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
import { FaEdit, FaTrash, FaArchive } from "react-icons/fa";
import json2csv from "json2csv";
interface Department {
  status: boolean;
  members: number;
  id: string;
  departmentId: string;
  name: string;
  updated: string | { seconds: number; nanoseconds: number }; // Allow updated to be a string or a Firestore timestamp
  organisationId: string;
  archive: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

export default function Departments() {
  const [open, setOpen] = useState(false);
  const [fetchedDepartments, setFetchedDepartments] = useState<Department[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    departmentId: "",
    name: "",
    updated: "",
    archive: false,
    organisationId: "",
  });
  const { organisationId } = useAuthContext();

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleReset = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchedDepartments = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(db, "departments"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const departmentsData = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              const updated = data.updated?.seconds
                ? new Date(data.updated.seconds * 1000).toISOString()
                : data.updated;

              return {
                id: doc.id,
                name: data.name,
                status: data.status,
                members: data.members,
                departmentId: data.departmentId,
                updated: updated, // Use the converted updated field
                archive: data.archive,
                organisationId: data.organisationId,
                ...data,
              };
            });
            setFetchedDepartments(departmentsData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Departments:", error);
      }
    };
    fetchedDepartments();
  }, [organisationId]);

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
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
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedDepartment(null);
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (values: {
    departmentId: any;
    name: any;
    organisationId: any;
    archive: any;
    updated: any;
  }) => {
    if (!selectedDepartment) {
      console.error("No selected vehicle to update");
      return;
    }

    try {
      if (!values.name) {
        console.error("Required form fields are missing");
        toast.error("please fill the Name field");
        return;
      }
      // Update the vehicle data in the database using the selectedVehicle.id
      const vehicleRef = doc(fbDb, "departments", selectedDepartment.id);
      await setDoc(vehicleRef, {
        departmentId: values.departmentId,
        name: values.name,
        organisationId: values.organisationId,
        archive: values.archive,
        updated: values.updated,
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedDepartments.map((client) =>
        client.id === selectedDepartment.id
          ? {
              ...client,
              departmentId: values.departmentId,
              name: values.name,
              organisationId: values.organisationId,
              archive: values.archive,
              updated: values.updated,
            }
          : client
      );

      setFetchedDepartments(updatedVehicles);

      setSelectedDepartment(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Vehicle:", error);
    }
  };

  // Function to generate departmentId based on the count of departments
  async function generateDepartmentId(organisationId: string) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fbDb, "departments"),
          where("organisationId", "==", organisationId)
        )
      );
      const departmentCount = querySnapshot.size;

      // Customize this logic based on your requirements
      return `G${(departmentCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching departments count:", error);
      // Handle error or return a default value
      return "D001";
    }
  }

  const handleSubmit = async (values: { name: any }) => {
    console.log("Submitted Values:", values);

    try {
      if (!values.name) {
        console.error("Required form fields are missing");
        toast.error("Please fill in the name field");
        return;
      }

      const existingDepartmentQuery = query(
        collection(fbDb, "departments"),
        where("name", "==", values.name),
        where("organisationId", "==", organisationId)
      );

      const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);

      if (!existingDepartmentSnapshot.empty) {
        console.error(
          "Department with this name already exists in the same organisation"
        );
        toast.error(
          `A Department with the name '${values.name}' already exists`
        );
        return;
      }

      if (organisationId === null) {
        console.error("organisationId is null");
        return;
      }

      // Use the generateDepartmentId function to get the appropriate departmentId
      const generatedDepartmentId = await generateDepartmentId(organisationId);

      const updated = new Date().toISOString(); // Convert Date to string

      const DepartmentsData = {
        status: true,
        members: 6,
        departmentId: generatedDepartmentId,
        name: values.name,
        updated: updated, // Ensure this is a string
        archive: false,
        organisationId: organisationId,
      };

      const docRef = await addDoc(
        collection(fbDb, "departments"),
        DepartmentsData
      );
      await updateDoc(docRef, { id: docRef.id });
      toast.success("Department Successfully Added.");

      const newDepartment: Department = {
        id: docRef.id,
        ...DepartmentsData,
      };

      // Prepend the new department to the fetchedDepartments state
      setFetchedDepartments((prevDepartments) => [
        newDepartment,
        ...prevDepartments,
      ]);

      setOpen(false);
    } catch (error) {
      console.error("Error adding Department:", error);
    }
  };

  const updatefetchedDepartments = (
    updatedDepartments: SetStateAction<Department[]>
  ) => {
    setFetchedDepartments(updatedDepartments);
  };
  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="container mx-auto p-4 bg-white">
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
                <AddButton name="Add Deparment" handleAddClick={handleAdd} />
              </div>
            </div>
          </div>

          <Tab.Panels>
            <Tab.Panel>
              <div className="h-full overflow-y-auto">
                <DepartmentsTable
                  departments={fetchedDepartments}
                  updateFetchedDepartments={updatefetchedDepartments}
                  handleEditClick={handleEditClick}
                />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {isModalOpen && (
          <NewFormModal
            isOpen={isModalOpen}
            setOpen={setIsModalOpen}
            heading="Add Department"
          >
            {" "}
            <div className="p-5">
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">New Department</div>
                <Button
                  className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                  handleClick={handleReset}
                >
                  <XMarkIcon className="h-6 w-6 text-red-400" />
                </Button>
              </div>
              <Formik
                initialValues={{
                  name: "",
                }}
                onSubmit={(values) => {
                  handleSubmit(values);
                }}
              >
                {({ values, setFieldValue }) => (
                  <Form>
                    <div className="">
                      <div className="flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">NAME</label>
                          <Field
                            type="text"
                            name="name"
                            value={values.name}
                            className="form-input bg-grey w-48"
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
          </NewFormModal>
        )}

        {editModalOpen && selectedDepartment && (
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
                {({ values, errors, touched }) => (
                  <Form>
                    <div className="">
                      <div className="flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">NAME</label>
                          <Field
                            type="text"
                            name="name"
                            value={values.name}
                            className="form-input bg-grey w-48"
                          />
                          {errors.name && touched.name ? (
                            <div className="text-red-600">{errors.name}</div>
                          ) : null}
                        </label>
                      </div>

                      <div className="flex w-full justify-end mt-24 ">
                        <Button
                          className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32"
                          handleClick={handleReset}
                        >
                          Reset
                        </Button>
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
    </>
  );
}

interface VehiclesTableProps {
  departments: Department[];
  updateFetchedDepartments: (updatedDepartments: Department[]) => void;
  handleEditClick: any;
}

export function DepartmentsTable({
  departments,
  updateFetchedDepartments,
  handleEditClick,
}: VehiclesTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>(
    []
  );

  const handleCheckboxChange = (department: Department) => {
    const isAdminSelected = selectedDepartments.includes(department);
    if (isAdminSelected) {
      setSelectedDepartments(
        selectedDepartments.filter((a) => a.id !== department.id)
      );
    } else {
      setSelectedDepartments([...selectedDepartments, department]);
    }
  };
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments(departments);
    }
    setSelectAll(!selectAll);
  };
  const deleteSelectedUsers = () => {};

  const downloadSelectedFiles = () => {
    const fields = [
      { label: "name", value: "name" },
      { label: "updated", value: "updated" },
      { label: "Department", value: "department" },
      {
        label: "Archive",
        value: (row: Department) => (row.archive ? "Archived" : "Not Archived"),
      },
    ];
    const opts = { fields };
    const csv = json2csv.parse(selectedDepartments, opts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "selectedDepartments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const updateVehicleStatusInDatabase = async (
    classId: string,
    newStatus: boolean
  ) => {
    try {
      const vehicleRef = doc(fbDb, "departments", classId);
      await setDoc(vehicleRef, { archive: newStatus }, { merge: true });

      const updatedVehicles = departments.map((department) =>
        department.id === classId
          ? { ...department, archive: newStatus }
          : department
      );
      updateFetchedDepartments(updatedVehicles);
    } catch (error) {
      console.error("Error updating Department status in database:", error);
    }
  };

  //   const Headers = ["GROUP ID", "NAME","UPDATED"]
  const rowsPerPage = 6;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const visibleDepartments = departments.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-4 bg-white">
      <div className="overflow-x-auto bg-gray-100 shadow-md rounded-lg">
        <div className="flex flex-row">
          <h2 className="font-semibold py-3 px-6 text-[#030229]">
            Manage Users
          </h2>
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
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Members</th>
                <th className="py-3 px-6 text-left">Updated</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {departments.map((department) => {
                let updatedDate;
                if (
                  typeof department.updated === "object" &&
                  "seconds" in department.updated
                ) {
                  updatedDate = new Date(department.updated.seconds * 1000); // Convert Firestore timestamp to Date
                } else {
                  updatedDate = new Date(department.updated); // Parse ISO string date
                }
                return (
                  <tr key={department.departmentId} className="border-b">
                    <td className="py-3 px-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-3"
                          checked={selectedDepartments.includes(department)}
                          onChange={() => handleCheckboxChange(department)}
                        />
                        <div>
                          <p className="font-semibold">{department.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          department.status
                            ? "bg-[#b9f9cf] text-[#11a849]"
                            : "bg-[#f4f4f4] text-[#030229]"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full mr-2 ${
                            department.status ? "bg-[#11a849]" : "bg-[#065ad8]"
                          }`}
                        ></span>
                        {department.status ? "Active" : "Offline"}
                      </span>
                    </td>

                    <td className="py-3 px-6">6</td>
                    <td className="py-3 px-6">
                      {formatDistanceToNow(updatedDate)} ago
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-500 hover:text-blue-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEditClick(department);
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
                              department.id,
                              !department.archive
                            )
                          }
                        >
                          {department.archive ? "Unarchive" : "Archive"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {Object.keys(selectedDepartments).filter(
            (key) => selectedDepartments[Number(key)]
          ).length > 0 && (
            <div className="flex justify-between items-center mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
              <div className="flex flex-row">
                <span>
                  {
                    Object.keys(selectedDepartments).filter(
                      (key) => selectedDepartments[Number(key)]
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
