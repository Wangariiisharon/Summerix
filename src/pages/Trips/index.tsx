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
import { getDocs, collection, DocumentData, Timestamp, addDoc } from "firebase/firestore";
import { Field, Formik,Form } from "formik";
import { Tab } from "@headlessui/react";
import Maintenance from "../Vehicles/maintanance";
import VehicleAllocation from "../Vehicles/vehicle_allocation";




const tabs = [
    {name: 'OVERVIEW', href: '#', current: false},
    {name: 'UPCOMING TRIPS', href: '#', current: false},
]
export default function TripsComponent() {
    const [open, setOpen] = useState(false)  
    const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
    const [vehicleSList,setVehiclesList]=useState([])
    const [drivers, setdrivers] = useState<string[]>([]);  
    const [vehicles, setVehicles] = useState<string[]>([]);  
    const [vehicleNames, setVehicleNames] = useState<string[]>([]); 
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedTrips, setfetchedTrips]=useState<DocumentData[]>([]);  
    const [searchQuery, setSearchQuery] = useState(""); 

 
    const handleSearchChange = (e:any) => {
        const query = e.target.value;
        console.log("Search Query:", query);
        setSearchQuery(query);
      };  
      const filteredTrips = fetchedTrips.filter((trip) => {
        const fullName = `${trip.driver}`.toLowerCase();
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
        const fetchDriver = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'drivers'));
                const names = querySnapshot.docs.map(doc => doc.data().name);
                setdrivers(names);
            } catch (error) {
                console.error('Error fetching Driver names:', error);
            }
        }; 
        const fetchVehicleNames = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'vehicles'));
                const names = querySnapshot.docs.map(doc => doc.data().name);
                setVehicleNames(names);
            } catch (error) {
                console.error('Error fetching Vehicle names:', error);
            }
        }; 
        const fetchedTrips = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'trips'));  
                console.log(querySnapshot);
                const tripsData: DocumentData[] = []; 
                console.log(tripsData);
                
                querySnapshot.forEach((doc) => {
                    const trips = {
                        id: doc.id,
                        ...doc.data()
                    };
                    tripsData.push(trips);
                });
                setfetchedTrips(tripsData);
            } catch (error) {
                console.error('Error fetching Trips:', error);
            }
        };
        fetchedTrips();
        fetchVehicleNames(); 
        fetchDriver();
    }, []);  

    const handleSubmit = async (values: { requested_by: any; pick_up_location:any; drop_off_location:any;vehicle:any; start_time:any; end_time:any; cargo_type:any ; cargo_quantity:any; depature_city:any; arrival_city:any; memo:any}) => {  
        setOpen(false) 
        console.log("Submitted Values:", values); 
    
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.requested_by||!values.vehicle||!values.pick_up_location||!values.drop_off_location||!values.start_time||!values.end_time||!values.cargo_type||!values.cargo_quantity||!values.depature_city||!values.arrival_city) {
                console.error('Required form fields are missing');
                return;
            } 

            const startDateObj = new Date(values.start_time +"T00:00:00");   
            const EndDateObj = new Date(values.end_time +"T00:00:00");  

            const startTimestamp=Timestamp.fromDate(startDateObj) 
            const endTimestamp=Timestamp.fromDate(EndDateObj)



            const maintenanceData = {
                requested_by: values.requested_by, 
                vehicle: values.vehicle, 
                start_time: startTimestamp,  
                end_time: endTimestamp, 
                pick_up_location: values.pick_up_location,  
                drop_off_location: values.drop_off_location, 
                cargo_type: values.cargo_type,
                cargo_quantity: values.cargo_quantity,
                depature_city: values.depature_city,
                arrival_city: values.arrival_city,
                memo: values.memo,
            };
    
            const docRef = await addDoc(collection(fbDb, 'trips'), maintenanceData);
            console.log('Trip added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding Trip:', error);
        } 
    }

    return (
            <SiteLayout>
            <div>
            <p className="text-lg font-nunito font-bold mt-2 ml-5">Trips</p>
                <div className='mt-8 flex justify-between'>
                    <div className='flex'>
                        <FilterBanner active={true} number={'76'} name={'All'}/>
                        <FilterBanner active={false} number={'76'} name='On Route'/>
                        <FilterBanner active={false} number={'76'} name='Waiting'/>
                        <FilterBanner active={false} number={'76'} name='Incomplete'/>
                        <FilterBanner active={false} number={'76'} name='Complete'/>
                    </div>
                    {/* <div className='flex'>
                        <Button className='bg-white px-3 uppercase flex items-center rounded font-semibold' handleClick={handleClick}>
                            Nairobi,Kenya
                            <ChevronDownIcon className='ml-4 h-4 w-4'/>
                        </Button>

                        <Button className='ml-2 bg-white px-3 uppercase flex items-center rounded font-semibold' handleClick={handleClick}>
                        Today
                        <ChevronDownIcon className='ml-4 h-4 w-4'/>
                    </Button>

                    </div> */}

                </div> 

                <div className='flex w-full items-center justify-between my-6'> 
                <SearchBar
                  placeholder='Search  for track Delivery status, destination '
                  value={searchQuery}
                  onChange={handleSearchChange} 
                  className='w-48'
                />
                    <div className='flex'>
                        <Button className='bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded'
                                handleClick={handleAddTrip}>
                            <>
                                <ArrowDownTrayIcon className='h-6 w-6 mr-2'/>
                                Export

                            </>
                        </Button>

                        <Button className='ml-4 bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded'
                                handleClick={handleAddTrip}>
                            <>
                                <PlusIcon className='h-6 w-6 mr-2'/>
                                Add Trip
                            </>
                        </Button> 
                        {/* <div className='ml-2'>
                            <AddButton name='Add Trip' handleAddClick={handleAddTrip}/>
                            </div> */}
                    </div>
                </div>
                {/* <HeaderBar headers={Headers}/> */} 
                <div className='mt-4'> 
                <Tab.Group>
                    <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3"> 
                    {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                    <Tab
                                        className='ui-selected:border-b-4 border-d-green outline-none
                                        ui-selected:text-d-green text-sm font-nunito font-bold uppercase flex flex-row ml-10'  
                                        onClick={() => {
                                            console.log("Tab Clicked", index);
                                            setSelectedTab(index);
                                          }}
                                        >
                                        {tab.name}
                                    </Tab> 
                                        </Fragment> 


                                    )
                                })
                                }
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <TripsTable selectedTab={selectedTab} trips={fetchedTrips} filteredTrips={filteredTrips}/>

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <TripsTable selectedTab={selectedTab} trips={fetchedTrips} filteredTrips={filteredTrips} />
                            </div>
            
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group> 


            </div>
            <FormModal open={open} setOpen={setOpen}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            New Trip
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Formik
                    initialValues={{
                        requested_by: "",  
                        vehicle: "",
                        pick_up_location: "", 
                        drop_off_location: "",  
                        start_time: "", 
                        end_time: "", 
                        cargo_type: "", 
                        cargo_quantity: 0, 
                        depature_city: "", 
                        arrival_city: "", 
                        memo: "",
            
                                      }}
                        onSubmit={(values) => handleSubmit(values)}  
  


                        >
                       {({ values }) => (
                    <Form>
                        <div className=''>
                            <div className='flex w-full justify-between'>  
                            <label className="block">
                             <label className="form-label">PICK UP LOCATION</label>
                             <Field
                             type="text"
                             name="pick_up_location"
                             value={values.pick_up_location}
                             className="form-input bg-grey w-48"
                            />
                            </label>  
                            <label className="block">
                             <label className="form-label">DROP OFF LOCATION</label>
                             <Field
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
                             as="select"
                            name="requested_by"  
                           value={values.requested_by}
                         className="form-input bg-grey w-48" 

                         >
                        {drivers.map((requested_by, index) => (
                        <option key={index} value={requested_by}>
                         {requested_by}
                       </option>
                       ))}
                      </Field>
                             </label>  
                             <label className="block">
                             <label className="form-label">VEHICLE</label>
                             <Field
                             as="select"
                            name="vehicle"  
                           value={values.vehicle}
                         className="form-input bg-grey w-48" 

                         >
                        {vehicleNames.map((vehicle, index) => (
                        <option key={index} value={vehicle}>
                         {vehicle}
                       </option>
            ))}
        </Field>
                             </label>  
                                </div> 
                            <p className="mt-5 font-semibold"> Cargo</p>  
                            <div className='flex w-full justify-between'> 
  
                             <label className="block mt-8">
                             <label className="form-label">Cargo Type</label>
                             <Field
                             type="text"
                             name="cargo_type"
                             value={values.cargo_type}
                             className="form-input bg-grey w-48"
                            />
                            </label>  
                            <label className="block mt-8">
                             <label className="form-label">Cargo Quanitiy</label>
                             <Field
                             type="number"
                             name="cargo_quantity"
                             value={values.cargo_quantity}
                             className="form-input bg-grey w-48"
                            />
                            </label> 
                            </div>  
                            <div className='flex w-full justify-between'> 
  
                          <label className="block mt-8">
                          <label className="form-label">Departure City</label>
                           <Field
                          type="text"
                          name="depature_city"
                         value={values.depature_city}
                         className="form-input bg-grey w-48"
                          />
                        </label>  
                         <label className="block mt-8">
                         <label className="form-label">Arrival City</label>
                         <Field
                         type="text"
                         name="arrival_city"
                         value={values.arrival_city}
                         className="form-input bg-grey w-48"
                        />
                         </label> 
                         </div>  
                            <label className="block mt-8">
                            <label className="form-label">Memo</label>
                            <Field
                             type="text"
                             name="memo"
                             value={values.memo}
                             className="form-input bg-grey w-96 h-20" 
                             placeholder="Optional"
                            />
                            </label> 
                    
     
             
                           
        
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='text-blue text-xl mr-32' handleClick={handleReset}>Reset</Button>
                                <button type='submit' >Save</button>
                            </div>

                        </div>
                    </Form>
                     )}
                    </Formik>
                </div>
            </FormModal> 
            </div>

            </SiteLayout>
        
    )
}  

