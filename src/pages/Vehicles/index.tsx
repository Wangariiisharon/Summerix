import {Header, HeaderBar} from "@/components/Headers";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons";
import {headers} from "next/headers";
import {FormEvent, Fragment, useEffect, useState} from "react";
import {FormModal} from "@/components/Modals/FormModal";
import {Form} from "@/components/Forms/Form";
import {Input, Submit} from "@/components/Forms/input";
import SiteLayout from "@/Layout/SiteLayout";
import {XMarkIcon} from "@heroicons/react/24/outline";
import { Tab } from "@headlessui/react";
import { DocumentData, collection, query, where, getDocs } from "firebase/firestore";
import { fbDb } from "@/firebase/configs"; 
import { parseISO, format } from 'date-fns';
import Maintenance from "./maintanance";
import { useRouter } from "next/router"; 
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider"; 
import Pending from "./pending";

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
]

export default function VehiclesComponent() {
    const [open, setOpen] = useState(false)
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);  
    const [vehicleTrips, setVehicleTrips] = useState<Record<string, number>>({}); // To store the trip counts for each vehicle
    const {organisationId}=useAuthContext() 
    console.log("Vehicles Page page OrganisationId",organisationId);
    

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
              // Ensure organisationId is available before making the query
              if (organisationId) {
                const q = query(collection(fbDb, 'vehicles'), where('organisationId', '==', organisationId));
                const querySnapshot = await getDocs(q);
      
                const vehiclesData = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data()
                }));
                setFetchedVehicles(vehiclesData);
              } else {
                // Handle the case when organisationId is not available
                console.error('Organisation ID is not available.');
              }  
            } catch (error) {
              console.error('Error fetching Vehicles:', error);
            }
          };


        const fetchTripsAndCount = async () => {
            try {
              const querySnapshot = await getDocs(collection(fbDb, 'trips'));
          
              const tripsData: DocumentData[] = [];
              const updatedVehicleTrips: Record<string, number> = {};
              const recentTrips: Record<string, DocumentData> = {};
          
              querySnapshot.forEach((doc) => {
                const trip = doc.data();
                const vehicle = trip.vehicle;
          
                // Initialize the trip count for each vehicle
                if (!updatedVehicleTrips[vehicle]) {
                  updatedVehicleTrips[vehicle] = 0;
                }
          
                // Increment the trip count for the vehicle
                updatedVehicleTrips[vehicle]++;
          
                // Check if the trip is the most recent for the vehicle
                if (!recentTrips[vehicle] || trip.start_time > recentTrips[vehicle].start_time) {
                  recentTrips[vehicle] = trip;
                }
              });
          
              setVehicleTrips(updatedVehicleTrips);
              console.log('Most recent trips:', recentTrips);
            } catch (error) {
              console.error('Error fetching Trips:', error);
            }
          };
    
        fetchVehicles();
        fetchTripsAndCount();
      }, [organisationId]);



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
                        <div  className="">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} vehicleTrips={vehicleTrips} />
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} vehicleTrips={vehicleTrips}/>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} vehicleTrips={vehicleTrips}/>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} vehicleTrips={vehicleTrips}/>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="">
                        <Maintenance />
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
    vehicleTrips: Record<string, number>;

}

export function DummyTable({ selectedTab,vehicles,vehicleTrips }: VehiclesTableProps) { 
    console.log('Vehicle Trips:', vehicleTrips);
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 6;
    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage; 

        console.log("VehiclesTable Rendering with selectedTab:", selectedTab); 
        const Headers = ["License Plate ", "Status", "Registration","Trips Completed"]


    const filteredVehicles = vehicles.filter(vehicles =>
        selectedTab === 0 ||
        (selectedTab === 1 && vehicles.availability_status === 'On Route') ||
        (selectedTab === 2 && vehicles.availability_status === 'Available') ||
        (selectedTab === 3 && vehicles.availability_status === 'Out Of Service ') ||
        (selectedTab === 4 && vehicles ) 
    );  
    const router=useRouter()
    const handleVehicleClick = (vehicle: any) => {
        router.push(`/Vehicles/vehiclesDetails?id=${vehicle.id}`);
      };  
    console.log("Filtered Vehicles:", filteredVehicles); 

    const visibleVehicles = filteredVehicles.slice(startIndex, endIndex); 

    return ( 
      <div className="px-4 ml-6 sm:px-6 lg:px-8">
        <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
         <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
           <table className="min-w-full divide-y divide-gray-300">
            <thead>
                                <tr>
                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">                                     
                            
                                     License Plate                                    
                                     </th>
                           
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900" 
                                        >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"   
                                        >
                                        Registration Date
                                    </th>
                
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"                                     
                                        >
                                        Trips Completed
                                    </th>
                                    <th scope="col" 
                                      className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                                      <span className="sr-only"></span>
                                    </th>
                                </tr>
                            </thead>
 
                            <tbody  className=" bg-[#FAFAFB]">
                            {visibleVehicles.map((vehicle:any, index:any) => {   
                                const { seconds } = vehicle.registration_date; 
                                const updatedDate = new Date(seconds * 1000); 
                                const tripsCompleted = vehicleTrips[vehicle.lisence_plate] || 0; // Get the trip count for the vehicle

                                return( 
                                    <Fragment key={index}>  
                                    <div className="w-full mb-2 font-nunito font-regular"></div>
                                    <tr key={vehicle.id} 
                                     className="hover:bg-gray-100">
                                     <td 
                                       className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"  
                                       onClick={() => handleVehicleClick(vehicle)}>{vehicle.lisence_plate}</td>
                                        <td 
                                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 relative"
                                        > 
                                        {/*      className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"  */}
                                
                                        <div className={`rounded-full inline-block text-sm h-8 absolute transform -translate-y-1/2 ${vehicle?.availability_status === 'Available' ? 'bg-[#E2E9FB] text-[#0068DD]' : (vehicle?.availability_status === 'On Route' ? 'bg-[#B9F3EE] text-[#076960]' : 'bg-[#EAEAEA] text-[#364250]')}`} style={{ width: `${(vehicle?.availability_status?.length || 0) * 7}px`, left: '-8px' }}>
                                        <span className="absolute inset-0 flex items-center justify-center">
                                         {vehicle?.availability_status}
                                       </span>
                                        </div>
                                            </td> 
                                            <td
                                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" 
                                            >
                                            {format(updatedDate, 'MM/dd/yy')}
                                           </td>
                                        <td 
                                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-bold text-black">
                                            {tripsCompleted} Trips</td>
                                    </tr> 
                                     </Fragment>
                            )
                        })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>  


                    
        <div className="flex flex-row justify-center my-4 ui-selected:border-b-4  outline-none
          text-sm font-nunito font-bold uppercase bg-[#FAFAFB]">
         <button 
        className="ml-5"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 0}
        >
        Prev
        </button>
     <span className="ml-5">{currentPage + 1}</span>
      <button 
      className="ml-5"
      onClick={() => setCurrentPage(currentPage + 1)}
      disabled={endIndex >= filteredVehicles.length}
       >
      Next
    </button>
    </div>

        </div> 

    )
}

