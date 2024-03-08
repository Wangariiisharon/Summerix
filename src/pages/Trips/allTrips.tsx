import {Header, HeaderBar} from "@/components/Headers";
import DummyTable, {ClientsTable} from "@/components/Table/Table";
import {Input, Submit} from "@/components/Forms/input";
import {AddButton, Button} from "@/components/Buttons";
import {ArrowDownTrayIcon, ChevronDownIcon, InboxArrowDownIcon, PlusIcon} from "@heroicons/react/24/solid";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {FormModal} from "@/components/Modals/FormModal";
import {Fragment, useEffect, useState} from "react";
import SearchBar from "../../components/Forms/input"
import SiteLayout from "@/Layout/SiteLayout";
import { fbDb } from "@/firebase/configs";
import { getDocs, collection, DocumentData, Timestamp, addDoc, doc, setDoc, query, where, getFirestore, onSnapshot } from "firebase/firestore";
import { Field,Formik,Form} from "formik";  
import  setFieldValue from "formik";  
import { Tab } from "@headlessui/react";
import Maintenance from "../Vehicles/maintanance";
import { useRouter } from "next/router"; 
import toast from "react-hot-toast";
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider"; 




const tabs = [
    {name: 'OVERVIEW', href: '#', current: false},
    {name: 'UPCOMING TRIPS', href: '#', current: false},
] 
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
export default function AllTrips({ searchQuery, setSearchQuery }: any) {
    const [open, setOpen] = useState(false)  
    const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
    const [vehicleSList,setVehiclesList]=useState([])
    const [drivers, setDrivers] = useState<{ id: string; name: string; phonenumber: string }[]>([]);  
    const [vehicles, setVehicles] = useState<{ id: string; name: string; availability_status: string; lisence_plate: string }[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<DocumentData | null>(null); 
    const [vehicleNames, setVehicleNames] = useState<string[]>([]); 
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedTrips, setfetchedTrips]=useState<DocumentData[]>([]);  
    const [editModalOpen, setEditModalOpen] = useState(false); 
    const [editFormInitialValues, setEditFormInitialValues] = useState({
      requested_by: "",  
      vehicle: "",
      pick_up_location: "", 
      drop_off_location: "",
      start_time: "" as unknown as Date, // Initialize as an empty string, cast to Date
      end_time: "", // Make sure it's initialized as a string
      cargo_type: "", 
      cargo_quantity: "", 
      memo: "",  
      trip_status: "", 
      organisationId: "", 
      tripId: "", 
      dealValue: 0,
      fuel:0

    });
      const [selectedTabIndex, setSelectedTabIndex] = useState(0);
      const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');


      const allTripsTabs = [
        { name: 'OVERVIEW', href: '#', current: selectedTabIndex === 0 },
        { name: 'UPCOMING TRIPS', href: '#', current: selectedTabIndex === 1 },
      ];
    
    const router=useRouter()   
    const {organisationId}= useAuthContext() 
    console.log("AllTrips Page OrganisationId: ", organisationId);
    
    const handleEditClick = (trip: DocumentData) => { 
      const { seconds } = trip.start_time; 
      const startTime = new Date(seconds * 1000); 
            setSelectedTrip(trip);
        setEditFormInitialValues({
            requested_by: trip.requested_by,
            vehicle: trip.vehicle,
            pick_up_location: trip.pick_up_location,
            drop_off_location:trip.drop_off_location,
            start_time:startTime,
            end_time:trip.end_time,  
            cargo_type:trip.cargo_type, 
            cargo_quantity:trip.cargo_quantity, 
            memo:trip.memo,   
            trip_status:trip.trip_status,
            organisationId:trip.organisationId,
            tripId:trip.tripId,
            fuel:trip.fuel,
            dealValue:trip.dealValue

        });
        setEditModalOpen(true);
      };   
      
    const handleEditModalClose = () => {
        setSelectedTrip(null); 
        setEditModalOpen(false); 
    };

    const handleEditSubmit = async (values: { 
        requested_by: any,  
        vehicle: any,
        pick_up_location: any, 
        drop_off_location: any,  
        start_time: any, 
        end_time: any, 
        cargo_type: any, 
        cargo_quantity: any, 
        memo: any,
        trip_status:any,
        organisationId:any ,
        tripId:any,
        fuel:any,
        dealValue:any

      }) => { 
        if (!selectedTrip) {
            console.error("No selected Trip to update");
            return;
          }
        
          console.log("Edited Values:", values);
        try {
          if (!values) {
            console.error("Form values are undefined");
            return;
          }
          if (!values.trip_status ) 
           {
            console.error("Required form fields are missing"); 
            toast.error(`Please fill the field Trip status`);
            return;
          } 
          if (!values.end_time ) 
          {
           console.error("Required form fields are missing"); 
           toast.error("Please fill the field End time");
           return;
         }   
         const endTimeDate = new Date(values.end_time); 
         const startTimeDate = new Date(values.start_time);

         const startTimeTimestamp = Timestamp.fromDate(endTimeDate);

         // Convert the Date to a Firestore Timestamp
         const endTimeTimestamp = Timestamp.fromDate(endTimeDate);

          // Update the vehicle data in the database using the selectedVehicle.id
          const AdminRef = doc(fbDb, "trips", selectedTrip.id);
          await setDoc(AdminRef, {
            requested_by: values.requested_by,
            vehicle: values.vehicle,
            pick_up_location: values.pick_up_location,
            drop_off_location:values.drop_off_location,
            start_time:values.start_time,
            end_time:endTimeTimestamp,  
            cargo_type:values.cargo_type, 
            cargo_quantity:values.cargo_quantity, 
            memo:values.memo,   
            trip_status:values.trip_status,  
            organisationId:values.organisationId,
            tripId:values.tripId,  
            dealValue:values.dealValue,
            fuel:values.fuel
          });

          // Update the local fetchedVehicles state
          const updatedVehicles = fetchedTrips.map((trip) => 
          trip.id === selectedTrip.id
          
              ? {
                  ...trip,
                  requested_by: values.requested_by,
                  vehicle: values.vehicle,
                  pick_up_location: values.pick_up_location,
                  drop_off_location:values.drop_off_location,
                  start_time:values.start_time,
                  end_time:values.end_time,  
                  cargo_type:values.cargo_type, 
                  cargo_quantity:values.cargo_quantity, 
                  memo:values.memo, 
                  trip_status:values.trip_status,  
                  organisationId:values.organisationId,
                  tripId:values.tripId,
                  fuel:values.fuel,
                  dealValue:values.dealValue

                }
              : trip
          );
          setfetchedTrips(updatedVehicles);
          setSelectedTrip(null);
          setEditModalOpen(false); 
          toast.success("Trip Successfully Updated.");

        } catch (error) {
          console.error("Error updating trip:", error);
        }
      }; 
      const filteredTrips = fetchedTrips.filter((trip) => {
        const fullName = `${trip.vehicle}`.toLowerCase();
        const nameMatch = fullName.includes(searchQuery.toLowerCase());
        return nameMatch;
      }); 
    const handleSearch = () => {

    }
    const handleClick = () => {

    }
    const handleAddTrip = () => {
        setOpen(true)
    }
    const handleExport = () => {
    }
    const handleReset = () => {
        setOpen(false)
    } 
    useEffect(() => { 
        const fetchDrivers = async () => {
            try {
              // Ensure organisationId is available before making the query
              if (organisationId) {
                const q = query(collection(fbDb, 'drivers'), where('organisationId', '==', organisationId));
                const querySnapshot = await getDocs(q);
                const driverDetails = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                id: doc.id,
                name: data.name,
                phonenumber: data.phonenumber,  
               };
               });
               setDrivers(driverDetails); 

              } else {
                // Handle the case when organisationId is not available
                console.error('Organisation ID is not available for fetching Vehicle names.');
              }
            } catch (error) {
              console.error('Error fetching Drivers:', error);
            }
          };
 
        const fetchVehicleDetails = async () => {
            try {
              // Ensure organisationId is available before making the query
              if (organisationId) {
                const q = query(collection(fbDb, 'vehicles'), where('organisationId', '==', organisationId));
                const querySnapshot = await getDocs(q);
             const vehicleDetails = querySnapshot.docs.map(doc => {
             const data = doc.data();
             return {
                id: doc.id,
                name: data.name,
                availability_status: data.availability_status,
                lisence_plate: data.lisence_plate
              };
             });
           setVehicles(vehicleDetails);

              } else {
                // Handle the case when organisationId is not available
                console.error('Organisation ID is not available for fetching Vehicles .');
              }
            } catch (error) {
              console.error('Error fetching Vehicles:', error);
            }
          };
        

          const fetchedTrips = async () => { 
            const db = getFirestore();

           try {
           if (organisationId) {
          const q = query(collection(db, 'trips'), where('organisationId', '==', organisationId));

         const unsubscribe = onSnapshot(q, (querySnapshot) => {
         const tripsData = querySnapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
         }));
        setfetchedTrips(tripsData);
         });

         return () => unsubscribe(); 

         } else {
           console.error('Organisation ID is not available.');
         }  
       } catch (error) {
         console.error('Error fetching Trips:', error);
       }
     };
    

        fetchedTrips();
        fetchVehicleDetails(); 
        fetchDrivers();
    }, [organisationId]);   

    const filterTripsByTimeRange = (trip: DocumentData): boolean => {
      const currentDate = new Date();
    
      if (selectedTimeRange === 'thisWeek') {
        // Filter trips that occurred within the current week
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
    
        const endOfWeek = new Date(currentDate);
        endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay())); // End of the week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999);
    
        const tripDate = trip.start_time?.toDate();
    
        return tripDate && tripDate >= startOfWeek && tripDate <= endOfWeek;
      }
    
      if (selectedTimeRange === 'thisMonth') {
        // Filter trips that occurred within the current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
    
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
    
        const tripDate = trip.start_time?.toDate();
    
        return tripDate && tripDate >= startOfMonth && tripDate <= endOfMonth;
      }
    
      // 'all' selected, no additional filtering
      return true;
    };
    
    return (
            <div>
            <div className="flex flex-col">

                </div>
                {/* <HeaderBar headers={Headers}/> */} 
                <div className='mt-4'> 
                <Tab.Group>  
                  <div className="flex flex-row">
                <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3">
                        {allTripsTabs.map((tab, index) => (
                      <Fragment key={index}>
                  <Tab
                    className={classNames(
                      'border-d-green outline-none text-sm font-nunito font-bold uppercase flex flex-row ml-10',
                      tab.current ? 'ui-selected border-b-4 ui-selected:text-d-green' : ''
                    )}
                    onClick={() => setSelectedTabIndex(index)}
                  >
                    {tab.name}
                  </Tab> 
                
                   </Fragment>
                            ))}
                       </Tab.List>  

                    <div className='text-sm flex pr-2'> 
                    {/* Filter by: */}
                     <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="ml-2 border border-[#4FD1C5] rounded text-sm"
                    >
                   <option value="all">All</option>
                   <option value="thisWeek">This Week</option>
                   <option value="thisMonth">This Month</option>
                   </select>
                   </div> 
                    
                       </div> 
                    <Tab.Panels> 
         
                    <Tab.Panel className={classNames(selectedTabIndex === 0 ? 'ui-selected border-b-4' : '', 'h-full')}>
                        <div  className="max-h-[500px] overflow-y-auto">
                        {/* <TripsTable selectedTab={selectedTabIndex} trips={fetchedTrips} filteredTrips={filteredTrips} handleEditClick={handleEditClick}/> */}
                        <TripsTable selectedTab={selectedTabIndex} trips={fetchedTrips} filteredTrips={filteredTrips.filter(filterTripsByTimeRange)} handleEditClick={handleEditClick} />
                            </div>
                        </Tab.Panel>
                        <Tab.Panel className={classNames(selectedTabIndex === 0 ? 'ui-selected border-b-4' : '', 'h-full')}>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <TripsTable selectedTab={selectedTabIndex} trips={fetchedTrips} filteredTrips={filteredTrips} handleEditClick={handleEditClick} />
                            </div>
            
                        </Tab.Panel> 
                    </Tab.Panels>
                </Tab.Group> 
            </div> 
            {editModalOpen && selectedTrip && (
                <FormModal open={editModalOpen} setOpen={handleEditModalClose}> 
                <div>
                <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Edit trip Details
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleEditModalClose}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>
                
                    <Formik
            

                initialValues={editFormInitialValues}
                onSubmit={handleEditSubmit}
        > 

            {({ values }) => (
                                      <Form>
                        <div className=''>
                            <div className='flex w-full justify-between'>  
                            <label className="block">
                             <label className="form-label">PICK UP LOCATION</label>
                             <Field 
                             disabled
                             type="text" 
                             name="pick_up_location"
                             value={values.pick_up_location}
                             className="form-input bg-grey w-48"
                            />
                            </label>  
                            <label className="block">
                             <label className="form-label">DROP OFF LOCATION</label>
                             <Field 
                             disabled
                             type="text"
                             name="drop_off_location"
                             value={values.drop_off_location}
                             className="form-input bg-grey w-48"
                            />
                            </label> 

                             </div>  
                             <div className='flex w-full justify-between mt-8'>  
                            <label className="block">
                             <label className="form-label">START TIME</label>
                             <Field 
                             disabled
                             type="date"
                             name="start_time"
                             value={values.start_time}
                             className="form-input bg-grey w-48"
                            />
                            </label>  
                            <label className="block">
                             <label className="form-label">END TIME</label>
                             <Field 
                             type="date"
                             name="end_time"
                             value={values.end_time}
                             className="form-input bg-grey w-48"
                            />
                            </label> 

                     
                             </div> 
                           

                             <div className='flex w-full justify-between  mt-8'> 
                             <label className="block">
                             <label className="form-label">SELECT DRIVER</label>
                             <Field
                             disabled
                              name="requested_by"  
                             value={values.requested_by}
                             className="form-input bg-grey w-48"
                            >
                         </Field>
                             </label>  
                             <label className="block">
                             <label className="form-label">VEHICLE</label>.
                             <Field 
                             disabled
                            name="vehicle"  
                           value={values.vehicle}
                         className="form-input bg-grey w-48" 
                         >
                        </Field> 
                        </label>   
                         </div> 
                            <p className="mt-5 font-semibold"> Cargo</p>  
                            <div className='flex w-full justify-between'> 
  
                             <label className="block mt-8">
                             <label className="form-label">Cargo Type</label>
                             <Field 
                             disabled
                             type="text"
                             name="cargo_type"
                             value={values.cargo_type}
                             className="form-input bg-grey w-48"
                            />
                            </label>  
                            <label className="block mt-8">
                             <label className="form-label">Cargo Quanitiy</label>
                             <Field 
                             disabled
                             type="text"
                             name="cargo_quantity"
                             value={values.cargo_quantity}
                             className="form-input bg-grey w-48"
                            />
                            </label> 
                            </div>  
                            <div className='flex w-full justify-between'>   

                         </div>  
                         <label className="block mt-8">
                             <label className="form-label">TRIP STATUS</label>
                
                                      <Field as="select" name="trip_status"                               
                                      value={values.trip_status} 
                                      className="form-input bg-grey w-48"
                                      >
                                      <option value="Booked">Booked</option>
                                      <option value="Ready for Departure">Ready for Departure</option>
                                      <option value="At the border">At the border</option>  
                                      <option value="Offloading dest">Offloading dest</option> 
                                      <option value="On Route">On Route</option>  
                                      <option value="Mechanical">Mechanical</option> 
                                      <option value="Done">Done	</option> 
                                      <option value="Returning the Container">returning with Container</option>  

                                     </Field>

                            </label>    
                            <label className="block mt-8">
                            <label className="form-label">Memo</label>
                            <Field 
                             disabled
                             type="text"
                             name="memo"
                             value={values.memo}
                             className="form-input bg-grey w-96 h-20" 
                             placeholder="Optional"
                            />
                            </label> 
                            <div className='flex w-full justify-end mt-24 '>
                                {/* <Button className='text-blue text-xl mr-32' handleClick={handleReset}>Reset</Button>
                                <button type='submit' >Save</button> */} 
                            <Button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' handleClick={handleReset}>Reset</Button>
                            <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4' type='submit' >Save</button>
                        
                            </div>

                        </div>
                                  </Form>
            )} 
        </Formik> 
        </div>

                </FormModal>
            )}

            </div>  
    )
}  
interface TripsTableProps {
    selectedTab: number;  
    trips: DocumentData[]; 
    filteredTrips: DocumentData[]; 
    handleEditClick:any
} 
interface TripsPerVehicle {
    [key: string]: {
      count: number;
      lastMonth: string; // Keep track of the last month for each vehicle
    };
  }


