import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router";
import SiteLayout from "@/Layout/SiteLayout";
import { Example } from "@/components/Cards/template";
import { AllPermissions } from "@/components/Cards/template";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface DepatmentDetailsProps {
  departmentId: string;
  department: {
    departmentId?: string; // Make departmentId optional
    name: string;
    members: number;
    permissions: string[];
    update: Date;
  };
}

export default function ViewDepatment() {
  const [departments, setdepartments] = useState<
    DepatmentDetailsProps["department"] | null
  >(null);
  const [fetchedPermisions, setFetchedPermisions] = useState<DocumentData[]>(
    []
  );
  const router = useRouter();
  const { id } = router.query;

  function handleAddPermissions() {}
  function handleAddMembers() {}

  // Function to add a permission to the department
  // Function to add a permission to the department

  async function addPermission(departmentId: string, permissionId: string) {
    console.log("addPermission:", { permissionId, departmentId });

    try {
      const departmentRef = doc(fbDb, "departments", departmentId);
      const departmentDocSnap = await getDoc(departmentRef);

      if (departmentDocSnap.exists()) {
        let permissions: string[] | undefined =
          departmentDocSnap.data()?.permissions;

        // If permissions array is undefined or null, initialize it as an empty array
        if (!permissions) {
          permissions = [];
        }

        // Retrieve the name of the permission document
        const permissionDocRef = doc(fbDb, "permisions", permissionId);
        const permissionDocSnap = await getDoc(permissionDocRef);
        if (permissionDocSnap.exists()) {
          const permissionName = permissionDocSnap.data()?.name;

          // Check if the permissions array is not undefined before calling includes()
          if (permissions && !permissions.includes(permissionName)) {
            permissions.push(permissionName); // Add the new permission name
            await updateDoc(departmentRef, { permissions }); // Update the permissions array in the document
            toast.success("Permission added successfully");
          } else {
            console.error("Permission already exists");
            toast.error("Permission already exists");
          }
        } else {
          console.error("Permission document not found");
          toast.error("Permission document not found");
        }
      } else {
        console.error("Department not found");
        toast.error("Department not found");
      }
    } catch (error) {
      console.error("Error adding permission:", error);
      toast.error("Error adding permission");
    }
  }
  // Function to remove a permission from the department
  async function removePermission(departmentId: string, permissionId: string) {
    console.log("removePermission:", { permissionId, departmentId });

    try {
      const departmentRef = doc(fbDb, "departments", departmentId);
      const departmentDocSnap = await getDoc(departmentRef);
      if (departmentDocSnap.exists()) {
        let permissions: string[] = Array.isArray(
          departmentDocSnap.data().permissions
        )
          ? departmentDocSnap.data().permissions
          : [];

        if (!Array.isArray(permissions)) {
          permissions = [];
        }

        const index = permissions.indexOf(permissionId);
        if (index !== -1) {
          permissions.splice(index, 1);
          await updateDoc(departmentRef, { permissions });
          toast.success("Permission removed successfully");
        } else {
          console.error("Permission not found");
          toast.error("Permission not found");
        }
      } else {
        console.error("Department not found");
        toast.error("Department not found");
      }
    } catch (error) {
      console.error("Error removing permission:", error);
      toast.error("Error removing permission");
    }
  }

  useEffect(() => {
    const unsubscribe = () => {}; // Initialize unsubscribe function

    if (id) {
      const departmentId = id as string;
      const depatmentDocRef = doc(fbDb, "departments", departmentId);

      // Subscribe to changes using onSnapshot
      const unsubscribe = onSnapshot(depatmentDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const departmentData =
            docSnapshot.data() as DepatmentDetailsProps["department"];
          setdepartments(departmentData);
        }
      });
    }

    // Fetch permissions data once
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

    fetchPermissions();

    // Clean up function to unsubscribe from snapshot listener
    return () => {
      unsubscribe();
    };
  }, [id]);

  return (
    <>
      {/* <div>viewDepatment</div> 
    <div>{departments?.name}</div>    */}

      <SiteLayout>
        <div className="bg-[#FAFAFB] h-full text-[#030229]">
          <p className="text-lg font-nunito flex justify-center font-bold mt-2  ml-7">{`View Depatment:${departments?.name}`}</p>
          <div className="flex flex-col">
            <div className="rounded-md flex justify-between shadow-md bg-[#FFFFFF] ml-5 mt-5 ">
              <div className="bg-[#FFFFFF]  flex-row py-5">
                {/* justify-between  */}

                <div className="w-full ml-10 flex flex-col">
                  <div className=" mt-5 px-10 flex justify-start flex-row mb-5">
                    <div>
                      <p className="font-nunito font-regular text-sm font-nunito font-regular">
                        GROUP NAME
                      </p>
                      <p className="font-nunito font-regular text-sm text-[#030229] font-nunito font-bold">
                        {departments?.name}
                      </p>
                    </div>
                    <div className="ml-20">
                      <p className="font-nunito font-regular text-sm font-nunito font-regular">
                        CREATED AT
                      </p>
                      <p className="font-nunito font-regular text-sm text-[#030229] font-nunito font-bold">
                        {departments?.update
                          ? formatDistanceToNow(
                              departments.update instanceof Date
                                ? departments.update
                                : new Date(departments.update),
                              { addSuffix: true }
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div className="ml-20">
                      <p className="font-nunito font-regular text-sm font-nunito font-regular">
                        UPDATED AT
                      </p>
                      <p className="font-nunito font-regular text-sm text-[#030229] font-nunito font-bold">
                        David Mwangi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-row ml-5 w-full">
              <div className="w-1/2 pr-4">
                <PermissionsTable
                  permissions={departments?.permissions ?? []}
                  heading="Selected Permissions"
                  func={removePermission}
                  departmentId={id as string}
                />
              </div>
              <div className="w-1/2 pl-4">
                <AllPermissionsTable
                  permissions={fetchedPermisions}
                  heading="All Permissions"
                  func={addPermission}
                  departmentId={id as string}
                />
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    </>
  );
}

interface PermissionsTableProps {
  permissions: string[];
  heading: string;
  func: any;
  departmentId: string;
}
interface PermissionsTableProps {
  permissions: string[];
  heading: string;
  func: any;
  departmentId: string;
}

function PermissionsTable({
  permissions,
  heading,
  func,
  departmentId,
}: PermissionsTableProps) {
  const handleRemovePermission = (permissionId: string) => {
    console.log("Handle Remove Permission: " + permissionId);

    if (departmentId && permissionId) {
      func(departmentId, permissionId);
    } else {
      console.error("PermissionId or DepartmentId is undefined");
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
  departmentId: string; // Change the type to string
}
function AllPermissionsTable({
  permissions,
  heading,
  func,
  departmentId,
}: AllPermissionsTableProps) {
  const handleAddPermission = (permissionId: string) => {
    if (departmentId && permissionId) {
      func(departmentId, permissionId);
    } else {
      console.error("PermissionId or DepartmentId is undefined");
    }
  };

  return (
    <AllPermissions
      heading={heading}
      list={permissions}
      action={handleAddPermission} // Pass the handler directly
    />
  );
}
