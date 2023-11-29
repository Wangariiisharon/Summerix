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
import Planned from "../Administration/Users/jobcard";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { getDocs, collection, DocumentData, addDoc, Timestamp } from "firebase/firestore";
import { parseISO, format } from 'date-fns';
import Jobcard from "../Administration/Users/jobcard"; 
import { serverTimestamp } from 'firebase/firestore'
import { Field, Formik,Form } from "formik";
import { AnyCnameRecord } from "dns";





export default function NotAssigned() {
    const [open, setOpen] = useState(false)
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedMaintanance, setFetchedMaintanance]=useState<DocumentData[]>([]);   
    const [fetchedAllocation, setfetchedAllocation]=useState<DocumentData[]>([]);  
    const [fetchedVehicles, setFetchedVehicles]=useState<DocumentData[]>([]);  
    const [vehicleNames, setVehicleNames] = useState<string[]>([]); 
    const [jobcards, setjobcards] = useState<string[]>([]); 
    const [fetchJobCard, setfetchJobCard] = useState<string[]>([]); 
    const [allocationList, setAllocationList] = useState<DocumentData[]>([]);
    const [drivers, setdrivers] = useState<string[]>([]);   
    interface SelectedVehicle {
        id: string; 
      } 
    const [allocateVehicle, setAllocateVehicle] = useState<((vehicle: SelectedVehicle) => void) | null>(null);
    const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);


    const handleVehicleAllocation = (allocatedVehicle: DocumentData) => {
        // Update the allocation list in the parent component
        // Assuming allocationList is a state variable in the parent component
        setAllocationList([...allocationList, allocatedVehicle]);
    };
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



    const handleScheduleMaintanace = async (values: { requested_by: any; cost:any; remarks:any;vehicle:any; job_cards:any; end_time:any; start_time:any}) => {  
        setShowScheduleMaintenanceModal(true);
        setShowAddJobcardModal(false);  
        setOpen(true);

        console.log("Submitted Values:", values); 
    
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.requested_by||!values.vehicle||!values.cost||!values.job_cards||!values.remarks||!values.end_time||!values.start_time) {
                console.error('Required form fields are missing');
                return;
            } 

            const endDateObj = new Date(values.end_time +"T00:00:00");   
            const startDateObj = new Date(values.start_time +"T00:00:00");  

            const endTimestamp=Timestamp.fromDate(endDateObj) 
            const startTimestamp=Timestamp.fromDate(startDateObj)



            const maintenanceData = {
                requested_by: values.requested_by, 
                vehicle: values.vehicle, 
                cost: values.cost,  
                job_cards: values.job_cards,
                remarks: values.remarks, 
                end_time:endTimestamp, 
                start_time:startTimestamp
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
                <div className="flex flex-row fixed top-12 right-10">  
                <div className="ml-2"> 
  
                </div>
                </div>
                <div className='mt-4'> 
                <Tab.Group>
 
                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <MaintananceTable
                         selectedTab={selectedTab}
                         allocationList={allocationList}
                         vehiclesList={fetchedVehicles}
                        />

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
        interface SelectedVehicle {
            id: string; // Adjust the type of id according to your data structure
            // Other properties of the selected vehicle 
            name: string; // Adjust the name according to your data structure 
            avaiability_status: string;
            trips: number; // Adjust the
          } 
        const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
        const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
        const [open, setOpen] = useState(false)   
        const [vehicleSList,setVehiclesList]=useState([])
        const [selectedVehicleForAllocation, setSelectedVehicleForAllocation] = useState<SelectedVehicle | null>(null);
        const [drivers, setdrivers] = useState<string[]>([]); 
        
        useEffect(() =>{
            const fetchDriver = async () => {
                try {
                    const querySnapshot = await getDocs(collection(fbDb, 'drivers'));
                    const names = querySnapshot.docs.map(doc => doc.data().name);
                    setdrivers(names);
                } catch (error) {
                    console.error('Error fetching Vehicle names:', error);
                }
            };  
            
            fetchDriver();
        },[]) 
        const handleMaintenanceReset = () => {   
            setShowScheduleMaintenanceModal(false)
        }   
       
        const handleDropdownClick = (event: { stopPropagation: () => void; }) => {
            event.stopPropagation();
        };

        const handleScheduleMaintanace = async (values: { requested_by: any; end_time: any; start_time: any }) => {
            setShowScheduleMaintenanceModal(true);
            setShowAddJobcardModal(false);
            setOpen(true);
          
            try {
              if (!values) {
                console.error('Form values are undefined');
                return;
              } 
  
              if (selectedVehicleForAllocation?.id) {
                const updatedVehiclesList = vehiclesList.filter((vehicle: { id: any; }) => vehicle.id !== selectedVehicleForAllocation.id);
            
                // Update the state to reflect the updated vehiclesList
                setVehiclesList(updatedVehiclesList);
              } else {
                console.error('Selected vehicle for allocation is null or does not have an id');
              }
            
              setOpen(false);
          
              if (!values.requested_by || !values.start_time || !values.end_time) {
                console.error('Required form fields are missing');
                return;
              }
          
              const endDateObj = new Date(values.end_time + 'T00:00:00');
              const startDateObj = new Date(values.start_time + 'T00:00:00');
          
              const endTimestamp = Timestamp.fromDate(endDateObj);
              const startTimestamp = Timestamp.fromDate(startDateObj);
          
              // Check if selectedVehicleForAllocation is available before using its data
              const vehicle_id = selectedVehicleForAllocation ? selectedVehicleForAllocation : null;
          
              const maintenanceData = {
                requested_by: values.requested_by,
                end_time: endTimestamp,
                start_time: startTimestamp,
                vehicle_id: vehicle_id,  
              };
          
              const docRef = await addDoc(collection(fbDb, 'vehicleAllocation'), maintenanceData);
              console.log('Allocation added with ID: ', docRef.id);
          
              setOpen(false);
            } catch (error) {
              console.error('Error adding Allocation:', error);
            }
          };
          

    console.log("Filtered Allocation:", vehiclesList); 
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
                            {/* //    Filter vehicles that are On Route or Available */}

                            {vehiclesList
                            //  .filter((vehicle: any) => {   
                            // return vehicle.availability_status === 'On Route' || vehicle.availability_status === 'Available';
                            //   })
                             .filter((vehicle: any) => {
                             // Filter out vehicles that are in the allocationList and their end_time has not passed
                             const isVehicleAllocated = allocationList.some(
                            (allocation: any) => allocation.vehicle_id.id === vehicle.id && allocation.end_time.toDate() > new Date()
                             );

                            return !isVehicleAllocated;
                            })
                            .map((vehicle:any, index:any) => {
                                return( 
                                    <Fragment key={index}> 
                                    <div className="w-full mb-2 font-nunito font-regular"></div>
                                    <tr key={vehicle.id}   className='my-4 border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>
                                        <td className="whitespace-nowrap pl-4 pr-3 !pt-4  sm:pl-0">{vehicle.name}</td> 
                                             <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">
                                         <div className={`rounded-full inline-block text-sm	 h-8    ${vehicle.availability_status === 'Available' ? 'bg-[#E2E9FB] text-[#0068DD]' : (vehicle.availability_status=== 'On Route' ? 'bg-[#B9F3EE] text-[#076960]' : 'bg-[#EAEAEA] text-[#364250]')}`} style={{ width: `${vehicle.status .length * 8}px`, left: '-8px' }}>
                                                <span className="inset-0 mt-1.5 flex">
                                                    {vehicle.availability_status}
                                                </span>
                                            </div>  
                                            </td>
                                        {/* <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">{allocation.status}</td>  */}
                                        <td className={`whitespace-nowrap px-2 pt-4 ${vehicle.driver ? '' : 'text-[#777E96] font-nunito'}`}>
                                      {vehicle.driver ? vehicle.driver : 'Not Assigned'}
                                     </td>

                                        <td className={`whitespace-nowrap px-2 pt-4 ${vehicle.end_time ? '' : 'text-[#777E96] font-nunito'}`}>
                                       {vehicle.end_time ? `${vehicle.start_time}-${vehicle.end_time}` : 'Not Defined'}
                                       </td> 

                                        {/* <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">{allocation.trips_completed}</td> */}
                                        <td className="whitespace-nowrap p-2 text-center align-middle  text-left pt-4 text-lg font-bold text-black">{vehicle.trips} Trips</td> 
                                       <td  className="text-center">
                                       <button
                                      className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2"
                                      onClick={() => {
                                      setSelectedVehicleForAllocation(vehicle);
                                      setShowScheduleMaintenanceModal(true);
                                      }}
                                      >
                                      Allocate
                                      </button>

                                      </td>
                                    </tr> 
                                    </Fragment>

                            )
                        })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>  

            <FormModal open={showScheduleMaintenanceModal && selectedVehicleForAllocation !== null} setOpen={setShowScheduleMaintenanceModal}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Schedule Maintanance
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleMaintenanceReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Formik
                    initialValues={{
                        requested_by: "",  
                        start_time: "",  
                        end_time: "", 


            
                                      }}
                        onSubmit={(values) => handleScheduleMaintanace(values)}  
                        >
                       {({ values }) => (
                    <Form> 
                          <label className="block">
                             <label className="form-label">Driver</label>
                             <Field
                             as="select"
                            name="requested_by"  
                           value={values.requested_by}
                         className="form-input bg-grey w-96" 
                         onClick={handleDropdownClick}

                         >
                        {drivers.map((requested_by, index) => (
                        <option key={index} value={requested_by}>
                         {requested_by}
                       </option>
                       ))}
                      </Field> 
            
                             </label> 
                                                 
                             <div className='flex w-full justify-between  mt-8'> 

                             <label className="block">
                             <label className="form-label">START DATE</label>
                             <Field
                             type="date"
                             name="start_time"
                             value={values.start_time}
                             className="form-input bg-grey w-48"
                            />
                            </label>  

                            <label className="block">
                             <label className="form-label">END DATE</label>
                             <Field
                             type="date"
                             name="end_time"
                             value={values.end_time}
                             className="form-input bg-grey w-48"
                            />
                            </label> 
                                </div>   

                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='text-blue text-xl mr-32' handleClick={handleMaintenanceReset}>Reset</Button>
                                <button type='submit' >Save</button>
                            </div>

                    </Form>
                     )}
                    </Formik>
                </div>
            </FormModal>
        </div>
    )
}