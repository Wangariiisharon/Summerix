import {
  DocumentData,
  DocumentReference,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router";
import SiteLayout from "@/Layout/SiteLayout";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Buttons";
import { Example } from "@/components/Cards/template";
import { AllPermissions } from "@/components/Cards/template";
import toast from "react-hot-toast";
import { Formik, Field, Form } from "formik/dist/index";
import { FormModal } from "@/components/Modals/FormModal";

interface DepatmentDetailsProps {
  departmentId: string;
  department: {
    departmentId?: string;
    name: string;
    members: number;
    permissions: string[];
    update: Date;
  };
}
interface AdminData {
  additionalPermissions: string[];
  department: any;
  email: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  super_admin: boolean;
  status: boolean;
  // Add other fields if necessary
}

export default function ViewDepatment() {
  const [departments, setdepartments] = useState<
    DepatmentDetailsProps["department"] | null
  >(null);
  const [fetchedDepartments, setFetchedDepartments] = useState<DocumentData[]>(
    []
  );
  const [fetchedPermisions, setFetchedPermisions] = useState<DocumentData[]>(
    []
  );
  const [departmentPermissions, setDepartmentPermissions] = useState<string[]>(
    []
  );

  const [admins, setAdmins] = useState<AdminData[]>([]);

  const [additionalPermissions, setAdditionalPermissions] = useState<string[]>(
    []
  );

  const [admin, setAdmin] = useState<DocumentData[]>([]);
  const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);
  const [combinedPermissions, setCombinedPermissions] = useState<string[]>([]);
  const [allDepartments, setAllDepartments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<AdminData[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    super_admin: false,
    status: true,
    additionalPermissions: [],
    adminId: "",
    fcmToken: "",
    invitationSent: false,
    organisationId: "",
    userId: "",
    department: "",
  });
  const router = useRouter();
  const { id } = router.query;

  function handleAddPermissions() {}
  function handleAddMembers() {}

  const handleEditClick = (admin: DocumentData) => {
    setEditFormInitialValues({
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      phonenumber: admin.phonenumber,
      super_admin: admin.super_admin,
      status: admin.status,
      additionalPermissions: admin.additionalPermissions,
      department: admin.department,
      adminId: admin.adminId,
      fcmToken: admin.fcmToken,
      invitationSent: admin.invitationSent,
      organisationId: admin.organisationId,
      userId: admin.userId,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
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
    department: any;
    adminId: any;
    fcmToken: any;
    invitationSent: any;
    organisationId: any;
    userId: any;
  }) => {
    try {
      if (!values.firstname) {
        console.error(`Please fill the field FirstName`);
        toast.error(`Please fill the field FirstName`);
        return;
      }
      if (!values.lastname) {
        console.error(`Please fill the field LastName`);
        toast.error(`Please fill the field LastName`);
        return;
      }
      if (!values.email) {
        console.error(`Please fill the field Email`);
        toast.error(`Please fill the field Email`);
        return;
      }
      if (!values.phonenumber) {
        console.error(`Please fill the field  Phone number`);
        toast.error(`Please fill the field Phone number`);
        return;
      }
      if (!values.department) {
        console.error(`Please fill the field Department`);
        toast.error(`Please fill the field Department`);
        return;
      }

      // Update the vehicle data in the database using the selectedVehicle.id
      const AdminRef = doc(fbDb, "admins"); // Ensure id is defined and contains the correct document path
      await setDoc(AdminRef, {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phonenumber: values.phonenumber,
        super_admin: values.super_admin,
        status: values.status,
        additionalPermissions: values.additionalPermissions,
        department: values.department,
        adminId: values.adminId,
        fcmToken: values.fcmToken,
        invitationSent: values.invitationSent,
        organisationId: values.organisationId,
        userId: values.userId,
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedAdmins.map((admin) =>
        admin.id === id
          ? {
              ...admin,
              firstname: values.firstname,
              lastname: values.lastname,
              email: values.email,
              phonenumber: values.phonenumber,
              super_admin: values.super_admin,
              status: values.status,
              additionalPermissions: values.additionalPermissions,
              department: values.department,
              adminId: values.adminId,
              fcmToken: values.fcmToken,
              invitationSent: values.invitationSent,
              organisationId: values.organisationId,
              userId: values.userId,
            }
          : admin
      );
      setFetchedAdmins(updatedVehicles);

      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Admin:", error);
    }
  };
  async function addPermission(adminId: string, permissionId: string) {
    try {
      const adminRef = doc(fbDb, "admins", adminId);
      const permissionRef = doc(fbDb, "permisions", permissionId);

      const adminDocSnap = await getDoc(adminRef);
      const permissionDocSnap = await getDoc(permissionRef);

      if (adminDocSnap.exists() && permissionDocSnap.exists()) {
        const adminData = adminDocSnap.data() as AdminData;
        const permissionData = permissionDocSnap.data();

        // Check if permission already exists in combinedPermissions
        if (combinedPermissions.includes(permissionData.name)) {
          console.error("Permission already exists in combined permissions");
          toast.error("Permission already exists in Selected");
          return;
        }

        if (!adminData.additionalPermissions) {
          adminData.additionalPermissions = [];
        }

        if (!adminData.additionalPermissions.includes(permissionData.name)) {
          adminData.additionalPermissions.push(permissionData.name);
          await updateDoc(adminRef, {
            additionalPermissions: adminData.additionalPermissions,
          });
          toast.success("Permission added successfully");
        } else {
          console.error("Permission already exists");
          toast.error("Permission already exists");
        }
      } else {
        console.error("Admin or permission document not found");
        toast.error("Admin or permission document not found");
      }
    } catch (error) {
      console.error("Error adding permission:", error);
      toast.error("Error adding permission");
    }
  }

  // // Function to remove a permission from the department
  const removePermission = async (adminId: string, permissionId: string) => {
    console.log("removePermission:", { adminId, permissionId });

    try {
      const adminRef = doc(fbDb, "admins", adminId);
      const adminDocSnap = await getDoc(adminRef);

      if (adminDocSnap.exists()) {
        let additionalPermissions: string[] = Array.isArray(
          adminDocSnap.data().additionalPermissions
        )
          ? adminDocSnap.data().additionalPermissions
          : [];

        // Check if the permission is a department permission
        if (departmentPermissions.includes(permissionId)) {
          console.error("Cannot remove department permissions");
          toast.error("Cannot remove department permissions");
          return; // Stop execution if it is a department permission
        }

        const index = additionalPermissions.indexOf(permissionId);
        if (index !== -1) {
          additionalPermissions.splice(index, 1);
          await updateDoc(adminRef, { additionalPermissions });
          toast.success("Permission removed successfully");
        } else {
          console.error("Permission not found");
          toast.error("Permission not found");
        }
      } else {
        console.error("Admin not found");
        toast.error("Admin not found");
      }
    } catch (error) {
      console.error("Error removing permission:", error);
      toast.error("Error removing permission");
    }
  };

  useEffect(() => {
    const unsubscribe = () => {}; // Initialize unsubscribe function  fetchAdditionalPermissions

    const fetchAdditionalPermissions = async () => {
      if (!id) {
        console.error("No ID specified for fetching admin data.");
        setUserData([]);
        setAdditionalPermissions([]);
        setCombinedPermissions([]);
        return;
      }

      const adminRef = doc(fbDb, "admins", id as string); // Directly access a single document by ID
      const adminDocSnap = await getDoc(adminRef);

      if (!adminDocSnap.exists()) {
        console.error("Admin not found.");
        setUserData([]);
        setAdditionalPermissions([]);
        setCombinedPermissions([]);
        return;
      }

      const adminData = adminDocSnap.data() as AdminData;
      setUserData([adminData]); // Set data as an array with a single admin's data

      const allPermissions = new Set<string>();
      adminData.additionalPermissions?.forEach((permission) => {
        allPermissions.add(permission);
      });

      setAdditionalPermissions([...allPermissions]);

      if (adminData.department) {
        const departmentPermissions = await fetchDepartmentPermissions(
          adminData.department
        );
        departmentPermissions.forEach((permission: string) => {
          allPermissions.add(permission);
        });
        setDepartmentPermissions(departmentPermissions);
      }

      setCombinedPermissions([...allPermissions]);
    };

    const fetchPermissions = async () => {
      const querySnapshot = await getDocs(collection(fbDb, "permisions"));
      const permissionsData: DocumentData[] = [];

      querySnapshot.forEach((doc) => {
        const permission = {
          id: doc.id,
          ...doc.data(),
        };
        permissionsData.push(permission);
      });
      setFetchedPermisions(permissionsData);
    };

    const fetchAdmins = async () => {
      if (!id) {
        console.error("No ID specified for fetching admin data.");
        setUserData([]);
        return;
      }

      const adminRef = doc(fbDb, "admins", id as string); // Use doc to directly access a single document
      const adminSnapshot = await getDoc(adminRef);

      if (!adminSnapshot.exists()) {
        console.error("Admin not found.");
        setUserData([]);
        return;
      }

      const adminData = adminSnapshot.data() as AdminData;
      setUserData([adminData]); // Set data as an array with a single admin's data

      // After the admin is fetched, you may want to fetch permissions related to this admin
    };

    const fetchDepartments = async () => {
      try {
        const departmentData: { id: string; name: string }[] = []; // Modify the type here

        const departmentQuery = query(collection(fbDb, "departments"));
        const departmentSnapshot = await getDocs(departmentQuery);

        departmentSnapshot.forEach((doc) => {
          const departmentName = doc.data().name; // Assuming department name is stored in the 'name' field
          departmentData.push({
            id: doc.id, // Add the document ID to the department object
            name: departmentName, // Store the department name
          });
        });

        setAllDepartments(departmentData);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchPermissions();
    fetchDepartments();
    fetchAdmins();
    fetchAdditionalPermissions();

    // Clean up function to unsubscribe from snapshot listener
    return () => {
      unsubscribe();
    };
  }, [id]);

  const fetchDepartmentPermissions = async (departmentName: any) => {
    try {
      // Build the query to find the department by name
      const deptQuery = query(
        collection(fbDb, "departments"),
        where("name", "==", departmentName)
      );
      const querySnapshot = await getDocs(deptQuery);

      if (querySnapshot.empty) {
        console.warn(
          "No matching department found for the name:",
          departmentName
        );
        return null;
      }

      // Assuming there is only one department with this name
      const departmentDoc = querySnapshot.docs[0];
      const departmentData = departmentDoc.data();

      // Extracting permissions if available
      const permissions = departmentData.permissions || [];
      return permissions;
    } catch (error) {
      console.error("Error fetching department permissions:", error);
      return null;
    }
  };

  return (
    <>
      <SiteLayout>
        <div className="bg-[#FAFAFB] h-full text-[#030229]">
          <p className="text-lg font-nunito flex justify-center font-bold mt-2 ml-7">
            {userData.length > 0
              ? `${userData[0].firstname} ${userData[0].lastname}`
              : ""}
          </p>
          <div className="flex flex-col">
            <div className="rounded-md flex justify-between shadow-md bg-[#FFFFFF] ml-5 mt-5 ">
              <div className="bg-[#FFFFFF]  flex-row py-5">
                <div className=" flex items-center justify-center flex-row px-8">
                  <div className="flex flex-col ml-20">
                    <h1 className="font-bold">
                      {" "}
                      {userData.length > 0
                        ? `${userData[0]?.firstname} ${userData[0]?.lastname}`
                        : ""}
                    </h1>
                    <p className="text-sm text-[#030229]">
                      {userData[0]?.email}
                    </p>
                    <p className="text-sm text-[#030229]">
                      {userData[0]?.phonenumber}
                    </p>
                    <p className="text-sm text-[#030229]">Nairobi,Kenya</p>
                  </div>
                  <div className="flex flex-col ml-20">
                    <div className="flex flex-row">
                      <div className="flex flex-col text-sm text-[#030229]">
                        <p>Start time</p>
                        <p>Mar 14/2:23pm</p>
                      </div>
                      <div className="flex flex-col ml-20 text-sm text-[#030229]">
                        <p>End time</p>
                        <p>Mar 14/2:23pm</p>
                      </div>
                      <div className="flex Justify-end ml-24">
                        <p
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                          onClick={() => handleEditClick(admin)}
                        >
                          Edit
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row mt-4 text-sm text-[#030229]">
                      <div className="flex flex-col">
                        <p>Distance Coverd</p>
                        <p>501.4ml</p>
                      </div>
                      <div className="flex flex-col ml-20 text-sm text-[#030229]">
                        <p>Distance Coverd</p>
                        <p>501.4ml</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-row ml-5 w-full">
              <div className="w-1/2 pr-4">
                <PermissionsTable
                  permissions={combinedPermissions}
                  heading="Selected Permissions"
                  func={removePermission}
                  adminId={id as string}
                />
              </div>
              <div className="w-1/2 pl-4">
                <AllPermissionsTable
                  permissions={fetchedPermisions}
                  heading="All Permissions"
                  func={addPermission}
                  adminId={id as string}
                />
              </div>
            </div>
          </div>
          {editModalOpen && (
            <FormModal open={editModalOpen} setOpen={setEditModalOpen}>
              <div className="p-8">
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
                  initialValues={editFormInitialValues}
                  onSubmit={handleEditSubmit}
                >
                  {({ values, setFieldValue }) => (
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
                          </label>
                          <label className="block">
                            <label className="form-label">LASTNAME</label>
                            <Field
                              type="text"
                              name="lastname"
                              value={values.lastname}
                              className="form-input bg-grey w-48"
                            />
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
                          </label>
                          <label className="block">
                            <label className="form-label">PHONE NUMBER</label>
                            <Field
                              type="text"
                              name="phonenumber"
                              value={values.phonenumber}
                              className="form-input bg-grey w-48"
                            />
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
                              {allDepartments.map((department: any) => (
                                <option
                                  key={department.id}
                                  value={department.name}
                                >
                                  {department.name}
                                </option>
                              ))}
                            </Field>
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
                            handleClick={handleEditModalClose}
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
      </SiteLayout>
    </>
  );
}
interface PermissionsTableProps {
  permissions: string[];
  heading: string;
  func: any;
  adminId: string;
}

function PermissionsTable({
  permissions,
  heading,
  func,
  adminId,
}: PermissionsTableProps) {
  const handleRemovePermission = (permissionId: string) => {
    console.log("Handle Remove Permission permissionId: " + permissionId);
    console.log("Handle Remove Permission adminId : " + adminId);

    if (adminId) {
      func(adminId, permissionId); // Pass adminId as well
    } else {
      console.error("AdminId is undefined");
    }
  };

  return (
    <Example
      heading={heading}
      list={permissions}
      action={handleRemovePermission}
    />
  );
}

interface AllPermissionsTableProps {
  permissions: DocumentData[];
  heading: string;
  func: any;
  adminId: string; // Change the type to string
}
function AllPermissionsTable({
  permissions,
  heading,
  func,
  adminId,
}: AllPermissionsTableProps) {
  const handleAddPermission = (permissionId: string) => {
    if (adminId) {
      func(adminId, permissionId);
    } else {
      console.error("AdminId is undefined");
    }
  };

  return (
    <AllPermissions
      heading={heading}
      list={permissions}
      action={handleAddPermission}
    />
  );
}
