import React from 'react'


import {Header, HeaderBar} from "@/components/Headers";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons";
import {headers} from "next/headers";
import {DummyTable} from "@/components/Table/Table";
import {FormEvent, Fragment, ReactNode, useEffect, useState} from "react";
import {FormModal} from "@/components/Modals/FormModal";
import {Input, Submit} from "@/components/Forms/input";
import SiteLayout from "@/Layout/SiteLayout";
import {PlusIcon, XMarkIcon} from "@heroicons/react/24/outline";
import { Tab } from "@headlessui/react";
import Planned from "./jobcard";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { getDocs, collection, DocumentData, addDoc, Timestamp } from "firebase/firestore";
import { parseISO, format } from 'date-fns';
import Jobcard from "./jobcard"; 
import { serverTimestamp } from 'firebase/firestore'
import { Field, Formik,Form } from "formik";
import { AnyCnameRecord } from "dns";
import NotAssigned from './not_assigned';


const tabs = [
    {name: 'ASSIGNED', href: '#', current: true},
    {name: 'NOT ASSIGNED', href: '#', current: false},
]


export default function VehicleAllocation() {
    const [open, setOpen] = useState(false)
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedMaintanance, setFetchedMaintanance]=useState<DocumentData[]>([]);   
    const [fetchedAllocation, setfetchedAllocation]=useState<DocumentData[]>([]); 
    const [allocationList, setAllocationList] = useState<DocumentData[]>([]);
  
    const [fetchedVehicles, setFetchedVehicles]=useState<DocumentData[]>([]);  
    const [vehicleNames, setVehicleNames] = useState<string[]>([]); 
    const [jobcards, setjobcards] = useState<string[]>([]); 
    const [fetchJobCard, setfetchJobCard] = useState<string[]>([]); 
    const [drivers, setdrivers] = useState<string[]>([]); 

    const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);

  
    const handleAddClick = () => {   
        setOpen(true)
    }
    const handleJobCardReset = () => {
        setShowAddJobcardModal(false)
    } 
    const handleMaintenanceReset = () => {
        setShowScheduleMaintenanceModal(false)
    }   
    const handleTabClick = (index:any) => {
        setSelectedTab(index);
    };  
    const handleDropdownClick = (event: { stopPropagation: () => void; }) => {
        event.stopPropagation();
    };


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
        
        
        const fetchJobCard = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'jobcard'));
                const names = querySnapshot.docs.map(doc => doc.data().name);
                setjobcards(names);
            } catch (error) {
                console.error('Error fetching JobCard names:', error);
            }
        }; 
        const fetchDriver = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'drivers'));
                const names = querySnapshot.docs.map(doc => doc.data().name);
                setdrivers(names);
            } catch (error) {
                console.error('Error fetching Vehicle names:', error);
            }
        };
  
        const fetchAllocationData = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'vehicleAllocation'));
                const allocationData: DocumentData[] = [];
    
                querySnapshot.forEach((doc) => {
                    const allocation = {
                        id: doc.id,
                        ...doc.data()
                    };
                    allocationData.push(allocation);
                });
    
                setAllocationList(allocationData);
            } catch (error) {
                console.error('Error fetching allocationData:', error);
            }
        };
    
        fetchedVehicles(); 
        fetchDriver();
        fetchAllocationData(); 
        fetchJobCard();  
    }, []); 


    const handleScheduleMaintanace = async (values: { requested_by: any; cost:any; remarks:any;vehicle:any; job_cards:any; date:any}) => {  
        setShowScheduleMaintenanceModal(true);
        setShowAddJobcardModal(false);  
        setOpen(true);

        console.log("Submitted Values:", values); 
    
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.requested_by||!values.vehicle||!values.cost||!values.job_cards||!values.remarks||!values.date) {
                console.error('Required form fields are missing');
                return;
            } 

            const dateObj = new Date(values.date +"T00:00:00");  
            const timestamp=Timestamp.fromDate(dateObj)


            const maintenanceData = {
                requested_by: values.requested_by, 
                vehicle: values.vehicle, 
                date: timestamp, 
                cost: values.cost,  
                job_cards: values.job_cards,
                remarks: values.remarks,
            };
    
            const docRef = await addDoc(collection(fbDb, 'maintenance'), maintenanceData);
            console.log('Jobcard added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding jobcard:', error);
        } 
    }


    


    return (
        <>
            <div className=''>
        
                <div className='mt-4'> 
                <Tab.Group>
                <Tab.List className='w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3'> 
                                {tabs.map((tab, index) => {
                                     return (
                                        <Fragment key={index}>
                                            <Tab className='ui-selected:border-b-4 border-d-green outline-none
                                             ui-selected:text-d-green text-sm font-nunito font-bold uppercase flex flex-row ml-10' 
                                             onClick={() => handleTabClick(index)}
                                             >
                                                {tab.name}
                                            </Tab>
                                        </Fragment>
                                    )
                                })}

                            </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <MaintananceTable selectedTab={selectedTab} allocationList={allocationList} vehiclesList={fetchedVehicles} />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <NotAssigned/>

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <Jobcard />
                            </div>
                        </Tab.Panel>
       
                

                    </Tab.Panels>
                </Tab.Group> 
                </div> 
                <div>
                </div>
            </div>
            </>
        
    )
}  



interface VehiclesTableProps {
    selectedTab: number;  
    allocationList:DocumentData; 
    vehiclesList:DocumentData;
}

