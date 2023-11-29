import {Header, HeaderBar} from "@/components/Headers";
import DummyTable, {ClientsTable} from "@/components/Table/Table";
import {Input, Submit} from "@/components/Forms/input";
import {AddButton, Button} from "@/components/Buttons";
import {ArrowDownTrayIcon, ChevronDownIcon, InboxArrowDownIcon, PlusIcon} from "@heroicons/react/24/solid";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {FormModal} from "@/components/Modals/FormModal";
import {Fragment, SetStateAction, useEffect, useState} from "react";
// import SearchBar from "../../components/Forms/input"
import SiteLayout from "@/Layout/SiteLayout";
import { fbDb } from "@/firebase/configs";
import { getDocs, collection, DocumentData, Timestamp, addDoc, doc, setDoc } from "firebase/firestore";
import { Field,Formik,Form,useFormik,FormikHelpers } from "formik";  
import  setFieldValue from "formik";  
import { Tab } from "@headlessui/react";
import Maintenance from "../Vehicles/maintanance";
import VehicleAllocation from "../Vehicles/vehicle_allocation";
import { useRouter } from "next/router"; 
import  AllTrips from "./allTrips"
import { AnyIfEmpty } from "react-redux"; 
import { ErrorMessage } from 'formik'; 
import exportDataToCSV  from "../../components/Exports/tripsExport";   
import toast from "react-hot-toast";
// Update the import path

const tabs = [ 
  { key: 'all', name: 'All' },
  { key: 'onRoute', name: 'On Route' },
  { key: 'waiting', name: 'Waiting' },
  { key: 'complete', name: 'Complete' },
]; 
const SearchBar = ({ placeholder, value, onChange }:any) => {
  return (
    <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-96	 mx-auto p-2 rounded-md outline-none  focus:border-blue-600 text-xs text-gray-900 focus:bg-white disabled:opacity-50 invalid:border-red-500 invalid:text-red-600
		focus:invalid:border-red-500 focus:invalid:ring-red-500; bg-white w-64"
    />
  );
};


