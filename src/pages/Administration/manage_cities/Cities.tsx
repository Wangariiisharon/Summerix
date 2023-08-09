import {Tab} from "@headlessui/react";
import {Fragment} from "react";
import {AddButton} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { HeaderCell, BodyCell } from "../../../components/Table/Cells";
import { TableBody } from "../../../components/Table/Row";

export const tabs = [
    {name: "All"},
    {name: "Active"},
    {name: "InActive"},

]
const Headers = ["CLIENT ID", "NAME", "EXPENSES", "PROFIT"]
const cities = [
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
]

export default function Cities(){
    const handleAdd = () => {
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
                            Search bar
                        </div>
                        <div className='ml-8'>
                            <AddButton name='Add Admin' handleAddClick={handleAdd}/>
                        </div>

                    </div>

                        <Tab.Panel>
                            <div  className="max-h-[500px] overflow-y-auto">
                            <CitiesTable/>
                            </div>
                        </Tab.Panel>
                </Tab.Group>

            </div>
        </>
    )
} 

function CitiesTable() {
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
                        {cities.map((cities, index) => {
                            return (
                                <Fragment key={index}>
                                    <tr className=' text-base'>
                                    <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                                            {cities.client_id}
                                        </td>
                                        <BodyCell>
                                            {cities.name}
                                        </BodyCell>
                                        <BodyCell>{cities.expenses}</BodyCell>
                                        <BodyCell>{cities.profit}</BodyCell>
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