export function MaintananceTable({ selectedTab,allocationList,vehiclesList }: VehiclesTableProps) {
        console.log("MaintananceTable Rendering with selectedTab:", selectedTab); 
        console.log("Allocation List", allocationList);

        const currentDate = new Date();

        const filteredAllocation = allocationList.filter((allocation: any) => {  
            const maintenanceDate = new Date(allocation.end_time.seconds * 1000);
    
            if (selectedTab === 0) {
                // Show items with dates that are yet to reach (future dates)
                return maintenanceDate > currentDate;
            } else if (selectedTab === 1) {
                // Show items with dates that have already passed (past dates)
                return maintenanceDate < currentDate ;
            }
    
            return true;
        }); 
        const updatedAllocationList = filteredAllocation.map((allocation: any) => {
        const endDate = new Date(allocation.end_time.seconds * 1000); 
        const startDate = new Date(allocation.start_time.seconds * 1000);

        const updatedEndDate = new Date(allocation.end_time.seconds * 1000);
        const updatedStartDate = new Date(allocation.start_time.seconds * 1000); 
        const date=[updatedStartDate,updatedEndDate]

        if (endDate > currentDate && startDate == currentDate) {
            return {
                ...allocation,
                end_time: format(updatedEndDate, 'dd/MM/yy'), 
                start_time: format(updatedStartDate, 'dd/MM/yy'),
                driver: allocation.driver ? allocation.driver : 'Not Assigned', 
                status: allocation.status ? allocation.status : 'On Route'
            };
        }
        else 
        return {
            ...allocation,
            end_time: format(updatedEndDate, 'dd/MM/yy'), 
            start_time: format(updatedStartDate, 'dd/MM/yy'),
            driver: allocation.driver ? allocation.driver : 'Not Assigned', 
            status: allocation.status ? allocation.status : 'On Route'

        }; 
 
    });
        
    console.log("Filtered Allocation:", filteredAllocation); 
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
                                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0" 
                                    > 
                                         
                                     VEHICLE
                                    </th> 
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0"
                                    >
                                    STATUS
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0"
                                    >
                                    DRIVER
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                    DATE
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                    TRIPS
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                    
                                    </th>
                                    
                                   
                                    <th scope="col" className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only"></span>
                                    </th>
                                </tr>
                            </thead>
 
                            <tbody  className="divide-y divide-gray-200  bg-[#FAFAFB]">
                              { updatedAllocationList.map((allocation:any, index:any) => {  
                              const formattedStartTime = allocation.start_time instanceof Date
                              ? allocation.start_time.toLocaleString()
                              : allocation.start_time;

                             const formattedEndTime = allocation.end_time instanceof Date
                               ? allocation.end_time.toLocaleString()
                             : allocation.end_time;
                                return( 
                                    <Fragment key={index}> 
                                    <div className="w-full mb-2 font-nunito font-regular"></div>
                                    <tr key={allocation.id}   className='my-4 border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>
                                        {/* <td className="whitespace-nowrap pl-4 pr-3 !pt-4  sm:pl-0">{allocation.vehicle_id.name}</td>   */}
                                        <td className="whitespace-nowrap pl-4 pr-3 !pt-4 sm:pl-0">{allocation.vehicle_id && allocation.vehicle_id.name}</td>

                                             <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">
                                         <div className={`rounded-full inline-block text-sm	 h-8    ${allocation.status === 'Available' ? 'bg-[#E2E9FB] text-[#0068DD]' : (allocation.status=== 'On Route' ? 'bg-[#B9F3EE] text-[#076960]' : 'bg-[#EAEAEA] text-[#364250]')}`} style={{ width: `${allocation.status .length * 8}px`, left: '-8px' }}>
                                                <span className="inset-0 mt-1.5 flex">
                                                    {allocation.status}
                                                </span>
                                            </div>  
                                            </td>
                                        {/* <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">{allocation.status}</td>  */}
                                        <td className={`whitespace-nowrap px-2 pt-4 ${allocation.requested_by === 'Not Assigned' ? 'text-[#777E96] font-nunito' : (allocation.requested_by===`${allocation.requested_by}` ? ' text-[#000000]' : 'text-[#000000]')}`}>
                                            {allocation.requested_by}
                                        </td>

                                        <td className={`whitespace-nowrap px-2 pt-4 ${allocation.end_time === 'Not Defined' ? 'text-[#777E96] font-nunito' : (allocation.end_time===`${allocation.end_time}` ? ' text-[#000000]' : 'text-[#777E96]')}`}>
                                       {allocation.end_time !== 'Not Defined'
                                      ? `${formattedStartTime}-${formattedEndTime}`
                                      : allocation.end_time}
                                       </td>

                                        {/* <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">{allocation.trips_completed}</td> */}
                                        <td className="whitespace-nowrap p-2 text-center align-middle  text-left pt-4 text-lg font-bold text-black"> {allocation.vehicle_id && allocation.vehicle_id.trips} Trips</td> 
                                        {allocation.end_time === 'Not Defined' || new Date(allocation.end_time * 1000) < currentDate ? (
                                        <tr key={`${allocation.id}-allocate`} className='relative whitespace-nowrap pt-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 flex justify-around'>
                                       <td colSpan={7} className="text-center">
                                       <button className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2" >
                                       Allocate
                                      </button>
                                      </td>
                                      </tr>
                                     ) : null} 
                                     

                                    

                           
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
    )
}




