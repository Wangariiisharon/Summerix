import {Header, HeaderBar} from "@/components/Headers";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons";
import {headers} from "next/headers";
// import {DummyTable} from "@/components/Table/Table";
import {FormEvent, Fragment, useEffect, useState} from "react";
import {FormModal} from "@/components/Modals/FormModal";
import {Form} from "@/components/Forms/Form";
import {Input, Submit} from "@/components/Forms/input";
import SiteLayout from "@/Layout/SiteLayout";
import {XMarkIcon} from "@heroicons/react/24/outline";
import { Tab } from "@headlessui/react";
// import { MaintananceTable } from "./maintanance";
import { DocumentData, collection, getDocs } from "firebase/firestore";
import { fbDb } from "@/firebase/configs"; 
import { parseISO, format } from 'date-fns';
import Maintenance from "./maintanance";
import VehicleAllocation from "./vehicle_allocation";




const Headers = [
    {
        name: "All Status",
        active: true
    },
    {
        name: "On Route ",
        active: false
    },
    {
        name: "Available",
        active: false
    },
    {
        name: "Out of Service",
        active: false
    },
    {
        name: "Maintenance",
        active: false
    },
    {
        name: "Vehicle Allocation",
        active: false
    },
]


export default function VehiclesComponent() {
    const [open, setOpen] = useState(false)
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);  


    const handleAddClick = () => {
        setOpen(true)
    }
    const handleSubmit = () => {
        //validate form
        setOpen(false)
        //submit form
    }
    const handleReset = () => {
        setOpen(false)
    } 
    useEffect(() => {
        const fetchedVehicles = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'vehicles'));
                const vehiclesData: DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    const vehicle = {
                        id: doc.id,
                        ...doc.data()
                    };
                    vehiclesData.push(vehicle);
                });
                setFetchedVehicles(vehiclesData);
            } catch (error) {
                console.error('Error fetching Vehicles:', error);
            }
        };
    
        fetchedVehicles();
    }, []);



    return (
        
             <SiteLayout>
            <div className='bg-[#FAFAFB]'>

                <p className="text-lg font-nunito font-bold mt-2 ml-5">Vehicles</p>

                <div className='mt-4'> 
                <Tab.Group>
                    <Tab.List className="w-full flex justify-around mb-3"> 
                                {Headers.map((header, index) => {
                                    return (
                                        <Fragment key={index}>
                                    <Tab
                                        className='ui-selected:border-b-4 border-d-green outline-none
                                            ui-selected:text-d-green text-sm font-bold uppercase flex flex-row'                                        onClick={() => {
                                            console.log("Tab Clicked", index);
                                            setSelectedTab(index);
                                          }}
                                        >
                                        {header.name}
                                    </Tab>
                                        </Fragment>
                                    )
                                })
                                }
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <Maintenance />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <VehicleAllocation/>

                            </div>
                        </Tab.Panel>

                    </Tab.Panels>
                </Tab.Group> 
                </div> 
                <div>
                </div>
            
            </div>

            </SiteLayout>   
    )
}




interface VehiclesTableProps {
    selectedTab: number;  
    vehicles: DocumentData[];

}

export function DummyTable({ selectedTab,vehicles }: VehiclesTableProps) {
        console.log("VehiclesTable Rendering with selectedTab:", selectedTab);

    const filteredVehicles = vehicles.filter(vehicles =>
        selectedTab === 0 ||
        (selectedTab === 1 && vehicles.availability_status === 'On Route') ||
        (selectedTab === 2 && vehicles.availability_status === 'Available') ||
        (selectedTab === 3 && vehicles.availability_status === 'Out Of Service') ||
        (selectedTab === 4 && vehicles ) ||
        (selectedTab === 5 && vehicles )
    );

    console.log("Filtered Vehicles:", filteredVehicles); 
    return ( 
        <div className="bg-[#FAFAFB] h-400 w-100%">
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full  divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap  p-2 text-center align-middle   text-left font-semibold sm:pl-0"
                                    >
                                        Vehicle ID
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap  p-2 text-center align-middle  text-left font-semibold"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap  p-2 text-center align-middle  text-left font-semibold"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap  p-2 text-center align-middle  text-left font-semibold"
                                    >
                                        Registration Date
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap  p-2 text-center align-middle  text-left font-semibold"
                                    >
                                        Supplier
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap  p-2 text-center align-middle text-left font-semibold"
                                    >
                                        Fuel 
                                        {/* Consumptions */}
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap  p-2 text-center align-middle  text-left font-semibold"
                                    >
                                        Trips Completed
                                    </th>
                                    <th scope="col" className="relative p-2  text-center align-middle whitespace-nowrap  sm:pr-0">
                                        <span className="sr-only"></span>
                                    </th>
                                </tr>
                            </thead>
 
                            <tbody  className="divide-y divide-gray-200  bg-[#FAFAFB]">
                            {filteredVehicles.map((vehicle, index) => {  
                                const { seconds } = vehicle.registration_date; 
                                const updatedDate = new Date(seconds * 1000);
                                return( 
                                    // <tr className='border-solid border-2 border-[#D9E2F6] h-10 font-nunito font-regular'>
                                    <Fragment key={index}>  
                                    <div className="w-full mb-2 font-nunito font-regular"></div>
                                    <tr key={vehicle.id} className='my-2 border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>
                                        <td className="whitespace-nowrap text-center align-middle  pl-4 pr-3 !pt-2 text-d-blue sm:pl-0">{vehicle.id}</td>
                                        <td className="whitespace-nowrap px-2 p-2 text-left text-center align-middle pt-4 font-medium ">
                                            {vehicle.name}
                                        </td>
                                        <td className="whitespace-nowrap p-2 text-left px-2 pt-2 relative">
                                        <div className={`rounded-full inline-block text-sm	 h-8 absolute transform -translate-y-1/2 ${vehicle.availability_status === 'Available' ? 'bg-[#E2E9FB] text-[#0068DD]' : (vehicle.availability_status === 'On Route' ? 'bg-[#B9F3EE] text-[#076960]' : 'bg-[#EAEAEA] text-[#364250]')}`} style={{ width: `${vehicle.availability_status.length * 8}px`, left: '-8px' }}>
                                                <span className="absolute inset-0 flex items-center justify-center">
                                                    {vehicle.availability_status}
                                                </span>
                                            </div> 
                                            </td> 
    
                                            <td className="whitespace-nowrap p-2 text-left  px-2 pt-4">
                                            {format(updatedDate, 'MM/dd/yy')}
                                           </td>
                                        <td className="whitespace-nowrap p-2  text-left px-2 pt-4">{vehicle.supplier}</td>
                                        <td className="whitespace-nowrap p-2 text-center align-middle text-left pt-4">{vehicle.fuel_budget}</td>
                                        <td className="whitespace-nowrap p-2 text-center align-middle  text-left pt-4 text-lg font-bold text-black">{vehicle.trips} Trips</td>
                                        {/* <td className="relative  p-2 text-center align-middle whitespace-nowrap pt-6 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 flex justify-around">
                                            <EditBtn />
                                            <DeleteBtn />
                                            <div className='h-12'></div>
                                        </td> */}
                                    </tr> 
                                    </Fragment>

                            )
                        })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div> 
        </div> 

    )
}

