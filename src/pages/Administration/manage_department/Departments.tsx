import {Tab} from "@headlessui/react";
import {Fragment} from "react";
import {AddButton} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { BodyCell, HeaderCell } from "../../../components/Table/Cells";
import { TableBody } from "../../../components/Table/Row";



const Headers = ["DRIVER ID", "NAME", "MEMBERS", "PERMISIONS","UPDATED"," STATUS"]
const departments = [
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        members: "8",
        permisions: "+25478637853",
        updated:"6 months ago",
        status: false,
    },
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        members: "8",
        permisions: "+25478637853",
        updated:"6 months ago",
        status: false,
    },
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        members: "8",
        permisions: "+25478637853",
        updated:"6 months ago",
        status: false,
    },
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        members: "8",
        permisions: "+25478637853",
        updated:"6 months ago",
        status: false,
    },
    {
        driver_id: "789797",
        name: "Leonard Omsula",
        members: "8",
        permisions: "+25478637853",
        updated:"6 months ago",
        status: false,
    },
]

export default function Departments(){
    const handleAdd = () => {
    }  

    return (
        <>
            <div className='mt-8 max-h-[700px]'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'>
             
                        </div>

                        <div className='flex justify-end text-base mr-2'>
                          <div className='ml-2'>
                            <AddButton name='Add' handleAddClick={handleAdd}/>
                            </div>
                        </div>

                    </div>

                    <Tab.Panels>

                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DepartmentsTable/>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </div>
        </>
    )
} 


function DepartmentsTable() { 
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
                        {departments.map((departments, index) => {
                            return (
                                <Fragment key={index}>
                                    <tr className='text-base'>
                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                                            {departments.driver_id}
                                        </td>
                                        <BodyCell>
                                        {departments.name}
                                        </BodyCell>
                                        <BodyCell>{departments.members}</BodyCell>
                                        <BodyCell>{departments.permisions}</BodyCell>
                                        <BodyCell>{departments.updated}</BodyCell>
                                        <BodyCell>{departments.status ? 'Active' : 'Inactive'}</BodyCell>

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


