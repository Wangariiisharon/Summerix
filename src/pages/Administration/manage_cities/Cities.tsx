import {Tab} from "@headlessui/react";
import {Fragment} from "react";
import {AddButton} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { HeaderCell, BodyCell } from "../../../components/Table/Cells";
import { TableBody } from "../../../components/Table/Row";
import { SearchBar } from "@/components/Forms/input";


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
        <p className="text-lg ml-8 font-bold">Cities</p> 
        <div className='flex  text-base mt-2 ml-8 w-72 searchBarContainer'>
           <SearchBar name='admins_searchbar' placeholder='Search name, id, phone' /> 
        </div>
        <div className="flex justify-end mr-20 bg-[#FAFAFB]">
            <p>Nairobi,Kenya</p> 
           <i className="fa fa-angle-down" aria-hidden="true"></i>
           </div>


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
                                    <div className='w-full mb-2'></div>
                                    <tr className='border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>
                                    <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0 font-nunito font-regular">
                                            {cities.client_id}
                                        </td>
                                        <BodyCell>
                                            {cities.name}
                                        </BodyCell>
                                        <BodyCell>{cities.expenses}</BodyCell>
                                        <BodyCell>{cities.profit}</BodyCell> 
                                        <div className='h-10'></div>
    
                                    </tr> 
                                    {/* </div> */}
                                </Fragment>
                            )
                        })}
                    </TableBody>
                </>
            </Table>
        </>
    )
}

