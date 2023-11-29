import { doc, getDoc, getDocs,query,collection,where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { fbDb } from '@/firebase/configs';
import SiteLayout from "@/Layout/SiteLayout";
import HamburgerMenu from '@/components/hamburgerMenu';

interface DriverDetailsProps {
  driverId: string;
  driver: {
    name: string;
    phonenumber: string;
    email_adress: string;
    gender: string;
    country: string;
    city: string;
    vehicle_type: string;
    model: string;
    year: string;
    number: string;
    profile: string;
    completedTrips:string;
  };
}

const DriverDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [driverDetails, setDriverDetails] = useState<DriverDetailsProps['driver'] | null>(null);
  const [tripCount, setTripCount] = useState<number>(0);


  useEffect(() => {
    const fetchDriverDetails = async () => {
      if (id) {
        try {
          const driverDocRef = doc(fbDb, 'drivers', id as string);
          const driverDocSnap = await getDoc(driverDocRef);

          if (driverDocSnap.exists()) {
            const driverData = driverDocSnap.data() as DriverDetailsProps['driver'];
            setDriverDetails(driverData);

            // Query trips for the specific driver
            const tripsQuerySnapshot = await getDocs(query(collection(fbDb, 'trips'), where('requested_by', '==', driverDocRef)));

            // Get the number of trips
            const numberOfTrips = tripsQuerySnapshot.size;
            setTripCount(numberOfTrips);
          } else {
            console.log('Driver not found');
          }
        } catch (error) {
          console.error('Error fetching driver:', error);
        }
      }
    };

    fetchDriverDetails();
  }, [id]);

  if (!driverDetails) {
    return <div>Loading...</div>;
  }

  return (  
    <SiteLayout> 

    <p className=' ml-10 font-bold mt-8 p-4'>Driver</p>

    <div className='ml-10 flex flex-row'> 
     <div className="max-w-sm rounded-md bg-white flex justify-center items-center
      overflow-hidden shadow-sm	">
     <div className="px-6 py-4">
      <div className=" border-2 w-36 h-36 border-[#B6D1F9] rounded-full text-xl mb-2">
      <img className='w-full h-full rounded-full' src={driverDetails.profile} alt="Driver Profile" />
       </div>

    <p className="text-gray-700 text-sm"> 
      <p className='p-2'>Name: {driverDetails.name}</p>
      <p className='p-2'>Email Address: {driverDetails.email_adress}</p>
      <p className='p-2'>Phone Number: {driverDetails.phonenumber}</p>
    </p>
  </div>
</div>
   
<div className='flex justify-between'> 
<div className='flex flex-col'> 
<div className="max-w-sm rounded-md bg-white ml-20 overflow-hidden shadow-sm">
  <div className="px-6 py-4">
    <p className="text-gray-700 mt-6 font-bold text-xl"> 
    <p>Completed Trips: {tripCount}</p></p> 
    <div className="px-6 pt-4 pb-2">
    <span className="inline-block px-3 py-1 text-sm font-semibold text-gray-700 mt-12 mb-2">Number of trips completed</span>
    {tripCount}
  </div>
  </div> 
</div>

<div className="max-w-sm rounded-md ml-20 overflow-hidden mt-2 shadow-sm bg-white">
  <div className="px-6 py-4"> 
  <div className='divide-y divide-[#D9E2F6]'>
    <p className="text-gray-700 mt-6 font-bold text-xl"> 
    <p className='font-semibold'>Driver Rating Per Trip</p> 
    </p>  
    </div>
    <div className='flex flex-col'>  
    <div className="flex justify-center flex-row">
    <i className="fa-solid fa-star fa-2x text-[#EEB506] h-4 w-4 mt-2"></i>  
    <span className='text-2xl ml-10 mt-2 font-bold text-[#030229]'>4.91</span>
  </div> 
  <span className='text-xs text-[#030229] font-nunito font-regular ml-12'>Drivers Current Rating </span>
  </div>   
  <div className='flex flex-row'> 
  <span className='text-[#030229] font-nunito text-sm ml-4'>All Trips</span> 
  <span className='text-[#030229] font-nunito text-sm ml-4'>Rated Trips</span>
  <span className='text-[#030229] font-nunito text-sm ml-4'>5 -Stars Trips</span>
  </div>
  
  </div> 
</div> 
</div>



<div className='flex flex-col'>
<div className="max-w-sm rounded-md ml-5 overflow-hidden shadow-sm bg-white">
  <div className="px-6 py-4"> 
  <p className='font-semibold'>Vehicle Info</p> 
  <div className='flex justify-between'>
    <p className="text-gray-700 text-sm mt-6"> 
    <p className='text-sm text-black'>Vehicle Type </p>
     {driverDetails.vehicle_type}
    </p>  
    <p className="text-gray-700 ml-8 text-sm mt-6"> 
    <p className='text-sm text-black'>Vehicle model</p>
    {driverDetails.model}    
    </p>
    </div> 
    <div className='flex justify-between'> 
    <p className="text-gray-700 text-sm mt-6"> 
    <p className='text-sm text-black'> Year  </p>
     {driverDetails.year}
    </p>  
    <p className="text-gray-700 ml-8 text-sm mt-6"> 
    <p className='text-sm text-black'>Number</p>
    {driverDetails.number}    
    </p>

      </div> 

  </div> 
</div> 

<div className="max-w-sm rounded-md ml-5 mt-2 overflow-hidden shadow-sm bg-white">
<div className="px-2 py-4"> 
<p className='font-semibold mt-2'>Additional Info</p> 
<div className='flex justify-between'>
  <p className="text-gray-700 text-sm mt-6"> 
  <p className='text-sm text-black'>Country</p>
  <p className='text-sm font-bold text-black'> {driverDetails.country} , {driverDetails.city}</p>
  </p>  
  <p className="text-gray-700 ml-10 text-sm mt-6"> 
  <p className='text-sm text-black '>Vehicle model</p>
 <p  className='text-sm font-bold text-black'>{driverDetails.model} </p>    
  </p>
  </div> 
  <div className='flex justify-between'> 
  <p className="text-gray-700 text-sm mt-6"> 
  <p className='text-sm text-black'> Gender  </p>
   {driverDetails.gender}
  </p>  
    </div> 

</div> 
</div>    

</div>  
</div>

    </div> 
  
    </SiteLayout>
  );
};

export default DriverDetailsPage;


