import {CardIcon} from "@/components/images"; 
import { DocumentData, collection, getDocs, query, where } from "firebase/firestore";
import { fbDb } from "@/firebase/configs"; 
import { useState ,useEffect} from "react"; 
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";



export default function OnRoute(){ 
    const [fetchedTrips, setFetchedTrips]=useState<DocumentData[]>([]);   
    const {organisationId}=useAuthContext() 
    
    // @ts-ignore 
    useEffect(() => {
        const fetchTrips = async () => { 
            if (organisationId){ 
               const q = query(collection(fbDb, 'trips'), where('organisationId', '==', organisationId)); 
                const querySnapshot = await getDocs(q); 
                const tripsData: DocumentData[] = [];

                const currentDate = new Date(); // Get the current date and time

                querySnapshot.forEach((doc) => {
                    const trip = doc.data();

                    // Parse the start_time and end_time from the trip data
                    const startTime = new Date(trip.start_time.toDate());
                    // const endTime = new Date(trip.end_time.toDate());

                    // Check if the current date is between start_time and end_time
                    if (currentDate >= startTime  ) {
                        tripsData.push({
                            id: doc.id,
                            ...trip,
                        });
                    }
                });

                setFetchedTrips(tripsData);



            } else{ 
                console.log("Organisation ID is not available for fetching Trips .");
                
            }
            try {

            } catch (error) {
                console.error('Error fetching Trips:', error);
            }
        };

        fetchTrips();
    }, [organisationId]);

 
    
    return(
        <> 
        <div className='bg-white shadow rounded-lg w-1/2'>
            <div className="sm:px-10 lg:px-12 pt-8">
                <h2 id="applicant-information-title" className="text-lg font-bold leading-6">
                    On Route
                </h2>
            </div>
            <div className=" px-4 py-5 sm:px-6 ">
                <div className="mt ">
                    <div className=" overflow-x-auto w-full">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-bold  sm:pl-0">
                                        Starting Route
                                    </th>
                                    {/* <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold ">
                                        Ending Route
                                    </th> */}
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold ">
                                        Truck NO
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold ">
                                        Status
                                    </th>

                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                {fetchedTrips.map((trips,index) => (
                                    <tr key={index} className='font-bold'>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3  sm:pl-0">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                <span className="fa-stack fa-lg">
                                                 <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
                                                <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
                                                </span>                                                 
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-bold ">{trips.pick_up_location}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4  ">
                                            <div className="">{trips.drop_off_location}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">{trips.vehicle}</td>

                                        <td className="whitespace-nowrap px-3 py-4  ">
                                              <span className="inline-flex rounded-full bg-pill-green
                                              text-xs font-bold leading-5 w-[92px] h-[32px] justify-center items-center">
                                                On Route
                                              </span>
                                        </td>

                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div> 
        </>
    )
}
