import {Doughnut, Pie} from 'react-chartjs-2';
import {Chart as ChartJS, ArcElement, Tooltip, ScriptableContext} from 'chart.js';
import {ChevronDownIcon} from "@heroicons/react/24/solid";
import {AnyObject} from "chart.js/dist/types/basic";
import {FormEvent, Fragment, useEffect, useState} from "react";
import { DocumentData, collection, getDocs } from "firebase/firestore";
import { fbDb } from "@/firebase/configs"; 
import { log } from 'console';

ChartJS.register(ArcElement, Tooltip);

interface dataset {
    datasets: {
        backgroundColor: string[];
        data: number[];
        borderJoinStyle: "round" | "bevel" | "miter" | ((ctx: ScriptableContext<"doughnut">, options: AnyObject) => CanvasLineJoin | undefined) | undefined;
        borderWidth: number;
        borderRadius: number;
        radius: number;
    }[];
}



export default function VehicleOverview() {  
    const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);  

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
                console.log("Dashboard Fetched Vehicles",vehiclesData);
                

            } catch (error) {
                console.error('Error fetching Vehicles:', error);
            }
        };
        fetchedVehicles();
    }, []); 
const allVehicles= fetchedVehicles.length 
console.log("All Vehicles",allVehicles);

const onRouteCount = fetchedVehicles.filter((vehicle) => vehicle.availability_status === "On Route").length;
console.log("Vehicles On Route",onRouteCount);

const outOfServiceCount = fetchedVehicles.filter((vehicle) => vehicle.availability_status === "Out Of Service").length;
console.log("Vehicles Out of Service",outOfServiceCount);

const availableCount = fetchedVehicles.filter((vehicle) => vehicle.availability_status === "Available").length;
console.log("Available Vehicles",availableCount);

    const data:dataset = {
        datasets: [
            {
                backgroundColor: ['#165DFF', '#F7F8FA'],
                data: [availableCount, allVehicles],
                borderJoinStyle: "round",
                borderWidth: 0,
                borderRadius: 100,
                radius: 80,
            },
            {
                backgroundColor: ['#FFC107', '#F7F8FA'],
                data: [outOfServiceCount, fetchedVehicles.length - outOfServiceCount],
                borderJoinStyle: "round",
                borderWidth: 0,
                borderRadius: 100,
                radius: 70
            },
            {
                backgroundColor: ['#C9E2FF', '#F7F8FA'],
                data: [onRouteCount, fetchedVehicles.length - onRouteCount],
                borderJoinStyle: "round",
                borderWidth: 0,
                borderRadius: 100,
                radius: 60
            },
        ],
    };
    const options = {
        responsive:true,
        cutout: 95, 
    }

    return (
        <>
                <div className="w-1/3 mt-8 grid mr-4">
                <div className=" ">
                    {/* Description list*/} 
                    <section aria-labelledby="applicant-information-title ">
                        <div className="bg-white shadow sm:rounded-lg lg:min-h-[300px]">
                            <div className="px-4 py-4 sm:px-6 flex w-full items-center justify-between">
                                <h2 id="applicant-information-title" className="text-lg font-bold leading-6">
                                    Vehicle Overview
                                </h2>
                                <div className='text-sm flex items-center'>
                                    This Week
                                    <ChevronDownIcon className='ml-2 h-4 w-4'/>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 flex flex-row items-center">
                                <div className=''>
                                    <Doughnut data={data} options={options} className='!bg-white'/>
                                </div>
                                <div className=''>
                                    <div className='font-bold text-xl'>Total</div>
                                    <div className='font-bold text-2xl'>{allVehicles}</div>

                                    <div className='flex items-center  w-full mt-6'>
                                        <div className='h-4 w-4 rounded-md bg-d-blue mr-4'></div>
                                        <div>Available</div>
                                        <div className='pl-10 mr-2'>{availableCount}</div>
                                    </div>
                                    <div className='flex items-center  w-full mt-4'>
                                        <div className='h-4 w-4 rounded-md bg-yellow mr-4'></div>
                                        <div>Under <br/>
                                            Maintenance</div>
                                        <div className='pl-4 mr-2'>{outOfServiceCount}</div>
                                    </div>
                                    <div className='flex items-center  w-full mt-4'>
                                        <div className='h-4 w-4 rounded-md bg-ll-blue mr-4'></div>
                                        <div>On Route</div>
                                        <div className='pl-10 mr-2'>{onRouteCount}</div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}
