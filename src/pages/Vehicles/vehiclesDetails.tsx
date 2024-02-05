import { DocumentData, collection, doc, getDoc, getDocs } from 'firebase/firestore';
 import { useRouter } from 'next/router';
 import React, { useEffect, useRef, useState } from 'react';
 import { fbDb } from '@/firebase/configs';
 import SiteLayout from "@/Layout/SiteLayout";
import Link from 'next/link'; 
import {Doughnut} from "react-chartjs-2";
import { Timestamp } from 'firebase/firestore';
import {ThisWeek} from "@/pages/Dashboard/index"; 
import Image from 'next/image' 
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons"; 
import {PlusIcon, XMarkIcon} from "@heroicons/react/24/outline";
import { Field, Formik,Form } from "formik"; 
import {FormModal} from "@/components/Modals/FormModal";
import {Chart as ChartJS, ArcElement, Tooltip, ScriptableContext} from 'chart.js';
import {AnyObject} from "chart.js/dist/types/basic";
import { ChevronDownIcon } from "@heroicons/react/24/outline"; 
import { getFirestore, updateDoc } from 'firebase/firestore'; 
import { format } from 'date-fns'; 
import MapComponent from '../../components/Exports/maps';






ChartJS.register(ArcElement, Tooltip);
const data = {
  datasets: [
    {
      data: [70, 100],
      backgroundColor: ['#20C997', '#F7F8FA'],
      borderWidth: 0,
      borderRadius: 0,
      spacing: 0,
      cutout: 90, 
      radius:50
    },
  ],
};

const options = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
};


interface VehicleDetailsProps {
  vehicleId: string;
  vehicle: {
    id: string; 
    name: string;
    cargo_capacity: string;
    lisence_plate: string;
    vehicle_type: string;
    color: string; 
    supplier: string;  
    availability_status: string; 
    make_and_model: string;
    registration_date: string;
  };
} 
export interface VehicleDetails { 
  vehicleId: string;
  vehicle: {
    id: string; 
    name: string;
    cargo_capacity: string;
    lisence_plate: string;
    vehicle_type: string;
    color: string; 
    supplier: string;  
    availability_status: string; 
    make_and_model: string; 
    registration_date: string;
  };}

// Rest of the code...AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE



