import {DeleteBtn, EditBtn} from "@/components/Buttons";
import {Fragment, ReactNode} from "react";
import { TableBody } from "@/components/Table/Row";

interface Props {
    children: ReactNode
}

const vehicles = [
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    }, 
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'On Route',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    }, 
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Out Of Service',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    }, 
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'On Route',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Out Of Service',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'On Route',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    }, 
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'On Route',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Out Of Service',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    }, 
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Out Of Service',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
]

export default function Table({children}: Props) {
    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                                {children}
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


interface VehiclesTableProps {
    selectedTab: number; 
}

export function DummyTable({ selectedTab }: VehiclesTableProps) {
        console.log("VehiclesTable Rendering with selectedTab:", selectedTab);

    const filteredVehicles = vehicles.filter(vehicles =>
        selectedTab === 0 ||
        (selectedTab === 1 && vehicles.status === 'On Route') ||
        (selectedTab === 2 && vehicles.status === 'Available') ||
        (selectedTab === 3 && vehicles.status === 'Out Of Service') ||
        (selectedTab === 4 && vehicles ) ||
        (selectedTab === 5 && vehicles )
    );

    console.log("Filtered Vehicles:", filteredVehicles); 
    return (
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
                                        Fuel Consumptions
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
 
                            <tbody  className="divide-y divide-gray-200 bg-white">
                            {filteredVehicles.map((vehicle, index) => { 
                                return(
                                    <tr key={vehicle.id} className='my-2'>
                                        <td className="whitespace-nowrap text-center align-middle  pl-4 pr-3 !pt-2 text-d-blue sm:pl-0">{vehicle.id}</td>
                                        <td className="whitespace-nowrap px-2 p-2 text-center align-middle  pt-4 font-medium ">
                                            {vehicle.name}
                                        </td>
                                        <td className="whitespace-nowrap p-2  text-center align-middle px-2 pt-2 relative">
                                        <div className={`rounded-full inline-block h-8 absolute transform -translate-y-1/2 ${vehicle.status === 'Available' ? 'bg-[#E2E9FB] text-[#0068DD]' : (vehicle.status === 'On Route' ? 'bg-[#B9F3EE] text-[#076960]' : 'bg-[#EAEAEA] text-[#364250]')}`} style={{ width: `${vehicle.status.length * 8}px`, left: '-8px' }}>
                                                <span className="absolute inset-0 flex items-center justify-center">
                                                    {vehicle.status}
                                                </span>
                                            </div> 
                                            </td>    
                                        <td className="whitespace-nowrap p-2 text-center align-middle px-2 pt-4">{vehicle.reg_date}</td>
                                        <td className="whitespace-nowrap p-2 text-center align-middle px-2 pt-4">{vehicle.supplier}</td>
                                        <td className="whitespace-nowrap p-2 text-center align-middle pl-14 pt-4">{vehicle.consumption}</td>
                                        <td className="whitespace-nowrap p-2 text-center align-middle pl-8 pt-4 text-lg font-bold text-black">{vehicle.trips} Trips</td>
                                        <td className="relative  p-2 text-center align-middle whitespace-nowrap pt-6 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 flex justify-around">
                                            <EditBtn />
                                            <DeleteBtn />
                                            <div className='h-12'></div>
                                        </td>
                                    </tr>
                            )
                        })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}



export function TripsTable() {
    return ( 
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left  font-semibold  sm:pl-0"
                                >
                                    Trip ID
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Name
                                </th>

                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Pick Up
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Drop off
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Distance
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Duration
                                </th>
                                <th scope="col" className="whitespace-nowrap py-3.5 px-2 text-left pr-4 sm:pr-0">
                                    Trip Cost
                                </th>

                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Status
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id}>
                                    <td className="whitespace-nowrap py-2 pl-4 pr-3  text-d-blue sm:pl-0">{vehicle.id}</td>
                                    <td className="whitespace-nowrap px-2 py-4 text-lg font-medium ">
                                        David Mwangi
                                    </td>
                                    <td className="whitespace-nowrap px-2 py-2  ">Mombasa</td>
                                    <td className="whitespace-nowrap px-2 py-2  ">{vehicle.supplier}</td>
                                    <td className="whitespace-nowrap px-2 py-2  ">100KM</td>
                                    <td className="whitespace-nowrap px-2 py-2  ">{vehicle.consumption} Hours</td>
                                    <td className="whitespace-nowrap px-2 py-2   text-black">Ksh.250000</td>
                                    <td className="whitespace-nowrap py-2  px-2 text-left font-medium">
                                        On Route
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ClientsTable() {
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left  font-semibold  sm:pl-0"
                                >
                                    Client ID
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Name
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Expenses
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Profit
                                </th>

                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id}>
                                    <td className="whitespace-nowrap pl-4 pr-3 py-4 text-d-blue sm:pl-0">{vehicle.id}</td>
                                    <td className="whitespace-nowrap px-2 py-2  font-medium ">
                                        Kioni
                                    </td>
                                    <td className="whitespace-nowrap px-2 py-2  ">Ksh.250000</td>
                                    <td className="whitespace-nowrap px-2 py-2  ">Ksh.250000</td>


                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
 )
}
