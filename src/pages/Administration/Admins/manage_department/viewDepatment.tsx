import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import React, { Fragment, useEffect, useState } from "react";
import { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router";
import SiteLayout from "@/Layout/SiteLayout";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Buttons";
import { Example } from "@/components/Cards/template";
import { BodyCell } from "@/components/Table/Cells";
import { formatDistanceToNow } from "date-fns";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

interface DepatmentDetailsProps {
  departmentId: string;
  department: {
    name: string;
    members: number;
    permissions: number;
    update: Date;
  };
}

function createData(
  id: string,
  name: string,
  AddedAt: string,
  Action: React.ReactNode | null
) {
  return { name, id, AddedAt, Action };
}

const action = (
  <i className="fa-sharp fa-solid fa-rectangle-xmark text-[#F34C4C] text-sm"></i>
);

const rows = [createData("11", "Dina Morad", "6 months ago", action)];

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
  const router = useRouter();
  const { id } = router.query;
  function handleAddPermissions() {}
  function handleAddMembers() {}

  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      if (id) {
        try {
          const depatmentDocRef = doc(fbDb, "departments", id as string);
          const depatmentDocSnap = await getDoc(depatmentDocRef);

          if (depatmentDocSnap.exists()) {
            const depatmentData =
              depatmentDocSnap.data() as DepatmentDetailsProps["department"];
            console.log(depatmentData);

            setdepartments(depatmentData);
          } else {
            console.log("Department not found");
          }
        } catch (error) {
          console.error("Error fetching Department:", error);
        }
      }
    };

    const fetchPermissions = async () => {
      try {
        const querySnapshot = await getDocs(collection(fbDb, "permisions"));
        const permissionsData: DocumentData[] = [];
        console.log(permissionsData);

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

    fetchDepartmentDetails();
    fetchPermissions();
  }, [id]);
  console.log("Department Update Date:", departments?.update);

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
            <div className="flex justify-between mt-10">
              <div>
                <div className="">
                  <PermissionsTable
                    permissions={fetchedPermisions}
                    heading={departments?.name ?? "Default Heading"}
                  />
                </div>
              </div>

              <div>
                <AllPermissionsTable
                  permissions={fetchedPermisions}
                  heading="Permisions"
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
  permissions: DocumentData[];
  heading: string;
}

function PermissionsTable({ permissions, heading }: PermissionsTableProps) {
  return <Example heading={heading} list={permissions}></Example>;
}
interface AllPermissionsTableProps {
  permissions: DocumentData[];
  heading: string;
}
function AllPermissionsTable({
  permissions,
  heading,
}: AllPermissionsTableProps) {
  return <Example heading={heading} list={permissions}></Example>;
}
// interface PermissionsTableProps {
//   permissions: DocumentData[];
// }

// export function PermissionsTable({ permissions }: PermissionsTableProps) {
//   return (
//     <Table sx={{ minWidth: 400 }} aria-label="simple table">
//       <tbody>
//         {permissions.map((permission, index) => {
//           return (
//             <tr key={index} className="h-10">
//               <td className="ml-2">{permission.name}</td>
//             </tr>
//           );
//         })}
//       </tbody>
//     </Table>
//   );
// }
