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
  role: string;
}

interface CheckedState {
  [key: string]: {
    fullPermission: boolean;
    permissions: boolean[];
  };
}

type PermissionObject = { name: string; checked: boolean };
type Permissions = { [key: string]: PermissionObject[] };
export default function ViewDepatment() {
  const [departments, setdepartments] = useState<
    DepatmentDetailsProps["department"] | null
  >(null);
  const [fetchedDepartments, setFetchedDepartments] = useState<DocumentData[]>(
    []
  );
  const [permissions, setPermissions] = useState<Permissions>({});

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
  const [allChecked, setAllChecked] = useState(false);

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
  const sections = ["Dashboard", "Vehicles", "Drivers", "Trips"];
  const router = useRouter();

  const { id } = router.query;

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
    console.log("Edited Values:", values);

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
          console.log("Permission already exists in combined permissions");
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
          console.log("Permission added successfully");
          toast.success("Permission added successfully");
        } else {
          console.log("Permission already exists");
          toast.error("Permission already exists");
        }
      } else {
        console.log("Admin or permission document not found");
        toast.error("Admin or permission document not found");
      }
    } catch (error) {
      console.error("Error adding permission:", error);
      toast.error("Error adding permission");
    }
  }

  // // Function to remove a permission from the department
  const removePermission = async (adminId: string, permissionId: string) => {
    console.log("permissionId", permissionId);
    console.log("adminId", adminId);
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
          console.log("Cannot remove department permissions");
          toast.error("Cannot remove department permissions");
          return; // Stop execution if it is a department permission
        }

        const index = additionalPermissions.indexOf(permissionId);
        if (index !== -1) {
          additionalPermissions.splice(index, 1);
          await updateDoc(adminRef, { additionalPermissions });
          console.log("Permission removed successfully");
          toast.success("Permission removed successfully");
        } else {
          console.log("Permission not found");
          toast.error("Permission not found");
        }
      } else {
        console.log("Admin not found");
        toast.error("Admin not found");
      }
    } catch (error) {
      console.error("Error removing permission:", error);
      toast.error("Error removing permission");
    }
  };

  useEffect(() => {
    const unsubscribe = () => {}; // Initialize unsubscribe function  fetchAdditionalPermissions

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
      console.log("permissionsData", permissionsData);
    };

    fetchPermissions();

    const fetchAdmins = async () => {
      if (!id) {
        console.error("No ID specified for fetching admin data.");
        setUserData([]);
        return;
      }

      const adminRef = doc(fbDb, "admins", id as string); // Use doc to directly access a single document
      const adminSnapshot = await getDoc(adminRef);

      if (!adminSnapshot.exists()) {
        console.log("Admin not found.");
        setUserData([]);
        return;
      }

      const adminData = adminSnapshot.data() as AdminData;
      setUserData([adminData]);
      console.log("THIS IS THE USER DATA", adminData);
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
        console.log("Departments:", departmentData);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchPermissions();
    fetchDepartments();
    fetchAdmins();

    // Clean up function to unsubscribe from snapshot listener
    return () => {
      unsubscribe();
    };
  }, [id, fetchedPermisions]);

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

  const handlePermissionChange = (section: string, permissionName: string) => {
    const updatedPermissions = { ...permissions };
    const permissionIndex = updatedPermissions[section].findIndex(
      (p) => p.name === permissionName
    );
    updatedPermissions[section][permissionIndex].checked =
      !updatedPermissions[section][permissionIndex].checked;

    setPermissions(updatedPermissions);

    const allChecked = Object.keys(updatedPermissions).every((section) =>
      updatedPermissions[section].every((p) => p.checked)
    );
    setAllChecked(allChecked);
  };

  // Assuming fbDb is correctly initialized Firestore instance

  const handleSaveChanges = async () => {
    const { id } = router.query;

    if (!id || Array.isArray(id)) {
      toast.error("Admin ID is missing or invalid");
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

    const settingsRef = doc(fbDb, "admins", id as string);

    try {
      await setDoc(
        settingsRef,
        {
          additionalPermissions: selectedPermissions,
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
            <p>User Details</p>
          </div>
          <div className="mt-[23px] bg-[#f7f8fa]  border border-[#dee8f8]">
            <div className="flex flex-row mt-[25px] ml-[32px] mb-[25px]">
              <div className="flex flex-col">
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

                  <p className="text-[#6b6b73] text-sm ml-[10px]">Full name</p>
                </div>
                <p className="mt-[5px] text-[#] text-sm font-semibold ml-[34px]">
                  {userData[0]?.firstname}
                </p>
              </div>
              <div className="flex flex-col  ml-[100px]">
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

                  <p className="text-[#6b6b73] text-sm ml-[10px]">Email</p>
                </div>
                <p className="mt-[5px] text-[#] text-sm font-semibold ml-[34px]">
                  {userData[0]?.email}
                </p>
              </div>
              <div className="flex flex-col ml-[100px]">
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
                      d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
                    />
                  </svg>

                  <p className="text-[#6b6b73] text-sm ml-[10px]">Role</p>
                </div>
                <p className="mt-[5px] text-[#] text-sm font-semibold ml-[34px]">
                  {userData[0]?.role}
                </p>
              </div>
              <div className="flex flex-col ml-[100px]	">
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
                      d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                    />
                  </svg>

                  <p className="text-[#6b6b73] text-sm ml-[10px]">Department</p>
                </div>
                <p className="mt-[5px] text-[#] text-sm font-semibold ml-[34px]">
                  {userData[0]?.department}
                </p>
              </div>
              <button className="text-white border border-teal-400 bg-teal-400 hover:bg-teal-400 font-semibold  px-2 ml-[100px] mr-[10px] rounded flex items-center">
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
              </button>{" "}
            </div>
          </div>
          <div className="border-y border-gray-200 mt-[43px]"></div>
          <div className="p-6 bg-white shadow-md rounded-lg mt-[43px]">
            <div className="flex flex-row items-center mb-4 w-full bg-white">
              <p>Permissions</p>
              <label className="flex items-center space-x-2 ml-[10px]">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleFullPermissionChange}
                  className="mr-[10px] rounded"
                />
                <span className="font-custom text-sm text-[#6b6b73]">
                  Full Permission
                </span>
              </label>
            </div>
            <div className="">
              <div className="flex justify-start mt-[25px] ml-[31px] mb-[25px]">
                {/* Iterate over sections */}
                {Object.keys(permissions).map((section) => (
                  <div key={section} className="ml-[18px]">
                    {/* Section title */}
                    <div className="flex flex-row w-full bg-white">
                      <div className="flex flex-col mb-2">
                        <p className="font-medium text-[#030229]">{section}</p>
                        <label className="flex mt-[15px] space-x-2">
                          <input
                            type="checkbox"
                            className="form-checkbox rounded text-sm"
                          />
                          <span className="font-custom text-sm text-[#6b6b73]">
                            Select all
                          </span>
                        </label>
                      </div>
                    </div>
                    {/* Permissions checkboxes */}
                    <div className="flex flex-col">
                      {permissions[section].map((permission) => (
                        <div
                          key={permission.name}
                          className="flex flex-row mb-2 items-center"
                        >
                          <input
                            type="checkbox"
                            checked={permission.checked}
                            onChange={() =>
                              handlePermissionChange(section, permission.name)
                            }
                            className="mr-[10px] rounded"
                          />
                          <p className="text-[#6b6b73] text-sm">
                            {permission.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-[20px] mb-[20px]">
              <button
                onClick={handleSaveChanges}
                className="bg-[#065AD8] text-white py-[10px] px-[20px] rounded-[5px]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </>
    </SiteLayout>
  );
}
