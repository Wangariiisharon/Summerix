import {
  DocumentData,
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
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";
import toast from "react-hot-toast";

interface DepatmentDetailsProps {
  id: string;
  departmentId: string;
  department: {
    departmentId?: string;
    name: string;
    members: number;
    permissions: string[];
    update: Date;
    archive: boolean;
    status: boolean;
  };
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
  const [fetchedPermissions, setFetchedPermissions] = useState<DocumentData[]>(
    []
  );
  const [departmentPermissions, setDepartmentPermissions] = useState<
    DocumentData[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [allChecked, setAllChecked] = useState(false);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { organisationId } = useAuthContext();

  const router = useRouter();
  const { id } = router.query;
  console.log("This is the ID", id);

  function handleAddPermissions() {}
  function handleAddMembers() {}

  async function addPermission(departmentId: string, permissionName: string) {
    try {
      const departmentRef = doc(fbDb, "departments", departmentId);
      const departmentDocSnap = await getDoc(departmentRef);

      if (departmentDocSnap.exists()) {
        let permissions: string[] = departmentDocSnap.data()?.permissions || [];

        if (!permissions.includes(permissionName)) {
          permissions.push(permissionName);
          await updateDoc(departmentRef, { permissions });
          toast.success("Permission added successfully for department");
        } else {
          toast.error("Permission already exists");
        }
      } else {
        toast.error("Department not found");
      }
    } catch (error) {
      console.error("Error adding permission:", error);
      toast.error("Error adding permission");
    }
  }

  async function removePermission(
    departmentId: string,
    permissionName: string
  ) {
    try {
      const departmentRef = doc(fbDb, "departments", departmentId);
      const departmentDocSnap = await getDoc(departmentRef);

      if (departmentDocSnap.exists()) {
        let permissions: string[] = departmentDocSnap.data()?.permissions || [];
        permissions = permissions.filter(
          (permission) => permission !== permissionName
        );

        await updateDoc(departmentRef, { permissions });
        toast.success("Permission removed successfully");
      } else {
        toast.error("Department not found");
      }
    } catch (error) {
      console.error("Error removing permission:", error);
      toast.error("Error removing permission");
    }
  }

  useEffect(() => {
    let unsubscribe = () => {}; // Initialize unsubscribe function

    if (id) {
      const departmentId = id as string;
      const departmentDocRef = doc(fbDb, "departments", departmentId);

      // Subscribe to changes using onSnapshot
      unsubscribe = onSnapshot(departmentDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const departmentData =
            docSnapshot.data() as DepatmentDetailsProps["department"];
          departmentData.departmentId = docSnapshot.id; // Ensure departmentId is set

          setDepartments(departmentData);

          // Fetch other departments with the same organisationId
          if (organisationId) {
            const departmentsQuery = query(
              collection(fbDb, "departments"),
              where("organisationId", "==", organisationId)
            );
            getDocs(departmentsQuery).then((querySnapshot) => {
              const departmentsList: DocumentData[] = [];
              querySnapshot.forEach((doc) => {
                departmentsList.push(doc.data());
              });
              setFetchedDepartments(departmentsList);
            });
          }
        }
      });
    }

    // Fetch permissions data once
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

    // Clean up function to unsubscribe from snapshot listener
    return () => {
      unsubscribe();
    };
  }, [id, organisationId]);

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

  const handleSaveChanges = async () => {
    if (!departments?.departmentId) {
      toast.error("Department ID is missing");
      return;
    }

    const selectedPermissions: string[] = [];
    Object.keys(permissions).forEach((section) => {
      permissions[section].forEach((permission) => {
        if (permission.checked) {
          selectedPermissions.push(permission.name);
        }
      });
    });

    const settingsRef = doc(fbDb, "departments", departments.departmentId);

    try {
      await setDoc(
        settingsRef,
        {
          permissions: selectedPermissions,
          departmentId: departments.departmentId, // Ensure departmentId is saved
        },
        { merge: true }
      );

      console.log(
        "Permissions successfully updated for department!",
        departments.departmentId
      );
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

                    <p className="text-[#6b6b73] text-sm ml-[10px]">Memebers</p>
                  </div>
                  <p className="mt-[5px] text-[#] text-sm font-semibold ml-[34px]">
                    8
                  </p>
                </div>
              </div>
              <div className="ml-[18px] bg-white ">
                <div className="flex flex-col p-[20px]">
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

                  <button className="bg-white border border-teal-400 text-teal-400 hover:bg-teal-50 font-semibold py-2 px-4 rounded flex items-center">
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
                              checked={allChecked}
                              onChange={handleFullPermissionChange}
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
                              checked={allChecked}
                              onChange={handleFullPermissionChange}
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
                              checked={allChecked}
                              onChange={handleFullPermissionChange}
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
                          <h2 className="text-sm font-semibold mt-4">Trips</h2>
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
                              checked={allChecked}
                              onChange={handleFullPermissionChange}
                            />
                            <span className="ml-2 text-sm text-gray-700 mt-2">
                              Select All
                            </span>
                          </label>
                        </div>
                        {permissions["Trips"]?.map((permission) => (
                          <label
                            key={permission.name}
                            className="form-checkbox text-sm h-5 w-5 text-[#4fd1c5] rounded-md"
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
                              checked={allChecked}
                              onChange={handleFullPermissionChange}
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
                              checked={allChecked}
                              onChange={handleFullPermissionChange}
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
                              checked={allChecked}
                              onChange={handleFullPermissionChange}
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
                              checked={allChecked}
                              onChange={handleFullPermissionChange}
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
                    <button
                      onClick={handleSaveChanges}
                      className="mt-[30px] bg-[#065AD8] text-white rounded-md py-[8px] text-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </SiteLayout>
  );
}
