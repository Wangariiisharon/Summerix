import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { fbDb } from "@/firebase/configs";
// import HamburgerMenu from '@/components/hamburgerMenu';
import { AddButton, Button, DeleteBtn, EditBtn } from "@/components/Buttons";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import SiteLayout from "@/Layout/SiteLayout";
import { HeaderCell, BodyCell } from "@/components/Table/Cells";
import { TableBody } from "@/components/Table/Row";
import Table from "@/components/Table/Table";

interface RolesDetailsProps {
  adminId: string;
  admin: {
    firstname: string;
    lastname: string;
    email: string;
    phonenumber: string;
    super_admin: boolean;
    status: boolean;
  };
}

export default function AssignRole() {
  const router = useRouter();
  const { id } = router.query;
  const [adminDetails, setAdminDetails] = useState<
    RolesDetailsProps["admin"] | null
  >(null);
  const [fetchedDepartments, setFetchedDepartments] = useState<DocumentData[]>(
    []
  );
  const [fetchedPermisions, setFetchedPermisions] = useState<DocumentData[]>(
    []
  );

  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (id) {
        try {
          const adminDocRef = doc(fbDb, "admins", id as string);
          const adminDocSnap = await getDoc(adminDocRef);
          if (adminDocSnap.exists()) {
            const adminData = adminDocSnap.data() as RolesDetailsProps["admin"];
            setAdminDetails(adminData);
          }
        } catch (error) {
          console.error("Error fetching admin:", error);
        }
      }
    };

    const fetchDepartments = async () => {
      try {
        const querySnapshot = await getDocs(collection(fbDb, "departments"));
        const departmentsData: DocumentData[] = [];
        querySnapshot.forEach((doc) => {
          const department = {
            id: doc.id,
            ...doc.data(),
          };
          departmentsData.push(department);
        });
        setFetchedDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    const fetchPermissions = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
    fetchDepartments();
    fetchAdminDetails();
  }, [id]);

  function handleAddDepartment() {}
  function handleAddPermisions() {}

  if (!adminDetails) {
    return <div>Loading...</div>;
  }

  return (
    <SiteLayout>
      <div className="bg-[#FAFAFB] h-full text-[#030229]">
        <p className="text-lg font-nunito flex justify-center font-bold mt-2  ml-7">{`${adminDetails.firstname} ${adminDetails.lastname}`}</p>
        <div className="flex flex-col">
          <div className="rounded-md  flex justify-center shadow-md bg-[#FFFFFF] ml-5 mt-5 ">
            <div className="bg-[#FFFFFF] flex flex-row py-5">
              <div className="flex flex-col mt-5 ">
                {/* <img className=' w-20 h-20 rounded-full border border-gray-600' src="user.png"/> */}
                <div className="text-gray-600">
                  <i className="fa fa-user-circle fa-3x" aria-hidden="true"></i>
                </div>

                <p className="font-nunito font-regular text-sm text-[#030229] font-nunito font-bold">{`${adminDetails.firstname} ${adminDetails.lastname}`}</p>
                <p className="font-nunito font-regular text-sm text-[#030229]">
                  {adminDetails.email}
                </p>
                <p className="font-nunito font-regular text-sm text-[#030229]">
                  {adminDetails.phonenumber}
                </p>
              </div>
              <div className="w-full ml-10 flex flex-col">
                <div className=" mt-5 px-10 flex flex-row mb-5">
                  <div>
                    <p className="font-nunito font-regular text-sm font-nunito font-regular">
                      Start Date
                    </p>
                    <p className="font-nunito font-regular text-sm text-[#030229] font-nunito font-bold">
                      May14 / 2:35
                    </p>
                  </div>
                  <div className="ml-14">
                    <p className="font-nunito font-regular text-sm font-nunito font-regular">
                      End Date
                    </p>
                    <p className="font-nunito font-regular text-sm text-[#030229] font-nunito font-bold">
                      May14 / 12:40
                    </p>
                  </div>
                </div>
                <div className=" mt-5  px-10 flex flex-row mb-5">
                  <div>
                    <p className="font-nunito font-regular text-sm font-nunito font-regular">
                      Distance Covered
                    </p>
                    <p className="font-nunito font-regular text-sm text-[#030229] font-nunito font-bold">
                      501.4mi
                    </p>
                  </div>
                  <div className="ml-10">
                    <p className="font-nunito font-regular text-sm font-nunito font-regular">
                      Distance Covered
                    </p>
                    <p className="font-nunito font-regular text-sm text-[#030229] font-nunito font-bold">
                      10h 5min
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="mt-10 ml-5 w-2/5">
              <div className="shadow-md bg-[#FFFFFF] rounded-md ">
                <div className="flex flex-row divide-y divide-solid flex space-x-20">
                  <p className="text-base font-nunito font-bold ml-2 mr-20 mt-2">
                    Department
                  </p>
                  <Button
                    className="rounded bg-d-green w-[80px] h-6 uppercase text-white font-semibold flex items-center py-4 px-4 ml-20 mr-2 mt-2"
                    handleClick={handleAddDepartment}
                  >
                    <PlusIcon className="h-10 w-10 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="bg-[#FAFAFB] mt-1 mr-2 ml-2 mb-2 ">
                  <DepartmentsTable
                    departments={fetchedDepartments}
                    updateFetchedDepartments={(updatedDepartments) =>
                      setFetchedDepartments(updatedDepartments)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-7 w-2/5 ml-32 ">
              <div className="shadow-md bg-[#FFFFFF] rounded-md">
                <div className="flex flex-row divide-y divide-solid mt-4">
                  <p className="text-base font-nunito font-bold ml-2 mr-20 mt-2">
                    Permisions
                  </p>
                  <Button
                    className="rounded bg-d-green w-[80px] h-6 uppercase text-white font-semibold flex items-center py-4 px-4 ml-20 mr-2 mt-2"
                    handleClick={handleAddPermisions}
                  >
                    <PlusIcon className="h-10 w-10 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="bg-[#FAFAFB] mt-1 mr-2 ml-2 mb-2 ">
                  <PermissionsTable permissions={fetchedPermisions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

interface DepartmentsTableProps {
  departments: DocumentData[];
  updateFetchedDepartments: (updatedDepartments: DocumentData[]) => void;
}

export function DepartmentsTable({
  departments,
  updateFetchedDepartments,
}: DepartmentsTableProps) {
  return (
    <table className=" mr-2">
      <tbody>
        {departments.map((department, index) => {
          return (
            <tr key={index} className="h-10">
              <td className="ml-2">{department.name}</td>
              <div className="ml-20">
                <BodyCell>
                  <XMarkIcon className="h-6 w-6 text-crimson-red" />
                </BodyCell>
              </div>

              <td></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface PermissionsTableProps {
  permissions: DocumentData[];
}

export function PermissionsTable({ permissions }: PermissionsTableProps) {
  return (
    <table className="mr-2">
      <tbody>
        {permissions.map((permission, index) => {
          return (
            <tr key={index} className="h-10">
              <td className="ml-2">{permission.name}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
