import {Tab} from "@headlessui/react";
import {Fragment, useEffect, useState} from "react";
import {AddButton, DeleteBtn, EditBtn} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "../../../components/Table/Cells";
import { TableBody } from "../../../components/Table/Row";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router"; 
import { DocumentData, collection, getDocs } from 'firebase/firestore';
import { fbDb } from "@/firebase/configs";



export const tabs = [
    {name: "All"},
    {name: "Active"},
    {name: "InActive"},

]
const Headers = ["ADMIN ID", "NAME", "PHONE","STATUS","SUPER ADMIN"]


export default function Roles(){
    const [selectedTab, setSelectedTab] = useState<number>(0);  
    const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]); 


    const handleAddDriver = () => {
    }
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'admins'));
                const adminsData: DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    const admin = {
                        id: doc.id,
                        ...doc.data()
                    };
                    adminsData.push(admin);
                });
                setFetchedAdmins(adminsData);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };
    
        fetchAdmins();
    }, []);
    
    return (
        <>
            <div className='mt-8 max-h-[700px]'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'>
                            <Tab.List>
                                {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                    <Tab
                                        className='ui-selected:bg-d-green h-8 w-32 ui-not-selected:bg-white text-sm uppercase'
                                        onClick={() => {
                                            console.log("Tab Clicked", index);
                                            setSelectedTab(index);
                                          }}
                                        >
                                        {tab.name}
                                    </Tab>
                                    </Fragment>
                                    )
                                })
                                }
                            </Tab.List>
                        </div>
                        <div className='flex justify-end text-base mr-2'>
                          {/* <div className='ml-2'>
                            <AddButton name='Add Role' handleAddClick={handleAddDriver}/>
                            </div> */}
                        </div>

                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <RolesTable selectedTab={selectedTab} admins={fetchedAdmins} /> 

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <RolesTable selectedTab={selectedTab} admins={fetchedAdmins} /> 

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <RolesTable selectedTab={selectedTab} admins={fetchedAdmins} /> 

                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </div>
        </>
    )
} 



interface RolesTableProps {
    selectedTab: number;  
    admins: DocumentData[];

}

export function RolesTable({ selectedTab,admins }: RolesTableProps) {
        console.log("RolesTable Rendering with selectedTab:", selectedTab); 
        const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);

        const router=useRouter() 

    const filteredAdmins = admins.filter(admin =>
        selectedTab === 0 ||
        (selectedTab === 1 && admin.status) ||
        (selectedTab === 2 && !admin.status)
    ); 


    console.log("Filtered Vehicles:", filteredAdmins);
const handleReasign = (admin:any) => { 
    router.push(`/Administration/manage_roles/assignRole?id=${admin.id}`);

    }
    return (
        <>
            <Table>
                <>
                    <thead>
                    <tr className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-base  sm:pl-0">
                        {Headers.map((header, index) => {
                            return (
                                <Fragment key={index}>
                                    <HeaderCell>
                                        {header}
                                    </HeaderCell>
                                </Fragment>
                            )
                        })}
                    </tr>
                    </thead>
                    <TableBody>
                    {filteredAdmins.map((admin, index) => {
                         return (
                                <Fragment key={index}>
                                    <div className="w-full mb-2"></div>
                                    <tr className='border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] font-nunito font-regular'>
                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0 font-nunito font-regular">
                                            {admin.id}
                                        </td>
                                        <BodyCell>
                                        {`${admin.firstname} ${admin.lastname}`}
                                        </BodyCell>
                                        <BodyCell>{admin.phonenumber}</BodyCell>
                                        <BodyCell>{admin.status ? 'Active' : 'Inactive'}</BodyCell>
                                        <BodyCell>
                                            <>
                                                <div className='h-10 flex items-center '>
                                                    {admin.super_admin ?
                                                        <CheckCircleIcon className='h-8 w-8 text-d-green'/>
                                                        :
                                                        <XCircleIcon className='h-8 w-8 text-crimson-red'/>
                                                    }
                                                </div>

                                            </>
                                        </BodyCell>

                                        <td>
                                            <button className="text-sm text-slate-400 mt-2 px-2 py-2  rounded bg-gray-100" onClick={()=>handleReasign(admin)}>Assign Role</button>
                                    </td>                                    


                                    </tr>
                                </Fragment>
                            )
                    })}
                </TableBody>

                </>
            </Table>
        </>
    )
}