export default function VehiclesDetails() { 
    const router = useRouter();
  const { id } = router.query;
  const [vehicleDetails, setvehicleDetails] = useState<VehicleDetailsProps['vehicle'] | null>(null);  
  const [Vehicles, setVehicles] = useState<string[]>([]); 
  const [fetchedTrips, setFetchedTrips]=useState<DocumentData[]>([]);      
  const [tripDetails, setTripDetails] = useState({ start_time: 0, end_time: 0, drop_off_location: "", pick_up_location: "" ,requested_by:{name: ""}}); 
  const [open, setOpen] = useState(false);   
  const [availabilityValue, setAvailabilityValue] = useState(70); 
  const isMounted = useRef(true);

  // useEffect(() => {
  //   return () => {
  //     isMounted.current = false;
  //   };
  // }, []);
 
  const [data, setData] = useState({
    datasets: [
      {
        data: [70, 100],
        backgroundColor: ['#20C997', '#F7F8FA'],
        borderWidth: 0,
        borderRadius: 0,
        spacing: 0,
        cutout: 90,
        radius: 50,
      },
    ],
  });

  const handleAvailabilityReset = () => {
    setOpen(false)
}  
useEffect(() => {
  const fetchVehiclesDetails = async () => {
    if (id) {
      try {
        const vehicleDocRef = doc(fbDb, 'vehicles', id as string);
        const vehicleDocSnap = await getDoc(vehicleDocRef);

        if (vehicleDocSnap.exists()) {
          const vehicleData = vehicleDocSnap.data() as VehicleDetailsProps['vehicle'];
          setvehicleDetails(vehicleData);
          let value = 0;
          switch (vehicleData.availability_status) {
            case 'Available':
              value = 100;
              break;
            case 'On Route':
              value = 70;
              break;
            case 'Out of Service':
              value = 40;
              break;
            default:
              value = 0;
              break;
          }

          // Update the availabilityValue state based on the availability status
          setAvailabilityValue(value);

          // Update the data state based on the availability status
          setData({
            datasets: [
              {
                data: [value, 100 - value],
                backgroundColor: ['#20C997', '#F7F8FA'],
                borderWidth: 0,
                borderRadius: 0,
                spacing: 0,
                cutout: 90,
                radius: 50,
              },
            ],
          });

          // After fetching vehicle details, fetch associated trip data
          fetchData(vehicleData); 

        } else {
          console.log('Vehicle not found');
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
      }
    }
  };

  const fetchData = async (vehicleData: any) => {
    try {
      const querySnapshot = await getDocs(collection(fbDb, 'trips'));
      const tripsData: React.SetStateAction<DocumentData[]> | { id: string; drop_off_location: any; pick_up_location: any; start_time: any; end_time: any; vehicle: any;requested_by: any;}[] = [];
  
      querySnapshot.forEach((doc) => {
        const trip = {
          id: doc.id,
          drop_off_location: doc.data().drop_off_location,
          pick_up_location: doc.data().pick_up_location,
          start_time: doc.data().start_time,
          end_time: doc.data().end_time,
          vehicle: doc.data().vehicle,  // Include the vehicle data in the trip object
          requested_by: doc.data().requested_by,
        };
        tripsData.push(trip);
      });
  
      // Sort tripsData based on start_time in descending order
      const sortedTripsData = tripsData.sort((a, b) => b.start_time - a.start_time);
  
      setFetchedTrips(sortedTripsData);
  
      if (vehicleData) {
        const vehicleId = vehicleData.id;
        
        // Get the most recent trip associated with the vehicle
        const mostRecentTrip = sortedTripsData.find((trip) => trip.vehicle.id === vehicleId);
  
        if (mostRecentTrip) {
          const { drop_off_location, pick_up_location, start_time, end_time,requested_by} = mostRecentTrip;
          setTripDetails({
            drop_off_location,
            pick_up_location,
            start_time,
            end_time, 
            requested_by,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching Trips:', error);
    }
  };
  
    isMounted.current = false;
  

  fetchVehiclesDetails();
}, [id]);

  if (!vehicleDetails) {
    return <div>Loading...</div>;
  } 

  const updateAvailabilityStatus = async (id: any, newAvailabilityStatus: string) => { 
    if (isMounted.current) {
      setOpen(true);
    try {
      const vehicleDocRef = doc(fbDb, 'vehicles', id);
      await updateDoc(vehicleDocRef, { availability_status: newAvailabilityStatus });
      console.log("New AvailabilityStatus:", newAvailabilityStatus);
      console.log('Availability status updated successfully');
    } catch (error) {
      console.error('Error updating availability status:', error);
    } 
  }
  }

function formatDate(timestamp:any) {
  if (isNaN(timestamp)) {
    return 'Invalid date';
  }
  return format(new Date(timestamp * 1000), 'MMM dd / HH:mm');
} 

function formatYear(timestamp: any) {
  if (isNaN(timestamp)) {
    return 'Invalid date';
  }

  // Check if it's a Firestore Timestamp object
  if (timestamp instanceof Timestamp) {
    // Extract seconds from the Timestamp
    const seconds = timestamp.seconds;
    
    // Create a Date object using the seconds
    const dateObject = new Date(seconds * 1000);
    
    return format(dateObject, 'yyyy');
  }

  // If it's not a Timestamp, assume it's a regular timestamp (milliseconds)
  const dateObject = timestamp < 1e12 ? new Date(timestamp * 1000) : new Date(timestamp);

  return format(dateObject, 'yyyy');
}


  return ( 
    <SiteLayout>  
    <div className='flex flex-row mt-2'>
      <div className='mt-2'> 
      <Link href="/Vehicles" className='text-xs font-inter text-[#4FD1C5]'> 
      Back to all vehicles 
      </Link>  
      </div> 
      <div className="ml-96 justify-end right-10">  
                <div>  
                <Button
                className='rounded bg-d-green min-w-[160px] h-8 uppercase text-white text-sm font-semibold flex items-center px-4 mr-2'
                handleClick={updateAvailabilityStatus}>
               <PlusIcon className='h-6 w-6 mr-2' />
               VEHICLE AVALABILITY              
               </Button>
                </div>     
                </div>   
                </div>   
      <div className='flex flex-col mt-5'>
      <div className='flex justify-between mt-2 h-1/6	'>  
      <div className=' h-1/6 bg-white shadow rounded-md'>  
      <div className='flex flex-row'> 
      <i className="fa fa-circle fa-2x text-[#D9D9D9] p-2" aria-hidden="true"></i>
      <div className='ml-6 flex flex-col'> 
        <p className='font-bold font-nunito text-sm	 text-[#030229]'>Vehicle Name</p>  
        <div className='flex flex-row text-[#030229] font-nunito'>  
        <p className='p-2 text-xs	'>{vehicleDetails.name}</p>   
        <p className='p-2 ml-14 text-[#030229] text-sm'>Lisence Plate 
        <span className='ml-2 text-xs'>{vehicleDetails.lisence_plate}</span>
        </p> 
        </div>
      </div>
      </div>  

      <div className='border-t border-gray-200'>   
      <div className='flex flex-col p-4'>  
      <div className='flex justify-between text-sm'>   
      <div className='flex flex-col'>  
      <p className='text-sm'>Status</p>  
      <p className='text-xs font-bold	'>{vehicleDetails.availability_status}</p>   
      </div> 
      <div className='flex flex-col'>  
      <p>Type</p>  
      <p className='text-xs font-bold'>Truck</p>   
      </div> 
      <div className='border-solid border-2 border-[#D9E2F6] flex flex-col rounded-md'>  
      <p className='px-2 pt-2'>Fuel Consumption</p> 
      <p className='font-bold text-xs px-2'>5.99 MPG</p>

      </div>
      </div>
      </div> 
      <div className='flex flex-col p-4'>  
      <div className='flex justify-between text-sm'>   
      <div className='flex flex-col'>  
      <p className='text-sm '>Driver</p>  
      <p className='text-xs font-bold	'>{tripDetails.requested_by.name}</p>   
      </div> 
      <div className='border-solid border-2 border-[#D9E2F6] flex flex-col rounded-md px-2'>  
      <p className='px-2 pt-2 text-sm'>Average Speed</p> 
      <p className='font-bold px-2'>62.5,PH</p>
      </div>
      </div>

      </div>

      </div>
      </div>  
   <div className='bg-white shadow rounded-md ml-8 '>
     <p className='font-bold ml-10'>Vehicle Condition</p>
      <div className="flex flex-col relative">
          <div className='!bg-white' style={{ width: '200px', height: '200px', margin: 'auto' }}>
        <Doughnut data={data} options={options} />
           </div> 
        <p className='font-extrabold text-3xl fa-stack-1x absolute mt-20'>
        {availabilityValue}%
        </p>
        </div>
      </div>

      <div className='bg-white h-1/6 	shadow rounded-md flex flex-col ml-8 px-2'>   
      <div className='flex justify-between mt-2'>  
      <div className='flex flex-row ml-2'>
      <p className=''>Trip</p>  
      <p className='text-[#20C997] text-xs ml-3'>LIVE</p> 
      </div>   
       <p className='font-bold ml-8'>Vehicle Status</p>  
       {/* <p className='ml-5'>Vehicle Status</p> */} 
       <div className={`rounded-full inline-block text-sm	 h-8 ml-8 ${vehicleDetails.availability_status === 'Available' ? 'bg-[#E2E9FB] text-[#0068DD]' : (vehicleDetails.availability_status === 'On Route' ? 'bg-[#B9F3EE] text-[#076960]' : 'bg-[#EAEAEA] text-[#364250]')}`} style={{ width: `${vehicleDetails.availability_status.length * 8}px`, left: '-8px' }}>
                {vehicleDetails.availability_status}
        </div> 
      </div> 
      <div className="border-t border-gray-200 flex flex-col">   
      <div className='flex flex-col text-[#030229]'>  
      <div className='flex flex-row'>
      <div className='flex flex-col'>
      <p className='text-sm'>Start time</p>
      <p className='text-xs font-bold'>{formatDate(tripDetails.start_time)}</p>
     </div>
     <div className='flex flex-col ml-4'>
     <p className='text-sm'>End time</p>
     <p className='text-xs font-bold'>{formatDate(tripDetails.end_time)}</p>
     </div>

       </div> 
       <div className='flex flex-row mt-4'>
      <div className='flex flex-col'> 
      <p className='text-sm'>Distance Covered</p> 
      <p className='text-xs font-bold'>501.4mi</p>
      </div> 
      <div className='flex flex-col ml-4'> 
      <p className='text-sm'>Distance Covered</p> 
      <p className='text-xs font-bold'>10h 5min</p>
      </div>  
      </div>  
      </div>
      </div> 
      <div className=''>  
      {/* <MapComponent
    dropOffLocation={tripDetails.drop_off_location}
    pickUpLocation={tripDetails.pick_up_location} />       */} 
          <MapComponent dropOffLocationName={tripDetails.drop_off_location} pickUpLocationName={tripDetails.pick_up_location} />

  </div>
        
      </div>
      </div>  
      <div className='flex flex-row mt-4'>
      <div className='bg-white w-1/2 h-1/6	 shadow  rounded-md'> 
      <p className='font-bold text-sm ml-4 py-2'> Vehicle  Details</p> 
      <div className='flex flex-row ml-2'> 
      <div className='border-t border-gray-200 flex flex-col'>  
      <p className='text-xs font-bold py-4'>Year</p> 
      <p className='text-xs font-bold py-3'>Color</p>  
      <p className='text-xs font-bold py-4'>License Plate</p>  
      <p className='text-xs font-bold py-4'>Registration Date</p> 
      </div>   
      <div className='flex flex-col ml-40 '> 
      {/* <p className='text-sm py-4'>2023</p>  */}
      <p className='text-sm py-4'>{formatYear(vehicleDetails.registration_date)}</p>
      <p className='text-sm py-4 '>{vehicleDetails.color}</p> 
      <p className='text-sm py-4'>{vehicleDetails.lisence_plate}</p>
      <p className='text-sm py-4'>{formatDate(vehicleDetails.registration_date)}</p>
      </div>   
      </div>
      </div> 
      <div className='bg-white w-1/2 h-1/6 ml-10	 shadow  rounded-md'>   
      <p className='font-bold text-sm ml-4 py-2'> Vehicle  Details</p>  
      <div className='border-t border-gray-200 flex flex-col'> 
      <div className='flex justify-between py-4 ml-2'>   
      <div className='border-solid border-2 bg-[#FEF3F2] border-[#FEF3F2] flex flex-col rounded-md px-2 ml-10'>  
      <p className='px-2 pt-2 text-sm'>8</p> 
      <p className='font-bold text-xs px-2 pb-2'>Overdue</p>
      </div> 
      <div className='border-solid border-2 border-[#D9E2F6] flex flex-col rounded-md mr-10 px-2'>  
      <p className='px-2 pt-2 text-sm'>3</p> 
      <p className='font-bold text-xs px-2 pb-2'>Due Soon</p>
      </div> 
        </div>   
        <div className='border-t border-gray-200 flex flex-row py-2 ml-10'>    
        {/* <i className="fa-light fa-brake-warning text-[#EF6454]"></i>   */}
        <i className="fa-light fa-brake-warning text-[#EF6454]" aria-hidden="true"></i>
        {/* <i className="fa fa-bandcamp" aria-hidden="true"></i> */}
        <div className='flex flex-col'> 
          <p className='font-bold text-xs px-2'>Brakes Repair</p> 
          <p className='text-sm px-2'>Overdue 1000 km</p>
        </div> 
        <div className='ml-40'>    
        <i className="fa-light fa-brake-warning text-[#EF6454]" aria-hidden="true"></i>
        <div className='flex flex-col'> 
          <p className='font-bold text-xs px-2'>Battery</p> 
          <p className='text-sm px-2'>Overdue 1000km</p>
        </div>

        </div>   

        </div>    

        <div className='border-t border-gray-200 flex flex-row ml-10 py-2'>    
        {/* <i className="fa-light fa-brake-warning text-[#EF6454]"></i>   */}
        <i className="fa-light fa-brake-warning text-[#EF6454]" aria-hidden="true"></i>
        {/* <i className="fa fa-bandcamp" aria-hidden="true"></i> */}
        <div className='flex flex-col'> 
          <p className='font-bold text-xs px-2'>Filter Replacement</p> 
          <p className='text-sm px-2'>Overdue 1000 km</p>
        </div> 
        <div className='ml-40'>    
        <i className="fa-light fa-brake-warning text-[#EF6454]" aria-hidden="true"></i>
        <div className='flex flex-col'> 
          <p className='font-bold text-xs px-2'>Oil</p> 
          <p className='text-sm px-2'>Overdue 1000km</p>
        </div>

        </div>   

        </div>   
        <div className='border-t border-gray-200 flex flex-row ml-10 py-2'>    
        {/* <i className="fa-light fa-brake-warning text-[#EF6454]"></i>   */}
        <i className="fa-light fa-brake-warning text-[#EF6454]" aria-hidden="true"></i>
        {/* <i className="fa fa-bandcamp" aria-hidden="true"></i> */}
        <div className='flex flex-col'> 
          <p className='font-bold text-xs px-2'>Rotate Tires</p> 
          <p className='text-sm px-2'>Overdue 1000 km</p>
        </div> 

        </div>  



      </div> 
  

      </div>  


      </div>   
      <FormModal open={open} setOpen={setOpen}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '> 
                        UPDATE AVAILABILITY STATUS
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleAvailabilityReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>
                    <Formik
                       initialValues={{
                        availability_status: vehicleDetails ? vehicleDetails.availability_status : "", // Make sure to populate the initial value
                      }}
                      onSubmit={(values) => {
                        if (vehicleDetails && id) {
                          updateAvailabilityStatus(id, values.availability_status);
                          setOpen(false); // Close the form modal
                        } else {
                          console.error('Invalid vehicle details or ID.');
                        }
                      }}
                      >
                    {({ values }) => (
                          <Form>
                        <div className=''>
                            <div className='flex w-full justify-between'>
                            <label className="block">
                             <label className="form-label">AVAILABILITY STATUS</label>
{/*                 
                                      <Field as="select" name="availability_status"                               
                                      value={values.availability_status} 
                                      className="form-input bg-grey w-48"
                                      >
                                      <option value="Available">Available</option>
                                      <option value="On Route">On Route</option>
                                      <option value="Out Of Service	">Out Of Service	</option> 
                                     </Field> */} 
                                 
                                    <Field 
                                    as="select"
                                    name="availability_status"
                                    value={values.availability_status}
                                     className="form-input bg-grey w-48">
                                   <option value="Available">Available</option>
                                  <option value="On Route">On Route</option>
                                 <option value="Out Of Service">Out Of Service</option>
                                 </Field>


                            </label>                       
                             </div>
     
             
                           
        
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='text-blue text-xl mr-32' handleClick={handleAvailabilityReset}>Reset</Button>
                                {/* <Submit name="save" handleSubmit={handleSubmit}/> */}
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


