import firebase from "firebase/app";
import "firebase/firestore";
import { Tab } from "@headlessui/react";
import { AddButton, Button, EditBtn } from "@/components/Buttons";
import { Fragment, SetStateAction, useEffect, useState, Dispatch } from "react";
import SearchBar from "../../../../components/Forms/input";
import Table, { DummyTable } from "../../../../components/Table/Table";
import { BodyCell, HeaderCell } from "../../../../components/Table/Cells";
import { TableBody } from "../../../../components/Table/Row";
import {
  CheckCircleIcon,
  CheckIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import router, { useRouter } from "next/router";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form, useFormikContext } from "formik/dist/index";
import firebaseApp, { fbDb } from "@/firebase/configs";
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
import { getMessaging, getToken } from "firebase/messaging";
import "firebase/firestore";
import * as Yup from "yup";
import { FaEdit, FaTrash, FaArchive } from "react-icons/fa";

interface DepartmentData {
  name: string;
}
interface AdminData {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  department: DocumentReference<DocumentData> | string;
  status: boolean;
  super_admin: boolean;
  archive: boolean;
}

export default function Admins() {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<DocumentData | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
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

  const validationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    email: Yup.string().required("Email details are required"),
    phonenumber: Yup.string().required("Phone number address is required"),
    department: Yup.string().required("Department is required"),
  });
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
  const updateFetchedVehicles = (
    updatedAdmins: SetStateAction<DocumentData[]>
  ) => {
    setFetchedAdmins(updatedAdmins);
  };
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentQuery = query(
          collection(fbDb, "departments"),
          where("organisationId", "==", organisationId) // Filter by organisationId
        );
        const departmentSnapshot = await getDocs(departmentQuery);

        if (departmentSnapshot.empty) {
          console.log("No departments found for the given organisation.");
          setDepartments([]);
          return;
        }

        const departmentData = departmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name, // Assuming department name is stored in the 'name' field
        }));

        setDepartments(departmentData);
        console.log("Departments:", departmentData);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    // const fetchedAdmins = async () => {
    //   const db = getFirestore();

    //   try {
    //     if (organisationId) {
    //       const q = query(
    //         collection(db, "admins"),
    //         where("organisationId", "==", organisationId)
    //       );

    //       const unsubscribe = onSnapshot(q, (querySnapshot) => {
    //         const adminsData = querySnapshot.docs.map((doc) => {
    //           const departmentRef = doc.data().department;
    //           return {
    //             id: doc.id,
    //             departmentRef,
    //             ...doc.data(),
    //           };
    //         });
    //         setFetchedAdmins(adminsData);
    //       });

    //       return () => unsubscribe();
    //     } else {
    //       console.error("Organisation ID is not available.");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching Admins:", error);
    //   }
    // };
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
                const adminData = doc.data() as AdminData;
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
    fetchDepartments();
  }, [organisationId]);
  async function generateAdminId(organisationId: string | null) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fbDb, "admins"),
          where("organisationId", "==", organisationId)
        )
      );
      const adminCount = querySnapshot.size;

      // Customize this logic based on your requirements
      return `U${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching admins count:", error);
      // Handle error or return a default value
      return "U001";
    }
  }
  const auth = getAuth(firebaseApp);
  // const user = currentUser(auth);
  const user = auth.currentUser;
  const inviterUid = user ? user.uid : null;

  const handleSubmit = async (values: {
    firstname: any;
    lastname: any;
    email: any;
    phonenumber: any;
    super_admin: boolean;
    invitationSent: boolean;
    department: string; // Ensure correct type for department
  }) => {
    console.log("Submitted Values:", values);
    console.log("User", user);

    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        "Random"
      );
      const authUid = userCredential.user.uid;

      // Check if user with the given email already exists
      const existingAdminQuery = query(
        collection(fbDb, "admins"),
        where("email", "==", values.email),
        where("organisationId", "==", organisationId)
      );

      const existingAdminSnapshot = await getDocs(existingAdminQuery);

      if (!existingAdminSnapshot.empty) {
        console.error(
          "User with this email already exists in the organization"
        );
        toast.error(
          `A User with the Email '${values.email}' already exists in the organization`
        );
        return;
      }
      // Assuming 'inviters' is the collection where inviter data is stored
      const inviterQuery = query(
        collection(fbDb, "admins"),
        where("userId", "==", inviterUid)
      );
      const inviterSnapshot = await getDocs(inviterQuery);

      console.log("Inviter Snapshot:", inviterSnapshot);

      if (!inviterSnapshot.empty) {
        // The inviter's data is found
        const inviterData = inviterSnapshot.docs[0].data();

        // Access the organisationId from inviterData
        organisationId = inviterData.organisationId;
        // Now you can use organisationId as needed
        console.log("Organisation ID:", organisationId);
      } else {
        // Inviter not found
        console.error("Inviter not found");
      }
      const generatedAdminId = await generateAdminId(organisationId);
      const adminData = {
        adminId: generatedAdminId,
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phonenumber: values.phonenumber,
        status: true,
        super_admin: values.super_admin,
        department: values.department, // Use the selected department reference directly
        inviterUid: inviterUid,
        organisationId: organisationId,
        userId: authUid,
        archive: false,
      };

      const docRef = await addDoc(collection(fbDb, "admins"), adminData);
      console.log("Admin added with ID: ", docRef.id);
      toast.success("Admin Successfully Added.");
      const newAdmin = {
        id: docRef.id,
        ...adminData,
      };

      setFetchedAdmins((prevAdmins) => [newAdmin, ...prevAdmins]);

      if (!values.invitationSent) {
        // Authentication
        const auth = getAuth(firebaseApp);

        // Send invitation email
        const actionCodeSettings = {
          url: `https://truck-it-bf0b2.web.app/auth?adminId=${docRef.id}`,
          handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);

        // Mark the invitation as sent in Firestore
        await updateDoc(docRef, {
          invitationSent: true,
        });

        console.log("Invitation email sent successfully");
      }

      // Close your form or perform any other necessary actions
      setOpen(false);
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  const updateFetchedAdmins = (
    updatedAdmins: SetStateAction<DocumentData[]>
  ) => {
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
            <FormModal open={open} setOpen={setOpen}>
              <div className="p-5">
                <div className="flex w-full h-full justify-between items-center mb-12">
                  <div className="text-xl font-semibold ">New User</div>
                  <Button
                    className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                    handleClick={handleReset}
                  >
                    <XMarkIcon className="h-6 w-6 text-red-400" />
                  </Button>
                </div>
                <Formik
                  initialValues={{
                    firstname: "",
                    lastname: "",
                    email: "",
                    phonenumber: "",
                    department: "",
                    super_admin: false,
                    invitationSent: false,
                  }}
                  validationSchema={validationSchema}
                  onSubmit={(values) => {
                    handleSubmit(values);
                    console.log(values);
                  }}
                >
                  {({ values, setFieldValue, errors, touched }) => (
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
                              value={values.department ? values.department : ""}
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
  admins: DocumentData[];
  filteredAdmins: DocumentData[];
  updateFetchedAdmins: (updatedAdmins: DocumentData[]) => void;
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
  const rowsPerPage = 6;
  const totalTrips = filteredAdmins.length;
  const totalPages = Math.ceil(totalTrips / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const router = useRouter();
  console.log("Filterd Admins", filteredAdmins);
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    console.log("Search Query:", query);
    setSearchQuery(query);
  };

  const fetchedAdmins = admins.filter((admin) => {
    const fullName = `${admin.firstname} ${admin.lastname}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    // Check if status is true (either boolean or string 'true')
    const isStatusTrue = admin.status === true || admin.status === "true";
    return isStatusTrue && nameMatch;
  });

  const handleUserClick = (admin: any) => {
    router.push(`Administration/Admins/manage_admins/viewAdmin?id=${admin.id}`);
    console.log("The admin", admin);
  };
  const updateVehicleStatusInDatabase = async (
    vehicleId: string,
    newStatus: boolean
  ) => {
    try {
      const vehicleRef = doc(fbDb, "admins", vehicleId);
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

  const visibleAdmins = fetchedAdmins.slice(startIndex, endIndex);
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
          <table className="min-w-full bg-white ">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10 ">
              <tr>
                {/* <th className="py-3 px-6 text-left ">Name</th> */}
                <th className="py-3 px-6 text-left">
                  <input type="checkbox" className="mr-3" />
                  Name
                </th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Department</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {fetchedAdmins.map((admin: any, index: any) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-6">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3" />
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
                          event.stopPropagation(); // Stop the event from bubbling up
                          handleEditClick(admin);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button className="text-red-500 hover:text-red-600">
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
        </div>
      </div>
    </div>
  );
}