export default function TripsComponent() {
    const [open, setOpen] = useState(false)  
    const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
    const [drivers, setDrivers] = useState<{ id: string; name: string; phonenumber: string }[]>([]);  
    // const [vehicles, setVehicles] = useState<{ id: string; name: string; availability_status: string; lisence_plate: string }[]>([]); 
    const [companies, setCompanies] = useState<{id:string; name: string; vehicle: string[] }[]>([]); 
    const [selected, setSelected] = useState(""); 
    const [selectedCompanyVehicles, setSelectedCompanyVehicles]=useState<string[]>([]);  
    const [companyDetailsFetched, setCompanyDetailsFetched] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState('');

    // const [selectedCompanyVehicles, setSelectedCompanyVehicles] = useState([]);
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedTrips, setfetchedTrips]=useState<DocumentData[]>([]);   
    const [fetchedClients, setfetchedClients]=useState<DocumentData[]>([]);   
    const [fetchedCompanies, setfetchedCompanies]=useState<DocumentData[]>([]);  
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");  
    const [selectedTrip, setSelectedTrip] = useState<DocumentData | null>(null); 
    const [editModalOpen, setEditModalOpen] = useState(false); 
    const [isExporting, setIsExporting] = useState(false);

 
    const [editFormInitialValues, setEditFormInitialValues] = useState({
        requested_by: "",  
        vehicle: "",
        pick_up_location: "", 
        drop_off_location: "",  
        start_time: "", 
        end_time: "", 
        cargo_type: "", 
        cargo_quantity: "", 
        memo: "",  
        trip_status: "", 
      });
    const router=useRouter() 
    const handleSearchChange = (e:any) => {
        const query = e.target.value;
        console.log("Search Query:", query);
        setSearchQuery(query);
      };  
      const filteredTrips = fetchedTrips.filter((trip) => {
        const fullName = `${trip.vehicle}`.toLowerCase();
        const nameMatch = fullName.includes(searchQuery.toLowerCase());
          return nameMatch;
      });  
    const handleAddTrip = () => {
        setOpen(true)
    }
 
    const handleReset = () => {
        setOpen(false)
    }   
    const handleClick = () => {
      setOpen(false)
  }
    const updateSelectedCompanyVehicles = (companyName: string) => {
      if (companyName) {
        const company = companies.find((company) => company.name === companyName);
        if (company) {
          setSelectedCompanyVehicles(company.vehicle); 
          console.log(setSelectedCompanyVehicles); 

          
        }
      } else {
        setSelectedCompanyVehicles([]);
      }
    };
    useEffect(() => { 
      const fetchDrivers = async () => {
          try {
              const querySnapshot = await getDocs(collection(fbDb, 'drivers'));
              const driverDetails = querySnapshot.docs.map(doc => {
                  const data = doc.data();
                  return {
                      id: doc.id,
                      name: data.name,
                      phonenumber: data.phonenumber,  
                  };
              });
              setDrivers(driverDetails);
          } catch (error) {
              console.error('Error fetching Drivers:', error);
          }
      }; 
      
      const fetchedClients = async () => {
        try {
            const querySnapshot = await getDocs(collection(fbDb, 'clients'));  
            console.log(querySnapshot);
            const clientsData: DocumentData[] = []; 
            console.log(clientsData);
            
            querySnapshot.forEach((doc) => {
                const clients = {
                    id: doc.id,
                    ...doc.data()
                };
                clientsData.push(clients);
            });
            setfetchedClients(clientsData);
        } catch (error) {
            console.error('Error fetching Clients:', error);
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
              console.log("tripsData",tripsData);
              
          } catch (error) {
              console.error('Error fetching Trips:', error);
          }
      }; 
      const fetchedCompanies = async () => {
        try {
          const querySnapshot = await getDocs(collection(fbDb, 'companies'));
          const companyDetails = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              vehicle: data.vehicle || [], // Ensure it's an array
            };
          });
          setCompanies(companyDetails);
          if (companyDetails.length > 0) {
            setSelectedCompany(companyDetails[0].name); // Set the first company as the default selected company
            setSelectedCompanyVehicles(companyDetails[0].vehicle); // Set its vehicles
          }
        } catch (error) {
          console.error('Error fetching Vehicle details:', error);
        }
      }
      fetchedTrips(); 
      fetchedClients();
      fetchDrivers(); 
      fetchedCompanies(); 
  }, []); 
  console.log(selectedCompanyVehicles,"SelectedCompanyVehicles"); 
  console.log(selectedCompany,"SelectedCompany");


    const handleEditClick = (trip: DocumentData) => {
        setSelectedTrip(trip);
        setEditFormInitialValues({
            requested_by: trip.requested_by,
            vehicle: trip.vehicle,
            pick_up_location: trip.pick_up_location,
            drop_off_location:trip.drop_off_location,
            start_time:trip.start_time,
            end_time:trip.end_time,  
            cargo_type:trip.cargo_type, 
            cargo_quantity:trip.cargo_quantity, 
            memo:trip.memo,   
            trip_status:trip.trip_status,

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
        trip_status:any 

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
      
          if (
            !values.trip_status
          ) 
           {
            console.error("Required form fields are missing"); 
            toast.error("Required form fields are missing");
            return;
          }  
          
          // Update the vehicle data in the database using the selectedVehicle.id
          const AdminRef = doc(fbDb, "trips", selectedTrip.id);
          await setDoc(AdminRef, {
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
                }
              : trip
          );
          setfetchedTrips(updatedVehicles);
          setSelectedTrip(null);
          setEditModalOpen(false);
        } catch (error) {
          console.error("Error updating Admin:", error);
        }
      }; 
   
    const handleSubmit = async (values: { requested_by: string; pick_up_location: string; drop_off_location: string; vehicle: string; start_time: string; end_time: string; cargo_type: string; cargo_quantity: string; memo: string; company: string; client: string; dealValue: number;}) => {
        setOpen(false); 
        console.log("Submitted Values:", values);
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.requested_by || !values.vehicle || !values.pick_up_location || !values.drop_off_location || !values.start_time || !values.end_time || !values.cargo_type || !values.cargo_quantity || !values.company||values.client||values.dealValue      
            ) {
                console.error('Required form fields are missing');
                return;
            }
    
            const startDateObj = new Date(values.start_time + "T00:00:00");
            const endDateObj = new Date(values.end_time + "T00:00:00");
    
            const startTimestamp = Timestamp.fromDate(startDateObj);
            const endTimestamp = Timestamp.fromDate(endDateObj);
    
            // Find the selected driver based on the provided name
            const selectedDriver = drivers.find(driver => driver.name === values.requested_by);
    
            // Find the selected vehicle based on the provided license plate
            // const selectedVehicle = vehicles.find(vehicle => vehicle.lisence_plate === values.vehicle);
    
            if (!selectedDriver) {
                console.error('Selected driver or vehicle not found');
                return;
            }
    
            const maintenanceData = {
                requested_by: {
                    id: selectedDriver.id,
                    name: selectedDriver.name,
                    phonenumber: selectedDriver.phonenumber
                },
                vehicle:values.vehicle,
                start_time: startTimestamp,
                end_time: endTimestamp, 
                pick_up_location: values.pick_up_location,
                drop_off_location: values.drop_off_location,
                cargo_type: values.cargo_type,
                cargo_quantity: values.cargo_quantity,
                memo: values.memo,
                company: values.company,  
                trip_status:"", 
                client:values.client, 
                dealValue: values.dealValue,
 
            };

    
            const docRef = await addDoc(collection(fbDb, 'trips'), maintenanceData);
            console.log('Trip added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding Trip:', error);
        }
    }   
    const handleCompanyChange = (selectedCompanyName: SetStateAction<string>) => {
      setSelectedCompany(selectedCompanyName);
    };
    const handleExportButtonClick = async () => {
      setIsExporting(true);
  
      try {
        const csvData = await exportDataToCSV();
  
        // Create a blob and initiate the download
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "exported-data.csv";
        a.click();
      } catch (error) {
        console.error("Error exporting data:", error);
      }
  
      setIsExporting(false);
    }; 
    const currentTimestamp = Date.now();
    const currentDate = new Date();

    const countTrips = (selectedTab: number) => {
      switch (selectedTab) {
        case 0:
          // Count all trips
          return filteredTrips.length;
        case 1:
          // Count trips where the current date is within the trip's start and end times
          return filteredTrips.filter((trip) => {
            const startTime = new Date(trip.start_time.seconds * 1000);
            const endTime = new Date(trip.end_time.seconds * 1000);
            return currentDate >= startTime && currentDate < endTime;
          }).length;
        case 2:
        case 3:
          // Count trips where the current date is greater than the trip's end time
          return filteredTrips.filter((trip) => {
            const endTime = new Date(trip.end_time.seconds * 1000);
            return currentDate > endTime;
          }).length;
        default:
          return 0;
      }
    };

    
    const allTripsCount = countTrips(0);
    const onRouteTripsCount = countTrips(1);
    const completeTripsCount = countTrips(2);
    const waitingTripsCount = countTrips(3);

    return (
            <SiteLayout>
            <div>
            <p className="text-lg font-nunito font-bold mt-2 ml-5">Trips</p> 
            <div className="flex flex-col">  
                <div className="flex flex-row">
                     <Tab.Group>
                      <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start">
                        {tabs.map((tab, index) => (
                         <Tab
                           key={index}
                            className={`${
                            selectedTab === index ? 'rounded-md bg-d-green text-white' : 'text-black bg-white'
                              } w-40 flex justify-between items-center h-10 pl-4 text-base pr-2 mr-2 cursor-pointer font-bold`}
                           onClick={() => {
                           console.log("Tab Clicked", index);
                           setSelectedTab(index);
                              }}
                                >
                            <div>{tab.name}</div>
                           <div
                         className={`${
                           selectedTab === index ? 'bg-dd-green' : 'bg-grey'
                           } w-12 text-center py-1 rounded`}
                            >
                            {tab.key === 'all' ? allTripsCount : tab.key === 'onRoute' ? onRouteTripsCount : tab.key === 'complete' ? completeTripsCount : waitingTripsCount}
                          </div>
                           </Tab>
                           ))}
                          </Tab.List>
                        </Tab.Group>  
                        <div className='flex justify-end'>
                    <div className='flex'>
                        <Button className='bg-white px-3 uppercase flex items-center rounded text-base font-semibold' handleClick={handleClick}>
                            Nairobi,Kenya
                            <ChevronDownIcon className='ml-4 h-4 w-4'/>
                        </Button>

                        {/* <Button className='ml-2 bg-white px-3 uppercase flex items-center rounded text-base font-semibold' handleClick={handleClick}>
                        Today
                        <ChevronDownIcon className='ml-4 h-4 w-4'/>
                    </Button> */}

                    </div>

                </div> 
                        </div>

                 <div className='flex w-full flex-row mt-6'>  
                <div className=" ml-5 w-full">
                <SearchBar
                  placeholder='Search  for track Delivery status, destination '
                  value={searchQuery}
                  onChange={handleSearchChange} 
                  className='w-96'
                /> 
                </div>
                    <div className='flex  right-4'>
                        <button className='bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded'
                                onClick={handleExportButtonClick} 
                                disabled={isExporting}

                                >
                            <>
                                <ArrowDownTrayIcon className='h-6 w-6 mr-2'/>
                                Export

                            </>
                        </button>

                        <Button className='ml-4 bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded'
                                handleClick={handleAddTrip}>
                            <>
                                <PlusIcon className='h-6 w-6 mr-2'/>
                                Add Trip
                            </>
                        </Button> 
                    </div>
                </div> 
                </div>
                <div className='mt-4'> 
                        <Tab.Group>
   
                    <Tab.Panels>
                    <Tab.Panel>
                     {selectedTab === 0 ? (
                       <div className="max-h-[500px] overflow-y-auto">
                           <AllTrips searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
                           </div>
                          ) : (
                     <div className="max-h-[500px] overflow-y-auto">
                      <TripsTable selectedTab={selectedTab} trips={fetchedTrips} filteredTrips={filteredTrips} handleEditClick={handleEditClick}/>
                     </div>
                         )}
                      </Tab.Panel>
                       <Tab.Panel>
                        <div className="max-h-[500px] overflow-y-auto">
                          <TripsTable selectedTab={1} trips={fetchedTrips} filteredTrips={filteredTrips}handleEditClick={handleEditClick}/>
                       </div>
                          </Tab.Panel>
                        <Tab.Panel>
                          <div className="max-h-[500px] overflow-y-auto">
                           <TripsTable selectedTab={2} trips={fetchedTrips} filteredTrips={filteredTrips} handleEditClick={handleEditClick} />
                         </div>
                         </Tab.Panel>
                         <Tab.Panel>
                         <div className="max-h-[500px] overflow-y-auto">
                         <TripsTable selectedTab={3} trips={fetchedTrips} filteredTrips={filteredTrips}handleEditClick={handleEditClick}/>
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
                        cargo_quantity: "", 
                        memo: "", 
                        company: "", 
                        client: "", 
                        dealValue: 0, 


            
                                      }}
                        onSubmit={(values) => handleSubmit(values)  
                        }  
                        >
                       {({ values,setFieldValue }) => (
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
                             <label className="form-label">CLASS</label>.
                             <Field
                             as="select"
                              name="company"
                               value={values.company}
                               onChange={async (e: any) => {
                                const selectedCompanyName = e.target.value;
                                handleCompanyChange(selectedCompanyName); 
                                console.log("selectedCompanyName",selectedCompanyName);
                                
                            
                                // Disable the submit button and reset the fetched flag
                                setCompanyDetailsFetched(false);                            
                                // Find the selected company's vehicles and set them  
                                const selectedCompanyDetails = companies.find(
                                  (company) => company.name === selectedCompanyName
                                );     
                                setSelectedCompanyVehicles(
                                  selectedCompanyDetails ? selectedCompanyDetails.vehicle : []
                                );
                                // Enable the submit button and set the fetched flag
                                setCompanyDetailsFetched(true);
                                console.log(selectedCompanyDetails);
                                console.log(values.company); 
                                setFieldValue("company", selectedCompanyName);

                             }} 
                             className="form-input bg-grey w-48"
                                >
                              {/* <option value="">Select a company</option> */}
                              {companies.map((company, index) => (
                              <option key={index} value={company.name}>
                              {company.name}
                              </option>
                               ))}
                              </Field>  
                            </label> 
                            <label className="block">
                             <label className="form-label">CLIENT</label>
                             <Field
                              as="select"
                              name="client"  
                             value={values.client}
                             className="form-input bg-grey w-48"
                            >
                           {fetchedClients.map((client, index) => (
                           <option key={index} value={client.name}>
                           {client.name}   
                           </option>
                           ))}
                         </Field> 
                             </label>     
   
                             </div>  
                             <div className="mt-8 flex w-full justify-between">
                             <label className="block">
                             <label className="form-label">SELECT DRIVER</label>
                             <Field
                              as="select"
                              name="requested_by"  
                             value={values.requested_by}
                             className="form-input bg-grey w-48"
                            >
                           {drivers.map((driver, index) => (
                           <option key={index} value={driver.name}>
                           {driver.name}   
                           {/* Display additional driver details */}
                           </option>
                           ))}
                         </Field> 
                             </label>  
                             <label className="block">
                             <label className="form-label">VEHICLE</label>.
                             <Field
                               as="select"
                               name="vehicle"
                               value={values.vehicle}
                               className="form-input bg-grey w-48"
                              >
                             <option value="">Select a Vehicle</option>
                             {selectedCompanyVehicles.map((vehicle, index) => (
                              <option key={index} value={vehicle}>
                              {vehicle}
                              </option> 
    
                             ))}   
                           </Field>
                             </label> 
                             </div>  
                             <div className="mt-8"> 
                             <label className="block mt-8">
                             <label className="form-label">Deal Value</label>
                             <Field
                             type="number"
                             name="dealValue"
                             value={values.dealValue} 
                             placeholder="Ksh"
                             className="form-input bg-grey w-48"
                            />
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
                             <label className="form-label">Container Number</label>
                             <Field
                             type="text"
                             name="cargo_quantity"
                             value={values.cargo_quantity}
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
                                <Button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' handleClick={handleReset}>Reset</Button>
                                <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4' type='submit' >Save</button>
                            </div>

                        </div>
                    </Form>
                     )}
                    </Formik>
                </div>
            </FormModal>   

            {editModalOpen && selectedTrip && (
                <FormModal open={editModalOpen} setOpen={handleEditModalClose}> 
                <div>
                <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Edit Trip Details
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
                             disabled
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
                             value={values.requested_by }
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

            </SiteLayout>
        
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
        // Calculate the difference in milliseconds
        const differenceInMilliseconds = endTime - startTime;
      
        // Convert milliseconds to hours and round to nearest whole number
        const differenceInHours = Math.round(differenceInMilliseconds / (1000 * 60 * 60));
      
        return differenceInHours;
      };   
      const tripsPerVehicle: TripsPerVehicle = {};
      const currentDate = new Date();
      const filteredAllocation = filteredTrips.filter(trip => {
        const startTime = new Date(trip.start_time.seconds * 1000);
        const endTime = new Date(trip.end_time.seconds * 1000);
      
        switch (selectedTab) {
          case 0:
            // Show all trips
            return true;
          case 1:
            // Show trips whose start_time has reached but end_time hasn't reached
            return currentDate >= startTime && currentDate < endTime;
          case 2:
            // Show completed trips where both start_time and end_time have already passed
            return currentDate > endTime;
          case 3:
            // Show completed trips where both start_time and end_time have already passed
            return currentDate > endTime;
          case 4:
            // Show completed trips where both start_time and end_time have already passed
            return currentDate > endTime;
          default:
            return false;
        }
      })
      // Sort the filteredAllocation array only if selectedTab is 3 (fourth tab)
      .sort((a, b) => selectedTab === 3
      ? Number(new Date(b.end_time.seconds * 1000)) - Number(new Date(a.end_time.seconds * 1000))
      : 0);
           
      console.log("Selected Tab", selectedTab);  


      const formatTripId = (currentMonth: string, tripCount: { toString: () => string; }, vehicle: any) => {
        const formattedMonth = currentMonth.substring(0, 3); // Get the first three characters of the month
        const formattedTripCount = tripCount.toString().padStart(2, '0'); // Ensure two-digit trip count
        return `${formattedMonth} ${formattedTripCount} ${vehicle}`;
      };
      

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
                                {/* <th
                                    scope="col"
                                    className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
                                >
                                    Distance
                                </th> */}
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
                                    {/* Status */}
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200  bg-[#FAFAFB]">
                            {filteredAllocation.map((trip,index) => {  
                            const vehicle = trip.vehicle; // Assuming trip.vehicle contains the vehicle identifier
                            const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date());
                          // Determine the months the trip spans
                           const startMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(trip.start_time.toDate());
                           const endMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(trip.end_time.toDate());

                          // Update trip count and month for the vehicle
                           const tripCount = (tripsPerVehicle[vehicle]?.count || 0) + calculateTripCount(startMonth, endMonth, currentMonth);
                           const lastMonth = endMonth; // Assuming the last month is the end month of the trip
                           tripsPerVehicle[vehicle] = { count: tripCount, lastMonth };
                       // Format the trip ID
                           const formattedTripCount = tripCount.toString().padStart(2, '0');
                           const tripId = `${lastMonth} ${formattedTripCount} ${vehicle}`;
                                     return( 
                                        <Fragment key={index}>  
                                     <div className="w-full mb-2 font-nunito font-regular"></div>
                                   <tr key={tripId} className='my-2 border-solid border-2  bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>
                                    <td className="whitespace-nowrap py-2 pl-4 pr-3  text-d-blue sm:pl-0"  onClick={() => handleTripClick(trip)}>
                                      {tripId}
                                      </td>
                                    <td className="whitespace-nowrap px-2 py-2 ">
                                    {trip.vehicle}                                   
                                     </td>
                                    <td className="whitespace-nowrap px-2 py-2  ">{trip.drop_off_location}</td>
                                    <td className="whitespace-nowrap px-2 py-2  ">{trip.pick_up_location}</td>
                                    {/* <td className="whitespace-nowrap px-2 py-2  ">100KM</td> */}
                                    <td className="whitespace-nowrap px-2 py-2">
                                   {calculateHourDifference(trip.start_time.toDate(), trip.end_time.toDate())} Hours
                                    </td>
                                    <td className="whitespace-nowrap px-2 py-2   text-black">{trip.dealValue}</td>
                                    {/* <td className="whitespace-nowrap py-2  px-2 text-left font-medium">
                                        <button
                                        className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2" 
                                        onClick={()=>handleEditClick(trip)}
                                        > 
                                        Status
                                        </button>
                                    </td> */} 
                                    <td className="whitespace-nowrap py-2 px-2 text-left font-medium">
                                   <button
                                     className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2" 
                                     onClick={() => handleEditClick(trip)}
                                      > 
                                   {["Booked", "Ready for Departure", "At the border", "Offloading dest", "On Route", "Mechanical", "Done", "Returning the Container"].includes(trip.trip_status) ? trip.trip_status : "Status"}
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
        </div>
    )
}


   