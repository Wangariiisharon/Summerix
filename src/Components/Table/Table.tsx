import {DeleteBtn, EditBtn} from "@/components/Buttons";
import {Fragment, ReactNode} from "react";

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
    }, {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    }, {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    }, {
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
    }, {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
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


export function DummyTable() {
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
                                    Vehicle ID
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
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left font-semibold "
                                >
                                    Registration Date
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Supplier
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Fuel Consumptions
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Trips Completed
                                </th>
                                <th scope="col" className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only"></span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {vehicles.map((vehicle, index) => (

                                <tr key={vehicle.id} className='my-4'>
                                    <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue sm:pl-0">{vehicle.id}</td>
                                    <td className="whitespace-nowrap px-2  pt-4 font-medium ">
                                        {vehicle.name}
                                    </td>
                                    <td className="whitespace-nowrap px-2 pt-4  ">{vehicle.status}</td>
                                    <td className="whitespace-nowrap px-2 pt-4  ">{vehicle.reg_date}</td>
                                    <td className="whitespace-nowrap px-2 pt-4  ">{vehicle.supplier}</td>
                                    <td className="whitespace-nowrap pl-14 pt-4  -">{vehicle.consumption}</td>
                                    <td className="whitespace-nowrap pl-8 pt-4 text-lg font-bold text-black">{vehicle.trips} Trips</td>
                                    <td className="relative whitespace-nowrap pt-6 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 flex justify-around">
                                        <EditBtn/>
                                        <DeleteBtn/>
                                        <div className='h-12'></div>
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
                                        Bamburi
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
