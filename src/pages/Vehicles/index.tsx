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
import VehicleAllocation from "./vehicle_allocation";
import { useRouter } from "next/router"; 
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";



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
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} vehicleTrips={vehicleTrips} />
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} vehicleTrips={vehicleTrips}/>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} vehicleTrips={vehicleTrips}/>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DummyTable selectedTab={selectedTab} vehicles={fetchedVehicles} vehicleTrips={vehicleTrips}/>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
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
                                        className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold"
                                    >
                                     License Plate                                    
                                     </th>
                           
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold"
                                    >
                                        Registration Date
                                    </th>
                
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold"
                                    >
                                        Trips Completed
                                    </th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold">
                                        <span className="sr-only"></span>
                                    </th>
                                </tr>
                            </thead>
 
                            <tbody  className="divide-y divide-gray-200  bg-[#FAFAFB]">
                            {filteredVehicles.map((vehicle, index) => {   
                                const { seconds } = vehicle.registration_date; 
                                const updatedDate = new Date(seconds * 1000); 
                                const tripsCompleted = vehicleTrips[vehicle.lisence_plate] || 0; // Get the trip count for the vehicle

                                return( 
                                    // <tr className='border-solid border-2 border-[#D9E2F6] h-10 font-nunito font-regular'>
                                    <Fragment key={index}>  
                                    <div className="w-full mb-2 font-nunito font-regular"></div>
                                    <tr key={vehicle.id} className='my-2 border-solid border-2  bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>  
                                        <td className="whitespace-nowrap py-2 pl-4 pr-3  text-d-blue sm:pl-0"  onClick={() => handleVehicleClick(vehicle)}>{vehicle.lisence_plate}</td>
                                        <td className="whitespace-nowrap px-2 py-2 relative">
                                  
                                             <div className={`rounded-full inline-block text-sm h-8 absolute transform -translate-y-1/2 ${vehicle?.availability_status === 'Available' ? 'bg-[#E2E9FB] text-[#0068DD]' : (vehicle?.availability_status === 'On Route' ? 'bg-[#B9F3EE] text-[#076960]' : 'bg-[#EAEAEA] text-[#364250]')}`} style={{ width: `${(vehicle?.availability_status?.length || 0) * 7}px`, left: '-8px' }}>
  <span className="absolute inset-0 flex items-center justify-center">
    {vehicle?.availability_status}
  </span>
</div>

                                            </td> 
    
                                            <td className="whitespace-nowrap px-2 py-2 ">
                                            {format(updatedDate, 'MM/dd/yy')}
                                           </td>
                                        <td className="whitespace-nowrap px-2 py-2 text-lg font-bold text-black">{tripsCompleted} Trips</td>
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

