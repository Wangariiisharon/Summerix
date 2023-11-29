import { fbDb } from '@/firebase/configs';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react' 
import SiteLayout from "@/Layout/SiteLayout"; 
import Image from 'next/image' 
import { format, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale'; 


 

interface TripDetailsProps {
    TripId: string;
    trip: {
      id: string; 
      requested_by: {        
        id: string;
        name: string;
        phonenumber: string; 
    };
      pick_up_location: string;
      drop_off_location: string;
      start_time: string;
      end_time: string; 
      cargo_type: string;  
      cargo_quantity: number; 
      depature_city: string;  
      arrival_city: string; 
      memo: string; 
      trip_status:string;
      vehicle: {
        id: string;
        name: string;
        availability_status: string;
        lisence_plate: string;
      };
    };
  }
  

export default function ViewTrip() { 
    const router = useRouter();
    const { id } = router.query;
    const [tripDetails, settripDetails] = useState<TripDetailsProps['trip'] | null>(null);  
    const [trip, setTrip] = useState<string[]>([]);   
    const [open, setOpen] = useState(false);  
    
    useEffect(() => {
        const fetchTripsDetails = async () => {
            if (id) {
              try {
                const vehicleDocRef = doc(fbDb, 'trips', id as string);
                const vehicleDocSnap = await getDoc(vehicleDocRef);
          
                if (vehicleDocSnap.exists()) {
                  const tripData = vehicleDocSnap.data() as TripDetailsProps['trip'];
                  settripDetails({
                    ...tripData,
                    vehicle: {  // Ensure 'vehicle' is an object
                      id:  tripData.vehicle.id,  // Replace with the actual vehicle ID
                      name: tripData.vehicle.name,  // Replace with the actual vehicle name
                      availability_status:  tripData.vehicle.availability_status,  // Replace with the actual availability status
                      lisence_plate: tripData.vehicle.lisence_plate  // Assuming 'tripData.vehicle' contains the license plate
                    }
                  });
                } else {
                  console.log('Trip not found');
                }
              } catch (error) {
                console.error('Error fetching trip:', error);
              }
            }
          };
          
          fetchTripsDetails(); 
      }, [id]);
    
      if (!tripDetails) {
        return <div>Loading...</div>;
      }  
 

    const startTimestamp: number = Number(tripDetails.start_time); 
    if (isNaN(startTimestamp)) {
      console.error('Invalid end time provided.');
      return null; 
    }
  
    const formattedStartTime = format(new Date(startTimestamp * 1000), "MMM dd, HH:mm 'EST'");

    const endTimestamp: number = Number(tripDetails.end_time); 
    if (isNaN(endTimestamp)) {
      console.error('Invalid end time provided.');
      return null;
    }
  
    const formattedEndTime = format(new Date(endTimestamp * 1000), "MMM dd, HH:mm 'EST'");

  return ( 
    <SiteLayout> 
    <p className='font-bold text-sm mt-4'>{id}</p> 
    <div className='flex flex-row'>   

    <div className=' w-2/5 bg-white shadow rounded-md flex flex-col'>   
    <p className='text-sm mt-2 ml-2 font-bold'>Trip Details</p>  
    <div className='flex flex-row ml-6'>
     {/* <i className="fa fa-arrows-v fa-3x" aria-hidden="true"></i>    */}
     <Image
      src="/Route Marker.png"
      width={8}
      height={8}
      alt="Route Marker"
    />  
    <div className='flex flex-col'> 
    <div className='flex flex-col mt-4'> 
    <p className='text-xs font-bold'>PICK UP</p>  
    <p className='text-xs font-nunito'>{tripDetails.depature_city} </p>
  
 
    </div> 
    <div className='flex flex-col mt-11'>   
    <p className='text-xs font-bold'>DROP OFF</p>   
    <p className='text-xs font-nunito'>{tripDetails.arrival_city}</p>
    </div> 
        </div>  
        <div className='ml-40 mt-4 flex flex-row'> 
        <div className='flex flex-row'> 
        <i className="fa fa-pie-chart" aria-hidden="true"></i> 
        <div className='flex flex-col'> 
        <p className='text-[#777E96] text-xs'>Fuel</p>  
        <p className='text-[#777E96] text-xs'>Shell</p> 
        </div> 
        </div> 
        <div className='flex flex-row ml-4'> 
        <i className="fa fa-pie-chart" aria-hidden="true"></i> 
        <div className='flex flex-col'> 
        <p className='text-[#777E96] text-xs'>Fuel</p>  
        <p className='text-[#777E96] text-xs'>900</p> 
        </div> 
        </div>
        </div>
    </div>  
    <div>
    <div className='bg-[#EFEFEF] w-50 flex flex-row ml-6 mt-4 mr-4'>   
    <p className='ml-2 text-xs font-bold py-1'>DATE</p> 
    <p className='ml-40 text-xs font-bold py-1'>TRIP STATUS</p>
    </div> 
    <div className='flex-row'>  
    <p className='text-xs font-nunito text-[#777E96] ml-8'>{formattedStartTime}</p> 
    {/* <div className={`rounded-full inline-block text-sm h-8 ml-48 ${tripDetails.trip_status === 'Available' ? 'bg-[#E2E9FB] text-[#0068DD]' : (tripDetails.trip_status === 'On Route' ? 'bg-[#B9F3EE] text-[#076960]' : 'bg-[#EAEAEA] text-[#364250]')}`} style={{ width: `${tripDetails.trip_status.length * 8}px`, left: '-8px' }}>
                {tripDetails.trip_status}
        </div>   */} 
        <div className={`rounded-full inline-block text-sm h-8 ml-48 ${tripDetails.trip_status === 'Available' ? 'bg-[#E2E9FB] text-[#0068DD]' 
    : (tripDetails.trip_status === 'On Route' ? 'bg-[#FDAB3D] text-[#076960]'
    : (tripDetails.trip_status === 'Booked' ? 'bg-[#579BFC] text-[#yourTextColor]'
    : (tripDetails.trip_status === 'Ready for Departure' ? 'bg-[#A25DDC] text-[#yourTextColor]'
    : (tripDetails.trip_status === 'At the border' ? 'bg-[#0086C0] text-[#yourTextColor]'
    : (tripDetails.trip_status === 'Offloading dest' ? 'bg-[#7F5347] text-[#yourTextColor]'
    : (tripDetails.trip_status === 'Mechanical' ? 'bg-[#E2445C] text-[#yourTextColor]'
    : (tripDetails.trip_status === 'Done' ? 'bg-[#00C875] text-[#yourTextColor]'
    : (tripDetails.trip_status === 'Returning the Container' ? 'bg-[#401694] text-[#yourTextColor]'
    : 'bg-[#EAEAEA] text-[#364250]'))))))))}`}
style={{ width: `${tripDetails.trip_status.length * 8}px`, left: '-8px' }}>
    {tripDetails.trip_status}
</div>

    </div> 
    </div> 
    <div> 
        <div className='border-t border-[#D6D6D6] w-50 ml-6 mr-4 mt-2'></div>
        <div className=" bg-[#EFEFEF] w-50 flex flex-row ml-6 mt-4 mr-4"> 
        <p className='ml-2 text-xs font-bold py-1'>DATE</p>  
        <p className='ml-40 text-xs font-bold py-1'>TRIP STATUS</p> 
        </div> 
        <div className='flex-row'>  
    <p className='text-xs font-nunito text-[#777E96] ml-8 mt-2 py-2'>{formattedEndTime}</p> 
    </div>
    </div> 

    <div className='flex flex-col'>  
    <p className='font-bold text-sm ml-6 py-4'>Additional information</p> 
    <div className='border-t border-[#D6D6D6] w-50 ml-6 mr-4 mt-2'></div> 
    <div className='flex flex-row'> 
    <div className='flex flex-row'> 
 
    <i className="fa fa-light fa-truck ml-8 mt-2 "></i>  
    <div className='flex flex-col text-xs'>  
    <p className='text-[#777E96]'>Truck</p> 
    <p className='text-[#071440]'>{tripDetails.vehicle.lisence_plate}</p>
        </div>  
        </div>  
    <div className='flex flex-row ml-14'> 
 <i className="fa fa-regular fa-barcode-read"  aria-hidden="true"></i> 
 <div className='flex flex-col text-xs'>  
 <p className='text-[#777E96]'>Container  No</p> 
 <p className='text-[#071440]'>{tripDetails.cargo_quantity}</p>
     </div>  
     </div>  
     <div className='flex flex-row ml-14'> 
     <i className="fa fa-progress"></i>  
     {/* <i className="fa  fa-barcode" aria-hidden="true"></i> */}

     <div className='flex flex-col text-xs'>  
 <p className='text-[#777E96]'>Distance</p> 
 <p className='text-[#071440]'>50.20 mi</p>
     </div>   

     </div>   
     <div className='flex flex-row ml-14'> 
     {/* <i className="fa fa-clock-o" aria-hidden="true"></i>  */}
     <i className="fa fa-light fa-clock mr-2"></i>
     <div className='flex flex-col text-xs'>  
      <p className='text-[#777E96]'>Time</p> 
       <p className='text-[#071440]'>72 hrs</p>
     </div>   

     </div>   

     </div> 
     <div className='flex flex-row mt-4 pb-4'> 
    <div className='flex flex-row'> 
 
    <i className="fa fa-light fa-truck ml-8 mt-2 "></i>  
    <div className='flex flex-col text-xs'>  
    <p className='text-[#777E96]'>Class</p> 
    <p className='text-[#071440]'>NLA Logistics</p>
        </div>  
        </div>  
    <div className='flex flex-row ml-14'> 
 <i className="fa fa-regular fa-barcode-read"  aria-hidden="true"></i> 
 <div className='flex flex-col text-xs'>  
 <p className='text-[#777E96]'>Deal Value</p> 
 <p className='text-[#071440]'>$732.92</p>
     </div>  
     </div>  
     <div className='flex flex-row ml-14'> 
     <i className="fa fa-progress"></i>  
     {/* <i className="fa  fa-barcode" aria-hidden="true"></i> */}

     <div className='flex flex-col text-xs'>  
 <p className='text-[#777E96]'>Payment</p> 
 <p className='text-[#16D8A9]'>PAID</p>
     </div>   
     </div>   
     </div>
    </div>
    </div> 



    <div className=' w-2/5 bg-white shadow rounded-md flex flex-col ml-20'>   
    <p className='text-sm mt-2 ml-2 font-bold'>Additional Information</p>  
    <div className='flex flex-row ml-6'>
     {/* <i className="fa fa-arrows-v fa-3x" aria-hidden="true"></i>    */}
    
        <div className=' mt-4 flex flex-row'> 
        <div className='flex flex-row'> 
        <i className="fa fa-pie-chart" aria-hidden="true"></i> 
        <div className='flex flex-col'> 
        <p className='text-[#777E96] text-xs'>Deal creation Date</p>  
        <p className='text-[#777E96] text-xs'>2023-01-31</p> 
        </div> 
        </div> 
        <div className='flex flex-row ml-8'> 
        <i className="fa fa-pie-chart" aria-hidden="true"></i> 
        <div className='flex flex-col'> 
        <p className='text-[#777E96] text-xs'>Close Date</p>  
        <p className='text-[#777E96] text-xs'>2023-01-21</p> 
        </div> 
        </div>
        </div> 

    </div>  

    <p className='text-sm mt-10 ml-6 font-bold'>Driver Details</p>   
    {/* <p className='text-sm mt-10 ml-6 font-bold'>{tripDetails.requested_by}</p> */}
    <div className='mt-10 ml-6 flex flex-row'> 
    <div className='bg-[#D9D9D9] w-5 h-5 rounded-md'></div> 
    <div className='flex flex-col '>   
    <p className='text-xs ml-6 '>{tripDetails.requested_by.name}</p>  
    <p className='text-xs ml-6' >{tripDetails.requested_by.phonenumber}</p> 
    </div> 
    <i className="fa fa-solid fa-arrow-progress"></i> 
    <div className='flex flex-col ml-6 '>   
    <p className='text-xs ml-6 '>Trips</p>  
    <p className='text-xs ml-6' >24</p> 
    </div> 
    </div>

    </div>

    </div>
    </SiteLayout>

  )
}