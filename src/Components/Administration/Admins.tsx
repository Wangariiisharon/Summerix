import {Tab} from "@headlessui/react";
import {AddButton} from "@/components/Buttons";
import {Fragment} from "react";
import {SearchBar} from "../Forms/input";
import Table, {DummyTable} from "../Table/Table";
import {BodyCell, HeaderCell} from "../Table/Cells";
import {TableBody} from "../Table/Row";
import {CheckCircleIcon, XCircleIcon} from "@heroicons/react/24/outline";
import {useRouter} from "next/router";

export const tabs = [
    {name: "All"},
    {name: "Active"},
    {name: "InActive"},

]
const Headers = ["Id", "Name", "City", "Phone", "Status", "Super Admin"]
const admins = [
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: true

    },
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: false,
        superAdmin: false

    },
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: false

    },
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: true

    },
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: true

    },
]

export function Admins() {
    const router = useRouter()
    const handleAdd = () => {
        router.push('/Administration/AddAdmin')
    }

    return (
        <>
            <div className='mt-8'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'>
                            <Tab.List>
                                {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                            <Tab
                                                className='ui-selected:bg-d-green h-10 w-32  ui-not-selected:bg-white uppercase'>
                                                {tab.name}
                                            </Tab>
                                        </Fragment>
                                    )
                                })
                                }
                            </Tab.List>
                        </div>
                        <div className='ml-8'>
                            <SearchBar name='admins_searchbar' placeholder='Search name, id, phone, email'/>
                        </div>
                        <div className='ml-8'>
                            <AddButton name='Add Admin' handleAddClick={handleAdd}/>
                        </div>

                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                            <AdminsTable/>
                        </Tab.Panel>
                        <Tab.Panel>
                            <AdminsTable/>
                        </Tab.Panel>
                        <Tab.Panel>
                            <AdminsTable/>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </div>
        </>
    )
}

function AdminsTable() {
    return (
        <>
            <Table>
                <>
                    <thead>
                    <tr>
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
                        {admins.map((admin, index) => {
                            return (
                                <Fragment key={index}>
                                    <tr className=' text-xl font-semibold '>
                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                                            {admin.id}
                                        </td>
                                        <BodyCell>
                                            {admin.name}
                                        </BodyCell>
                                        <BodyCell>{admin.city}</BodyCell>
                                        <BodyCell>{admin.phone}</BodyCell>
                                        <BodyCell>{admin.active ? 'Active' : 'Inactive'}</BodyCell>
                                        <BodyCell>
                                            <>
                                                <div className='h-16 flex items-center '>
                                                    {admin.superAdmin ?
                                                        <CheckCircleIcon className='h-8 w-8 text-d-green'/>
                                                        :
                                                        <XCircleIcon className='h-8 w-8 text-crimson-red'/>
                                                    }
                                                </div>

                                            </>
                                        </BodyCell>

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
