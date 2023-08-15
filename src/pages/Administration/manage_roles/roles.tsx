import {Tab} from "@headlessui/react";
import {Fragment, useState} from "react";
import {AddButton, DeleteBtn, EditBtn} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "../../../components/Table/Cells";
import { TableBody } from "../../../components/Table/Row";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { SearchBar } from "@/components/Forms/input";


export const tabs = [
    {name: "All"},
    {name: "Active"},
    {name: "InActive"},

]
const Headers = ["DRIVER ID", "NAME", "CITY", "PHONE","STATUS","SUPER ADMIN"]
const roles = [
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        city: "Nairobi",
        phone: "+25478637853",
        status: true,
        super_admin: false,
    },
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        city: "Nairobi",
        phone: "+25478637853",
        status: false,
        super_admin: true,
    },
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        city: "Nairobi",
        phone: "+25478637853",
        status: true,
        super_admin: false,
    },
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        city: "Nairobi",
        phone: "+25478637853",
        status: false,
        super_admin: true,
    },
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        city: "Nairobi",
        phone: "+25478637853",
        status: false,
        super_admin: true,
    },
]

export default function Roles(){
    const [selectedTab, setSelectedTab] = useState<number>(0); 

    const handleAddDriver = () => {
    }

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
                          <div className='ml-2'>
                            <AddButton name='Add Role' handleAddClick={handleAddDriver}/>
                            </div>
                        </div>

                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <RolesTable selectedTab={selectedTab} />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <RolesTable selectedTab={selectedTab} />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <RolesTable selectedTab={selectedTab} />

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
}

export function RolesTable({ selectedTab }: RolesTableProps) {
        console.log("RolesTable Rendering with selectedTab:", selectedTab);

    const filteredRoles = roles.filter(roles =>
        selectedTab === 0 ||
        (selectedTab === 1 && roles.status) ||
        (selectedTab === 2 && !roles.status)
    );

    console.log("Filtered Vehicles:", filteredRoles);
const handleReasign = () => {
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
                    {filteredRoles.map((roles, index) => {
                         return (
                                <Fragment key={index}>
                                    <tr className='text-base'>
                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                                            {roles.driver_id}
                                        </td>
                                        <BodyCell>
                                        {roles.name}
                                        </BodyCell>
                                        <BodyCell>{roles.city}</BodyCell>
                                        <BodyCell>{roles.phone}</BodyCell>
                                        <BodyCell>{roles.status ? 'Active' : 'Inactive'}</BodyCell>
                                        <BodyCell>
                                            <>
                                                <div className='h-16 flex items-center '>
                                                    {roles.super_admin ?
                                                        <CheckCircleIcon className='h-8 w-8 text-d-green'/>
                                                        :
                                                        <XCircleIcon className='h-8 w-8 text-crimson-red'/>
                                                    }
                                                </div>

                                            </>
                                        </BodyCell>

                                        <td>
                                            <button className="text-sm text-slate-400 mt-2 px-2 py-2  rounded bg-gray-100 ">Assign Role</button>
                                        <div className='h-12'></div>
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

