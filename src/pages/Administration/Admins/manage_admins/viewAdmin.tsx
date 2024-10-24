import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router";
import SiteLayout from "@/Layout/SiteLayout";

import toast from "react-hot-toast";
import { Formik, Field, Form } from "formik/dist/index";
import { FormModal, NewFormModal } from "@/components/Modals/FormModal";
import * as Yup from "yup";
import country from "country-list-js";
import { useAuthContext } from "@/components/Authentication/AuthProvider";

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
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  // super_admin: boolean;
  status: boolean;
  additionalPermissions: string[];
  adminId: string;
  fcmToken: string;
  invitationSent: boolean;
  organisationId: string;
  userId: string;
  department: string;
  country: string;
  role: string;
  addedby: string;
}

type PermissionObject = { name: string; checked: boolean };
type Permissions = { [key: string]: PermissionObject[] };

export default function ViewDepatment() {
  const [departments, setDepartments] = useState<
    DepatmentDetailsProps["department"] | null
  >(null);
  const [fetchedDepartments, setFetchedDepartments] = useState<DocumentData[]>(
    []
  );
  const [permissions, setPermissions] = useState<Permissions>({});
  const [allPermissions, setAllPermissions] = useState<Permissions>({});

  const [fetchedPermissions, setFetchedPermissions] = useState<DocumentData[]>(
    []
  );
  const [departmentPermissions, setDepartmentPermissions] = useState<string[]>(
    []
  );
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [additionalPermissions, setAdditionalPermissions] = useState<string[]>(
    []
  );
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState<DocumentData[]>([]);
  const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);
  const [combinedPermissions, setCombinedPermissions] = useState<string[]>([]);
  const [allDepartments, setAllDepartments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<AdminData[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);

  const [editFormInitialValues, setEditFormInitialValues] = useState<AdminData>(
    {
      firstname: "",
      lastname: "",
      email: "",
      phonenumber: "",
      // super_admin: false,
      status: true,
      additionalPermissions: [],
      adminId: "",
      fcmToken: "",
      invitationSent: false,
      organisationId: "",
      userId: "",
      department: "",
      country: "",
      role: "",
      addedby: "",
    }
  );
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
    departmentData,
  } = useAuthContext();

  const sections = ["Dashboard", "Vehicles", "Drivers", "Trips"];
  const router = useRouter();
  const { id } = router.query;

  const EditvalidationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    email: Yup.string().required("Email details are required"),
    phonenumber: Yup.string().required("Phone number address is required"),
    department: Yup.string().required("Department is required"),
  });

  const handleEditClick = (admin: AdminData) => {
    setEditFormInitialValues({
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      phonenumber: admin.phonenumber,
      // super_admin: admin.super_admin,
      status: admin.status,
      additionalPermissions: admin.additionalPermissions,
      department: admin.department,
      adminId: admin.userId, // Ensure adminId is set correctly
      fcmToken: "",
      invitationSent: false,
      organisationId: admin.organisationId, // Ensure
      userId: admin.userId,
      country: "",
      role: admin.role,
      addedby: admin.addedby,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (values: {
    firstname: string;
    lastname: string;
    email: string;
    phonenumber: string;
    // super_admin: boolean;
    status: boolean;
    additionalPermissions: string[];
    department: string;
    adminId: string;
    fcmToken: string;
    invitationSent: boolean;
    organisationId: string;
    userId: string;
    country: string;
    role: string;
    addedby: string;
  }) => {
    console.log("Edited Values:", values);
    const { id } = router.query;

    try {
      const adminRef = doc(fbDb, "admins", id as string); // Correctly reference the document by document ID
      console.log(adminRef);

      await setDoc(
        adminRef,
        {
          firstname: values.firstname,
          lastname: values.lastname,
          email: values.email,
          phonenumber: values.phonenumber,
          // super_admin: values.super_admin,
          status: values.status,
          additionalPermissions: values.additionalPermissions,
          department: values.department,
          adminId: values.adminId,
          fcmToken: values.fcmToken,
          invitationSent: values.invitationSent,
          organisationId: values.organisationId,
          userId: values.userId,
          country: values.country,
          role: values.role,
          addedby: currentUser?.email,
        },
        { merge: true } // Use merge to only update the specified fields
      );

      // Update the local fetchedAdmins state
      const updatedAdmins = fetchedAdmins.map((admin) =>
        admin.userId === values.userId // Compare against values.userId to find the correct admin
          ? {
              ...admin,
              firstname: values.firstname,
              lastname: values.lastname,
              email: values.email,
              phonenumber: values.phonenumber,
              // super_admin: values.super_admin,
              status: values.status,
              additionalPermissions: values.additionalPermissions,
              department: values.department,
              adminId: values.adminId,
              fcmToken: values.fcmToken,
              invitationSent: values.invitationSent,
              organisationId: values.organisationId,
              userId: values.userId,
              country: values.country,
              role: values.role,
              addedby: values.addedby,
            }
          : admin
      );
      setFetchedAdmins(updatedAdmins);
      setEditModalOpen(false);
      console.log("Admin Updated:", updatedAdmins);
      toast.success("Admin  updated successfully!");
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

  const handleReset = () => {
    setOpen(false);
  };

  useEffect(() => {
    const unsubscribe = () => {};

    const fetchPermissions = async () => {
      try {
        const permissionsCollection = collection(fbDb, "permisions");
        const permissionsSnapshot = await getDocs(permissionsCollection);
        const permissionsData: Permissions = {};
        permissionsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (typeof data === "object" && data !== null) {
            Object.keys(data).forEach((key) => {
              if (Array.isArray(data[key])) {
                permissionsData[key] = data[key].map((permission: string) => ({
                  name: permission,
                  checked: false,
                }));
              }
            });
          }
        });
        return permissionsData;
      } catch (error) {
        console.error("Error fetching permissions:", error);
        return {};
      }
    };
    const fetchAdminData = async (permissionsData: Permissions) => {
      const { id } = router.query;

      if (!id) {
        console.error("No ID specified for fetching admin data.");
        setUserData([]);
        return;
      }

      try {
        // Fetch the admin document
        const adminDocRef = doc(fbDb, "admins", id as string);
        const adminDoc = await getDoc(adminDocRef);

        if (!adminDoc.exists()) {
          console.log("Admin not found.");
          setUserData([]);
          return;
        }

        const adminData = adminDoc.data() as AdminData;
        setUserData([adminData]);

        let departmentDocRef;

        // If the department field contains a name instead of an ID, we need to fetch the document ID
        if (adminData.department.includes("/")) {
          // The department field seems to contain a valid document path
          departmentDocRef = doc(fbDb, "departments", adminData.department);
        } else {
          // If the department is just a name, query Firestore to find the corresponding document ID
          const departmentQuery = query(
            collection(fbDb, "departments"),
            where("name", "==", adminData.department)
          );
          const departmentQuerySnapshot = await getDocs(departmentQuery);

          if (departmentQuerySnapshot.empty) {
            console.error(
              "No department found with the name:",
              adminData.department
            );
            setDepartmentPermissions([]);
            return;
          }

          // Assuming department names are unique, we take the first document in the result
          const departmentDoc = departmentQuerySnapshot.docs[0];
          departmentDocRef = doc(fbDb, "departments", departmentDoc.id);
        }

        // Fetch the department document
        const departmentDoc = await getDoc(departmentDocRef);

        let departmentPermissions: string[] = [];
        if (departmentDoc.exists()) {
          departmentPermissions = departmentDoc.data().permissions || [];
          console.log("Department permissions:", departmentPermissions);
        }

        // Combine admin's additional permissions with the department permissions
        const combinedPermissions = new Set([
          ...adminData.additionalPermissions, // Permissions specific to the admin
          ...departmentPermissions, // Permissions from the department
        ]);
        console.log("combinedPermissions", combinedPermissions);

        // Update the permissions data by marking the ones in combinedPermissions as checked
        const updatedPermissions = { ...permissionsData };
        Object.keys(updatedPermissions).forEach((section) => {
          updatedPermissions[section] = updatedPermissions[section].map(
            (permission) => ({
              ...permission,
              checked: combinedPermissions.has(permission.name), // Mark as checked if in combinedPermissions
            })
          );
        });

        // Set the combined department permissions for later use if needed
        setDepartmentPermissions(departmentPermissions);

        // Set the updated permissions to state
        setPermissions(updatedPermissions);
        console.log(
          "Updated Permissions after fetching admin data:",
          updatedPermissions
        );
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setUserData([]);
      }
    };

    // const fetchAdminData = async (permissionsData: Permissions) => {
    //   const { id } = router.query;

    //   if (!id) {
    //     console.error("No ID specified for fetching admin data.");
    //     setUserData([]);
    //     return;
    //   }

    //   try {
    //     const adminDocRef = doc(fbDb, "admins", id as string);
    //     const adminDoc = await getDoc(adminDocRef);

    //     if (!adminDoc.exists()) {
    //       console.log("Admin not found.");
    //       setUserData([]);
    //       return;
    //     }

    //     const adminData = adminDoc.data() as AdminData;
    //     setUserData([adminData]);

    //     const departmentDocRef = doc(fbDb, "departments", adminData.department);
    //     const departmentDoc = await getDoc(departmentDocRef);

    //     let departmentPermissions: string[] = [];
    //     if (departmentDoc.exists()) {
    //       departmentPermissions = departmentDoc.data().permissions || [];
    //     }

    //     const combinedPermissions = new Set([
    //       ...adminData.additionalPermissions,
    //       ...departmentPermissions,
    //     ]);

    //     setDepartmentPermissions(departmentPermissions);
    //     setCombinedPermissions([...combinedPermissions]);

    //     const updatedPermissions = { ...permissionsData };
    //     Object.keys(updatedPermissions).forEach((section) => {
    //       updatedPermissions[section] = updatedPermissions[section].map(
    //         (permission) => ({
    //           ...permission,
    //           checked: combinedPermissions.has(permission.name),
    //         })
    //       );
    //     });

    //     setPermissions(updatedPermissions);
    //     console.log(
    //       "Updated Permissions after fetching admin data:",
    //       updatedPermissions
    //     );
    //   } catch (error) {
    //     console.error("Error fetching admin data:", error);
    //     setUserData([]);
    //   }
    // };

    const fetchDepartments = async () => {
      try {
        const departmentData: { id: string; name: string }[] = [];
        const departmentQuery = query(collection(fbDb, "departments"));
        const departmentSnapshot = await getDocs(departmentQuery);

        departmentSnapshot.forEach((doc) => {
          const departmentName = doc.data().name;
          departmentData.push({
            id: doc.id,
            name: departmentName,
          });
        });

        setAllDepartments(departmentData);
      } catch (error) {
        console.error("Error fetching departments:", error);
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
    // const handleFullPermisionss = () => {
    //   if (userClaims?.admin === true) {
    //     setAllChecked(true);
    //   } else {
    //     setAllChecked(false);
    //     console.log("This user is not an admin", allChecked);
    //   }
    // };

    fetchPermissions()
      .then((permissionsData) => {
        setPermissions(permissionsData);
        return fetchAdminData(permissionsData);
      })
      .then(fetchDepartments)
      .then(fetchCountries);
    // .then(handleFullPermisionss);

    return () => {
      unsubscribe();
    };
  }, [id, fetchedPermissions]);

  const handleFullPermissionChange = () => {
    const newAllChecked = !allChecked;

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
    const newSectionAllChecked = !permissions[section].every((p) => p.checked);
    const updatedPermissions = { ...permissions };
    updatedPermissions[section] = updatedPermissions[section].map(
      (permission) => ({
        ...permission,
        checked: newSectionAllChecked,
      })
    );
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
          addedBy: currentUser?.email,
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
              <button
                className="text-white border border-teal-400 bg-teal-400 hover:bg-teal-400 font-semibold  px-2 ml-[100px] mr-[10px] rounded flex items-center"
                onClick={() => handleEditClick(userData[0])}
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
                              // checked={
                              //   permissions["Dashboard"]?.every(
                              //     (p) => p.checked
                              //   ) || false
                              // }
                              // onChange={() =>
                              //   handleSectionSelectAllChange("Dashboard")
                              // }
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
          <NewFormModal
            isOpen={editModalOpen}
            setOpen={handleEditModalClose}
            heading="Edit Member"
          >
            <div className="p-5">
              <Formik
                // validationSchema={EditvalidationSchema}
                initialValues={editFormInitialValues}
                onSubmit={handleEditSubmit}
              >
                {({ values, setFieldValue, errors, touched, isSubmitting }) => (
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
                        <span className="form-label">Assign To Department</span>
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
                          {allDepartments.map((department) => (
                            <option key={department.id} value={department.name}>
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
                        Save
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </NewFormModal>
        )}
      </>
    </SiteLayout>
  );
}
