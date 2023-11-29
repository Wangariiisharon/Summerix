import {ChevronRightIcon, SignalIcon} from "@heroicons/react/20/solid";
import { DocumentData, collection, getDocs } from "firebase/firestore";
import { fbDb } from "@/firebase/configs";  
import {FormEvent, Fragment, useEffect, useState} from "react";


const people = [
    {
        name: 'Vehicle out of service',
        title: '25',
        department: '',
        email: '',
        role: '',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },

    // More people...
]
interface VehicleData {
    id: string;
    availability_status: string;  
    // pick_up_location: string;
    // drop_off_location: string; 

     // Add other properties as needed
    // Add other properties specific to your vehicle data
}
export default function OutOfService() {  
    const [fetchedVehicles, setFetchedVehicles] = useState<VehicleData[]>([]);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'vehicles'));
                const vehiclesData: VehicleData[] = [];

                querySnapshot.forEach((doc) => {
                    const vehicle = {
                        id: doc.id,
                        availability_status: doc.data().availability_status,

                        ...doc.data()
                    };
                    // Check if the vehicle's status is "Out Of Service"
                    if (vehicle.availability_status === 'Out Of Service') {
                        vehiclesData.push(vehicle);
                    }
                });

                setFetchedVehicles(vehiclesData);
            } catch (error) {
                console.error('Error fetching Vehicles:', error);
            }
        };

        fetchVehicles();
    }, []); 
    const outOfService=fetchedVehicles.length
    return (
        <> 
        {/* w-1/2 mt-8 grid max-w-3xl lg:max-w-7xl */}
        {/* bg-white shadow rounded-lg w-1/3 ml-2 */}
            <div className='mt-8 bg-white shadow rounded-lg w-1/2 ml-2'>
                <div className="px-4 pt-8 sm:px-6">
                    <h2 id="applicant-information-title" className="text-lg font-bold leading-6">
                        Out Of Service
                    </h2>
                    <div className="text-gray-500 text-sm">
                        Out of Order Vehicles
                    </div>
                </div>
                <div className="px-4 py-5 sm:px-6   ">
                    <div className='font-extrabold text-xl'>{outOfService}</div>
                    <div className="text-gray-500 text-sm">
                        Vehicles total
                    </div>


                    <div className=" ">
                        <div className=" overflow-x-auto w-full">
                            <div className="inline-block min-w-full py-2 align-middle ">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                    <tr>
                                        <th scope="col"
                                            className="py-3.5 pl-4 pr-3 text-left text-sm text-gray-300 sm:pl-0">
                                        </th>

                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-400 bg-white">
                                    {fetchedVehicles.map((vehicle,index) => (
                                        <tr key={index}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3  sm:pl-0">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="font-bold">Vehicle out of service</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                                                <div className="font-bold">{outOfService}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <ChevronRightIcon className='h-6 w-6 font-extrabold'/>
                                            </td>


                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
