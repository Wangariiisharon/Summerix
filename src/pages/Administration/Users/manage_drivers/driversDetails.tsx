import { doc, getDoc, getDocs,query,collection,where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { fbDb } from '@/firebase/configs';
import SiteLayout from "@/Layout/SiteLayout";
import Link from 'next/link';

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
    registration_date: string;

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
            // const tripsQuerySnapshot = await getDocs(query(collection(fbDb, 'trips'), where('requested_by', '==', driverDocRef)));
            const tripsQuerySnapshot = await getDocs(
              query(collection(fbDb, 'trips'), where('requested_by.id', '==', id))
            );
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
    <div className=' ml-10 mt-4 p-2 flex flex-row'>
    {/* <Link href="/Administration/Users" className='text-sm font-inter text-[#4FD1C5]'> 
      Drivers 
      </Link>  */}
      <p className='text-sm ml-2'>{driverDetails.name}</p>
      </div>
    <div className='ml-10 flex flex-col'> 
     <div className=" rounded-md bg-white flex items-center
      overflow-hidden shadow-sm	w-full">
     <div className="p-4 flex flex-row">
      <div className=" border-2 w-28 h-28  text-xl mb-2  ">
      <img className='w-full h-full rounded-full' src={driverDetails.profile} alt="Driver Profile" /> 
       </div>  
       <div className='ml-2'>
       <p className='p-2  pb-1 text-[##030229] text-base font-bold text-sm '> {driverDetails.name}</p>
      <p className='p-2 text-gray-700 text-sm'>Email Address: {driverDetails.email_adress}</p>
      <p className='p-2 text-gray-700 text-sm'>Phone Number: {driverDetails.phonenumber}</p> 
      </div>
      <div className='border-l border-gray-200 ml-20'>   
      <div className='ml-4  bg-[#FAFAFB]'> 
      <p className='font-bold text-sm ml-6 pt-2'>Completed</p> 
      <div className='flex flex-row bg-[#FAFAFB]'> 
      <div className='p-4'>
      <span className="fa-stack fa-lg">
      <i className="fa fa-stop fa-3x fa-stack-2x text-white" aria-hidden="true"></i>
      <i className="fa fa-truck  fa-stack-1x text-[#065AD8] " aria-hidden="true"></i>
      </span>
      </div> 

      <p className='font-bold text-3xl	 py-4 px-2'>{tripCount}</p> 
      <p className='text-sm py-4 px-2 '>Number of trips <br /> completed</p>
      </div>

        </div> 
      </div>

  </div>
</div>
   
<div className='flex justify-around w-full'> 
<div className='flex justify-around mt-6 w-full'>
<div className="max-w-sm rounded-md  overflow-hidden shadow-md bg-white w-full">
  <div className=""> 
  <div className='font-semibold border-b border-gray-200 p-2 bg-[#FAFAFB] w-full'>Vehicle Info</div>
  <p className='font-semibold'></p> 
  <div className='flex justify-between px-4'> 
  <div className='flex flex-row'>
  <span className="fa-stack fa-lg mt-6">
    <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
    <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
    </span>
    <p className="text-gray-700 text-sm mt-6"> 
    <p className='text-sm text-black'>Vehicle Type </p>
    <p className='text-xs font-bold text-black'>Pickup Truck</p>

    </p> 
  </div>  
  <div className='flex flex-row'>
  <span className="fa-stack fa-lg mt-6">
    <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
    <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
  </span> 

  <p className="text-gray-700  text-sm mt-6"> 
    <p className='text-sm text-black'>Vehicle model</p>
    <p className='text-xs font-bold text-black'>Toyota Hilux</p>

    </p>
  </div>

    </div> 
    <div className='flex justify-between px-4'>
    <div className='flex flex-row'>
  <span className="fa-stack fa-lg mt-6">
    <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
    <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
  </span> 
  <p className="text-gray-700 text-sm mt-6"> 
    <p className='text-sm text-black'> Color  </p>
     {/* {driverDetails.year} */} 
     <p className='text-xs font-bold text-black'>Red</p>
    </p>  
  </div> 

  <div className='flex flex-row'>
  <span className="fa-stack fa-lg mt-6">
    <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
    <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
  </span> 
  <p className="text-gray-700 text-sm mt-6"> 
    <p className='text-sm text-black'>License Plate</p>
     <p className='text-xs font-bold text-black'>KVF 666W</p>
    </p>  
  </div> 
  
      </div> 

  </div> 
</div> 

<div className="max-w-sm rounded-md ml-5 mt-2 overflow-hidden shadow-md bg-white w-full">
<div className=""> 
<div  className='font-semibold border-b border-gray-200 p-2 bg-[#FAFAFB] '>
<p className='font-semibold mt-2'>Additional Info</p> 
</div>
<div className='flex justify-between px-4'> 
<div className='flex flex-row'>
  <i className="fa fa-circle-o-notch" aria-hidden="true"></i>
  <p className="text-gray-700 text-sm mt-6"> 
  <p className='text-sm text-black'>Country</p>
  <p className='text-xs font-bold text-black'> {driverDetails.country} , {driverDetails.city}</p>
  </p>  
</div>
<div className='flex flex-row'>
<i className="fa fa-clock-o" aria-hidden="true"></i>
<p className="text-gray-700 ml-10 text-sm mt-6"> 
  <p className='text-sm text-black '>Registered</p>
 <p  className='text-xs font-bold text-black'>
  11/07/23	
  </p>    
  </p>

</div>
  </div>
  <div className='flex flex-row mt-6 px-4'>
  {/* <i className="fa fa-mars" aria-hidden="true"></i>  */}
  <div className='flex justify-between '> 
  <p className="text-gray-700 text-sm mt-6"> 
  <p className='text-sm text-black'> Gender  </p>
   <p className='text-xs font-bold text-black'>Male</p>
  </p>  
    </div>

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