interface TripsTableProps {
    selectedTab: number;  
    trips: DocumentData[]; 
    filteredTrips: DocumentData[];


}


export function TripsTable({ selectedTab,trips,filteredTrips }: TripsTableProps) { 
    const calculateHourDifference = (startTime: number, endTime: number) => {
        // Calculate the difference in milliseconds
        const differenceInMilliseconds = endTime - startTime;
      
        // Convert milliseconds to hours and round to nearest whole number
        const differenceInHours = Math.round(differenceInMilliseconds / (1000 * 60 * 60));
      
        return differenceInHours;
      };  
      const currentDate = new Date();

      
      const filteredAllocation = filteredTrips.filter((trip: any) => {  
        const maintenanceDate = new Date(trip.start_time.seconds * 1000);
      
        if (selectedTab === 0) {
          // Show all trips for the first tab
          return true;
        } else if (selectedTab === 1) {
          // Show trips with end time that has already passed
        //   return maintenanceDate < currentDate; 
        return currentDate < maintenanceDate;

        }
      
        return true;
      });
      
      
    return ( 
        <div className="px-4 sm:px-6 lg:px-8 bg-[#FAFAFB]">
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
                            <tbody  className="divide-y divide-gray-200  bg-[#FAFAFB]">
                            {filteredAllocation.map((trip) => (
                                <tr key={trip.id} className='my-2 border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>
                                    <td className="whitespace-nowrap py-2 pl-4 pr-3  text-d-blue sm:pl-0">{trip.id}</td>
                                    <td className="whitespace-nowrap px-2 py-4 text-lg font-medium ">
                                    {trip.driver}                                    </td>
                                    <td className="whitespace-nowrap px-2 py-2  ">{trip.drop_off_location}</td>
                                    <td className="whitespace-nowrap px-2 py-2  ">{trip.pick_up_location}</td>
                                    <td className="whitespace-nowrap px-2 py-2  ">100KM</td>
                                    <td className="whitespace-nowrap px-2 py-2">
                                   {calculateHourDifference(trip.start_time.toDate(), trip.end_time.toDate())} Hours
                                    </td>
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

interface Props {
    active: boolean
    number: string
    name: string
}

export function FilterBanner({active, number, name}: Props) {
    return (
        <>
            <div
                className={`${active ? 'rounded-md bg-d-green text-white' : 'text-black bg-white'}  
                w-40 flex justify-between items-center h-10 pl-4 pr-2  mr-2 cursor-pointer font-bold`}>
                <div className=' '>
                    {name}
                </div>
                <div className={`${active ? 'bg-dd-green' : 'bg-grey'} w-12 text-center py-1 rounded`}>
                    {number}
                </div>
            </div>
        </>
    )

}
