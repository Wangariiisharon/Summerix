import { TabGroup, TabPanel, TabPanels } from "@headlessui/react";
import { Button, AddButtons } from "@/components/Buttons";
import { SetStateAction, useEffect, useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal, NewFormModal } from "@/components/Modals/FormModal";
// import { Formik, Field, Form } from "formik/dist/index";
import { Formik, Form, Field } from "formik";
import firebaseApp, { fbDb } from "@/firebase/configs";
import AdminsTable from "./adminsTable";
import country from "country-list-js";
import {
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
import * as Yup from "yup";
import { getFunctions, httpsCallable } from "firebase/functions"; //httpsCallable  from "../../../../../functions";

interface DepartmentData {
  name: string;
}
interface CreateUserResponse {
  uid: string;
}
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
  // super_admin: boolean;
  inviterUid: string | null;
}

type EditFormValues = {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  // super_admin: boolean;
  status: boolean;
  additionalPermissions: string[];
  department: string;
  adminId: string;
  invitationSent: boolean;
  inviterUid: string | null;
  organisationId: string;
  userId: string;
  archive: boolean;
  id: string;
  role: string;
  country: string;
};

export default function Admins() {
  const [open, setOpen] = useState(false);
  const [fetchedAdmins, setFetchedAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<DocumentData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [editFormInitialValues, setEditFormInitialValues] =
    useState<EditFormValues>({
      firstname: "",
      lastname: "",
      email: "",
      status: true,
      additionalPermissions: [],
      department: "",
      adminId: "",
      invitationSent: false,
      organisationId: "",
      userId: "",
      archive: false,
      id: "",
      inviterUid: "",
      role: "",
      country: "",
      phonenumber: "",
    });

  const [departments, setDepartments] = useState<DocumentData[]>([]);
  let { currentUser, organisationId, isSuperAdmin } = useAuthContext();

  const validationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    email: Yup.string().required("Email is required"),
    department: Yup.string().required("Department is required"),
    country: Yup.string().required("Country is required"),
    role: Yup.string().required("Role is required"),
  });

  const EditvalidationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    role: Yup.string().required("Role is required"),
    country: Yup.string().required("Country is required"),
    department: Yup.string().required("Department is required"),
  });

  async function generateAdminId(organisationId: string | null) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fbDb, "admins"),
          where("organisationId", "==", organisationId)
        )
      );
      const adminCount = querySnapshot.size;
      return `U${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching admins count:", error);
      return "U001";
    }
  }

  const handleAddAdmin = () => {
    setIsModalOpen(true);
  };

  const handleExport = () => {};

  const handleReset = () => {
    setOpen(false);
  };

  const updateFetchedVehicles = (updatedAdmins: SetStateAction<Admin[]>) => {
    setFetchedAdmins(updatedAdmins || []);
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
                  id: doc.id, // Set the id here
                  ...adminData,
                  department: departmentName,
                };
              })
            );
            setFetchedAdmins(adminsData || []);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Admins:", error);
      }
    };

    const fetchCountries = () => {
      try {
        const country_names = country.names();
        const sortedCountryNames = country_names.sort((a, b) =>
          a.localeCompare(b)
        );
        setCountries(sortedCountryNames);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setLoading(false);
      }
    };
    const fetchDepartments = async () => {
      try {
        const departmentQuery = query(
          collection(fbDb, "departments"),
          where("organisationId", "==", organisationId),
          where("archive", "==", false)
        );
        const departmentSnapshot = await getDocs(departmentQuery);

        if (departmentSnapshot.empty) {
          setDepartments([]);
          return;
        }

        const departmentData = departmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));

        setDepartments(departmentData);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchCountries();
    fetchDepartments();
    fetchedAdmins();
  }, [organisationId]);
  console.log(fetchedAdmins);

  const updateFetchedAdmins = (updatedAdmins: Admin[]) => {
    setFetchedAdmins(updatedAdmins);
  };

  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditFormInitialValues({
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      phonenumber: admin.phonenumber,
      status: admin.status,
      additionalPermissions: admin.additionalPermissions || [],
      department: admin.department,
      adminId: admin.adminId,
      invitationSent: admin.invitationSent || true,
      organisationId: admin.organisationId,
      userId: admin.userId,
      archive: admin.archive,
      inviterUid: admin.inviterUid || "",
      id: admin.id || "",
      role: admin.role,
      country: admin.country,
    });
    setEditModalOpen(true);
  };
  const handleAdd = () => {
    console.log("handleAdd called");

    setIsModalOpen(true);
  };
  const handleEditModalClose = () => {
    setSelectedAdmin(null);
    setEditModalOpen(false);
  };

  const handleAddAdminClick = () => {
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (values: Admin) => {
    console.log("Edited Values:", values);

    if (!selectedAdmin) {
      console.error("No selected Admin to update");
      return;
    }

    try {
      if (!values.id) {
        // Check against values.id
        console.error("Selected Admin does not have an id");
        return;
      }

      const AdminRef = doc(fbDb, "admins", values.id); // Use values.id

      // Prepare data to be updated, providing default values for undefined fields
      const adminDataToUpdate = {
        firstname: values.firstname || "",
        lastname: values.lastname || "",
        email: values.email || "",
        phonenumber: values.phonenumber || "",
        status: values.status || false,
        additionalPermissions: values.additionalPermissions || [],
        department: values.department || "",
        adminId: values.adminId || "",
        organisationId: values.organisationId || "",
        userId: values.userId || "",
        archive: values.archive || false,
        inviterUid: values.inviterUid || "",
        invitationSent: values.invitationSent || false,
        country: values.country || "",
        role: values.role || "",
      };

      await setDoc(AdminRef, adminDataToUpdate, { merge: true });

      const updatedAdmins = fetchedAdmins.map((admin) =>
        admin.id === values.id // Use id for comparison
          ? {
              ...admin,
              ...adminDataToUpdate, // Update fields with new values
            }
          : admin
      );
      setFetchedAdmins(updatedAdmins || []);

      setSelectedAdmin(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Admin:", error);
    }
  };

  const handleSubmit = async (values: {
    firstname: any;
    lastname: any;
    email: any;
    phonenumber: any;
    country: any;
    role: any;
    invitationSent: boolean;
    department: string;
  }) => {
    console.log("handleSubmit called with values:", values);
    console.log("organisationId:", organisationId); // Ensure this is set
    console.log("currentUser:", currentUser);

    try {
      const auth = getAuth(firebaseApp);
      console.log("Auth object obtained:", auth);

      // Check if the user already exists in the organization
      const existingAdminQuery = query(
        collection(fbDb, "admins"),
        where("email", "==", values.email),
        where("organisationId", "==", organisationId)
      );
      const existingAdminSnapshot = await getDocs(existingAdminQuery);
      console.log("Existing admin query snapshot:", existingAdminSnapshot);

      if (!existingAdminSnapshot.empty) {
        toast.error(
          `A User with the Email '${values.email}' already exists in the organization`
        );
        return;
      }

      // Get the inviter UID
      const inviterUid = auth.currentUser ? auth.currentUser.uid : null;
      console.log("Inviter UID:", inviterUid);

      const inviterQuery = query(
        collection(fbDb, "admins"),
        where("userId", "==", inviterUid)
      );
      const inviterSnapshot = await getDocs(inviterQuery);
      console.log("Inviter query snapshot:", inviterSnapshot);

      let inviterData = null;
      if (!inviterSnapshot.empty) {
        inviterData = inviterSnapshot.docs[0].data();
        console.log("Inviter Data:", inviterData);
      } else {
        console.error("Inviter not found");
      }

      const generatedAdminId = await generateAdminId(organisationId);
      console.log("Generated Admin ID:", generatedAdminId);

      const adminData: Admin = {
        adminId: generatedAdminId,
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phonenumber: values.phonenumber,
        status: true,
        country: values.country,
        role: values.role,
        department: values.department,
        inviterUid: inviterUid,
        organisationId: organisationId,
        userId: "", // This will be updated after user signs in
        archive: false,
        additionalPermissions: [],
        invitationSent: true,
      };

      console.log("Admin Data to be added:", adminData);

      // Add new admin document with temporary data
      const docRef = await addDoc(collection(fbDb, "admins"), adminData);
      console.log("Document Reference ID:", docRef.id);

      // Send sign-in link to email
      const actionCodeSettings = {
        url: ` https://truckit-git-develop-gorafi.vercel.app/signin?_vercel_share=Sm5ZkWuZDso8NDfYmxUtegLqpGi09bPD?adminId=${docRef.id}`,

        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);
      await updateDoc(docRef, { invitationSent: true });

      toast.success(
        "Admin Successfully Added. An email invitation has been sent."
      );

      setFetchedAdmins((prevAdmins) => [{ ...adminData }, ...prevAdmins]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Error adding admin. Please try again.");
    }
  };

  return (
    <>
      <div className="bg-[#FFFFFF]">
        <div className="mt-2 max-h-[700px]">
          <TabGroup>
            <div className="mb-2 flex w-full">
              <div className="mr-[550px] flex flex-col ml-6">
                <h2 className="font-semibold text-[#030229]">Users</h2>
                <div className="mt-[8px] text-sm text-[#6b6b73]">
                  Manage your teams & user permissions.
                </div>
              </div>
              <div className="flex justify-end text-base mr-2">
                <div className="ml-2">
                  <Button
                    className="rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2"
                    handleClick={handleAdd}
                  >
                    <PlusIcon className="h-6 w-6 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </div>

            <TabPanels>
              <TabPanel>
                <div className="h-full overflow-y-auto">
                  <AdminsTable
                    admins={fetchedAdmins || []}
                    filteredAdmins={fetchedAdmins || []}
                    updateFetchedAdmins={updateFetchedAdmins}
                    handleEditClick={handleEditClick}
                  />
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>

          {isModalOpen && (
            <NewFormModal
              isOpen={isModalOpen}
              setOpen={setIsModalOpen}
              heading="Add User"
            >
              <div className="p-5">
                <Formik
                  initialValues={{
                    firstname: "",
                    lastname: "",
                    email: "",
                    phonenumber: "",
                    country: "",
                    role: "",
                    invitationSent: true,
                    department: "",
                  }}
                  onSubmit={(values, { setSubmitting }) => {
                    console.log("Formik onSubmit called with values:", values); // Debug log
                    handleSubmit(values);
                    setSubmitting(false);
                    setIsModalOpen(false);
                  }}
                  validationSchema={validationSchema}
                  validateOnChange={true}
                  validateOnBlur={true}
                >
                  {({
                    values,
                    setFieldValue,
                    isSubmitting,
                    errors,
                    touched,
                  }) => (
                    <Form>
                      <div className="space-y-6">
                        <div className="space-y-6">
                          <div className="flex justify-between space-x-4">
                            <label className="block w-1/2">
                              <span className="form-label">First Name</span>
                              <Field
                                type="text"
                                name="firstname"
                                value={values.firstname}
                                className="form-input mt-1 block w-full bg-gray-100"
                              />
                              {errors.firstname && touched.firstname ? (
                                <div className="text-red-600 text-sm mt-1">
                                  {errors.firstname}
                                </div>
                              ) : null}
                            </label>
                            <label className="block w-1/2">
                              <span className="form-label">Last Name</span>
                              <Field
                                type="text"
                                name="lastname"
                                value={values.lastname}
                                className="form-input mt-1 block w-full bg-gray-100"
                              />
                              {errors.lastname && touched.lastname ? (
                                <div className="text-red-600 text-sm mt-1">
                                  {errors.lastname}
                                </div>
                              ) : null}
                            </label>
                          </div>
                          <label className="block">
                            <span className="form-label">Email</span>
                            <Field
                              type="email"
                              name="email"
                              value={values.email}
                              className="form-input mt-1 block w-full bg-gray-100"
                            />
                            {errors.email && touched.email ? (
                              <div className="text-red-600 text-sm mt-1">
                                {errors.email}
                              </div>
                            ) : null}
                          </label>
                          <label className="block">
                            <span className="form-label">Role</span>
                            <Field
                              as="select"
                              name="role"
                              value={values.role || ""}
                              className="form-input mt-1 block w-full bg-gray-100"
                              onChange={(event: any) => {
                                setFieldValue("role", event.target.value);
                                console.log(
                                  "Role selected:",
                                  event.target.value
                                );
                              }}
                            >
                              <option value="">Select Role</option>
                              <option value="Admin">Admin</option>
                              <option value="User">User</option>
                            </Field>
                            {errors.role && touched.role ? (
                              <div className="text-red-600 text-sm mt-1">
                                {errors.role}
                              </div>
                            ) : null}
                          </label>
                          <label className="block">
                            <span className="form-label">Country</span>
                            <Field
                              as="select"
                              name="country"
                              value={values.country || ""}
                              className="form-input mt-1 block w-full bg-gray-100"
                              onChange={(event: any) => {
                                setFieldValue("country", event.target.value);
                                console.log(
                                  "Country selected:",
                                  event.target.value
                                );
                              }}
                            >
                              <option value="">Select Country</option>
                              {countries.map((country, index) => (
                                <option key={index} value={country}>
                                  {country}
                                </option>
                              ))}
                            </Field>
                            {errors.country && touched.country ? (
                              <div className="text-red-600 text-sm mt-1">
                                {errors.country}
                              </div>
                            ) : null}
                          </label>
                          <label className="block">
                            <span className="form-label">
                              Assign To Department
                            </span>
                            <Field
                              as="select"
                              name="department"
                              value={values.department || ""}
                              className="form-input mt-1 block w-full bg-gray-100"
                              onChange={(event: any) => {
                                setFieldValue("department", event.target.value);
                                console.log(
                                  "Department selected:",
                                  event.target.value
                                );
                              }}
                            >
                              <option value="">Select Department</option>
                              {departments.map((department) => (
                                <option
                                  key={department.id}
                                  value={department.name}
                                >
                                  {department.name}
                                </option>
                              ))}
                            </Field>
                            {errors.department && touched.department ? (
                              <div className="text-red-600 text-sm mt-1">
                                {errors.department}
                              </div>
                            ) : null}
                          </label>
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-400 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => setIsModalOpen(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-[#4FD1C5] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            + Add member
                          </button>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </NewFormModal>
          )}

          {editModalOpen && (
            <NewFormModal
              isOpen={editModalOpen}
              setOpen={handleEditModalClose}
              heading="Edit Member"
            >
              <div className="p-5">
                <Formik
                  initialValues={editFormInitialValues}
                  onSubmit={handleEditSubmit}
                  // validationSchema={EditvalidationSchema}
                  validationSchema={EditvalidationSchema}
                  validateOnChange={true}
                  validateOnBlur={true}
                >
                  {({
                    values,
                    setFieldValue,
                    errors,
                    touched,
                    isSubmitting,
                  }) => (
                    <Form>
                      <div className="space-y-6">
                        <div className="flex justify-between space-x-4">
                          <label className="block w-1/2">
                            <span className="form-label">First Name</span>
                            <Field
                              type="text"
                              name="firstname"
                              value={values.firstname}
                              className="form-input mt-1 block w-full bg-gray-100"
                            />
                            {errors.firstname && touched.firstname ? (
                              <div className="text-red-600 text-sm mt-1">
                                {errors.firstname}
                              </div>
                            ) : null}
                          </label>
                          <label className="block w-1/2">
                            <span className="form-label">Last Name</span>
                            <Field
                              type="text"
                              name="lastname"
                              value={values.lastname}
                              className="form-input mt-1 block w-full bg-gray-100"
                            />
                            {errors.lastname && touched.lastname ? (
                              <div className="text-red-600 text-sm mt-1">
                                {errors.lastname}
                              </div>
                            ) : null}
                          </label>
                        </div>
                        <label className="block">
                          <span className="form-label">Email</span>
                          <Field
                            type="email"
                            name="email"
                            value={values.email}
                            className="form-input mt-1 block w-full bg-gray-100"
                          />
                          {errors.email && touched.email ? (
                            <div className="text-red-600 text-sm mt-1">
                              {errors.email}
                            </div>
                          ) : null}
                        </label>
                        <label className="block">
                          <span className="form-label">Role</span>
                          <Field
                            as="select"
                            name="role"
                            value={values.role || ""}
                            className="form-input mt-1 block w-full bg-gray-100"
                            onChange={(event: any) => {
                              setFieldValue("role", event.target.value);
                              console.log(event.target.value);
                            }}
                          >
                            <option value="">Select Role</option>
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                          </Field>
                          {errors.role && touched.role ? (
                            <div className="text-red-600 text-sm mt-1">
                              {errors.role}
                            </div>
                          ) : null}
                        </label>
                        <label className="block">
                          <span className="form-label">Country</span>
                          <Field
                            as="select"
                            name="country"
                            value={values.country || ""}
                            className="form-input mt-1 block w-full bg-gray-100"
                            onChange={(event: any) =>
                              setFieldValue("country", event.target.value)
                            }
                          >
                            <option value="">Select Country</option>
                            {countries.map((country, index) => (
                              <option key={index} value={country}>
                                {country}
                              </option>
                            ))}
                          </Field>
                          {errors.country && touched.country ? (
                            <div className="text-red-600 text-sm mt-1">
                              {errors.country}
                            </div>
                          ) : null}
                        </label>
                        <label className="block">
                          <span className="form-label">
                            Assign To Department
                          </span>
                          <Field
                            as="select"
                            name="department"
                            value={values.department || ""}
                            className="form-input mt-1 block w-full bg-gray-100"
                            onChange={(event: any) =>
                              setFieldValue("department", event.target.value)
                            }
                          >
                            <option value="">Select Department</option>
                            {departments.map((department) => (
                              <option
                                key={department.id}
                                value={department.name}
                              >
                                {department.name}
                              </option>
                            ))}
                          </Field>
                          {errors.department && touched.department ? (
                            <div className="text-red-600 text-sm mt-1">
                              {errors.department}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex justify-end mt-4">
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
                          + Save
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </NewFormModal>
          )}
        </div>
      </div>
    </>
  );
}
