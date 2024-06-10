import { TabGroup, TabPanel, TabPanels } from "@headlessui/react";
import { Button, AddButtons } from "@/components/Buttons";
import { SetStateAction, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal, NewFormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
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

interface DepartmentData {
  name: string;
}
interface Admin {
  // id: string;
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
  // super_admin: any;
}

const validationSchema = Yup.object({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  email: Yup.string().required("Email is required"),
  phonenumber: Yup.string().required("Phone number is required"),
  department: Yup.string().required("Department is required"),
  country: Yup.string().required("Country is required"),
  role: Yup.string().required("Role is required"),
});

const EditvalidationSchema = Yup.object({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  email: Yup.string().required("Email details are required"),
  phonenumber: Yup.string().required("Phone number address is required"),
  department: Yup.string().required("Department is required"),
});

export default function Admins() {
  const [open, setOpen] = useState(false);
  const [fetchedAdmins, setFetchedAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<DocumentData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
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
        setCountries(country_names);
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

  const updateFetchedAdmins = (updatedAdmins: SetStateAction<Admin[]>) => {
    setFetchedAdmins(updatedAdmins || []);
  };

  const handleEditClick = (admin: DocumentData) => {
    setSelectedAdmin(admin);
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

  const handleAddAdminClick = () => {
    setIsModalOpen(true);
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
        admin.userId === selectedAdmin.id
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
      setFetchedAdmins(updatedVehicles || []);

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

    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        "Random"
      );
      const authUid = userCredential.user.uid;

      const existingAdminQuery = query(
        collection(fbDb, "admins"),
        where("email", "==", values.email),
        where("organisationId", "==", organisationId)
      );

      const existingAdminSnapshot = await getDocs(existingAdminQuery);

      if (!existingAdminSnapshot.empty) {
        toast.error(
          `A User with the Email '${values.email}' already exists in the organization`
        );
        return;
      }

      const inviterUid = auth.currentUser ? auth.currentUser.uid : null;
      const inviterQuery = query(
        collection(fbDb, "admins"),
        where("userId", "==", inviterUid)
      );
      const inviterSnapshot = await getDocs(inviterQuery);

      if (!inviterSnapshot.empty) {
        const inviterData = inviterSnapshot.docs[0].data();
      } else {
        console.error("Inviter not found");
      }

      const generatedAdminId = await generateAdminId(organisationId);
      const adminData = {
        adminId: generatedAdminId,
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        status: true,
        country: values.country,
        role: values.role,
        department: values.department,
        inviterUid: inviterUid,
        organisationId: organisationId,
        userId: authUid,
        archive: false,
      };

      const docRef = await addDoc(collection(fbDb, "admins"), adminData);
      toast.success("Admin Successfully Added.");
      setFetchedAdmins((prevAdmins) => [
        { id: docRef.id, ...adminData },
        ...prevAdmins,
      ]);

      if (!values.invitationSent) {
        const actionCodeSettings = {
          url: `https://truck-it-bf0b2.web.app/auth?adminId=${docRef.id}`,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);
        await updateDoc(docRef, { invitationSent: true });
      }

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
                  <AddButtons
                    name="Add User"
                    handleAddClick={handleAddAdmin}
                    handleModalClick={handleAddAdminClick}
                  />
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
              heading="Add Member"
            >
              <div className="p-5">
                <Formik
                  initialValues={{
                    firstname: "",
                    lastname: "",
                    email: "",
                    phonenumber: "",
                    department: "",
                    country: "",
                    role: "",
                    invitationSent: false,
                  }}
                  validationSchema={validationSchema}
                  onSubmit={(values, { setSubmitting }) => {
                    console.log("Form Values on Submit:", values);
                    handleSubmit(values);
                    setSubmitting(false); // Ensure to set submitting to false after submission
                  }}
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
                            onChange={(event: any) =>
                              setFieldValue("role", event.target.value)
                            }
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
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-[#4FD1C5] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                          disabled={isSubmitting} // Disable button while submitting
                        >
                          + Add member
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </NewFormModal>
          )}

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
          )}
        </div>
      </div>
    </>
  );
}