export function TripsTable({ selectedTab,trips,filteredTrips,handleEditClick }: TripsTableProps) {  
    const router=useRouter()  

    
    const handleTripClick = (trip: any) => {
        router.push(`/Trips//viewTrip?id=${trip.id}`);
      }; 
    const calculateHourDifference = (startTime: number, endTime: number) => {
        const differenceInMilliseconds = endTime - startTime;
        const differenceInHours = Math.round(differenceInMilliseconds / (1000 * 60 * 60));
        return differenceInHours;
      };  
      const currentDate = new Date() ;    


      const filteredAllocation = trips.filter((trip: any) => {   

        const maintenanceDate = new Date(trip?.start_time?.seconds * 1000);
    
        if (selectedTab === 0) {
          return true;
        } else if (selectedTab === 1) {
        return currentDate < maintenanceDate;
        }
      
        return true; 

      });
      const formatTripId = (currentMonth: string, tripCount: { toString: () => string; }, vehicle: any) => {
        const formattedMonth = currentMonth.substring(0, 3); 
        const formattedTripCount = tripCount.toString().padStart(2, '0'); // Ensure two-digit trip count
        return `${formattedMonth} ${formattedTripCount} ${vehicle}`;
      };
      
      const tripsPerVehicle: TripsPerVehicle = {};

      const calculateTripCount = (startMonth: string, endMonth: string, currentMonth: string): number => {
        if (startMonth === endMonth) {
          return currentMonth === startMonth ? 1 : 0; // Trip happened in the current month
        } else {
          // Trip spans multiple months
          if (currentMonth === startMonth) {
            return 1; // Trip started in the current month
          } else if (currentMonth === endMonth) {
            return 1; // Trip ends in the current month
          } else {
            return 0; // Trip neither started nor ended in the current month
          }
        }
      };
      
 
      return ( 
        <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
         <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
           <table className="min-w-full divide-y divide-gray-300">
            <thead>
                  <tr>
                    <th scope="col" 
                     className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">                                     
                    Trip ID
                    </th>
                    <th scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Name
                    </th>
                    <th scope="col"
                     className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"   
                     >
                      Pick Up
                    </th>
                    <th scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"                                     
                    >
                      Drop off
                    </th>
                    <th scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Trip Cost
                    </th>
                    <th scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">                                   
                      Status
                    </th> 
                    <th scope="col" 
                      className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only"></span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#FAFAFB]">
                  {filteredAllocation.map((trip, index) => (
                    <Fragment key={index}>
                    <div className="w-full mb-2 font-nunito font-regular"></div>
                      <tr className="bg-[#FAFAFB] hover:bg-gray-100" onClick={() => handleTripClick(trip)} style={{ cursor: 'pointer' }}
                         >
                        <td 
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"  
                        >
                        {trip.tripId}
                        </td>
                        <td 
                          className="whitespace-nowrap px-2 py-2 relative">
                          {trip.vehicle}
                          </td>
                        <td 
                         className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" 
                           >
                          {trip.drop_off_location}
                          </td>
                        <td 
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" 
                        >{trip.pick_up_location}
                        </td>
                        <td 
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" 
                         >
                          Ksh {trip.dealValue}
                          </td>
                        <td 
                         className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                           >
                          <button
                            className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(trip);
                            }}
                          >
                            {["Booked", "Ready for Departure", "At the border", "Offloading dest", "On Route", "Mechanical", "Done", "Returning the Container"].includes(trip.trip_status) ? trip.trip_status : "Status"}
                          </button>
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
}


