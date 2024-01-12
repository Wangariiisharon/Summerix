import {Doughnut} from "react-chartjs-2";
import {ThisWeek} from "@/pages/Dashboard/index";
import {Chart as ChartJS, ArcElement, Tooltip, ScriptableContext} from 'chart.js';
import {AnyObject} from "chart.js/dist/types/basic";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { DocumentData, collection, getDocs, query, where } from "firebase/firestore";
import { fbDb } from "@/firebase/configs"; 
import {Fragment, SetStateAction, useEffect, useState} from "react"; 
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";



ChartJS.register(ArcElement, Tooltip);


export default function TripsPieGraph() {
    const [fetchedTrips, setfetchedTrips]=useState<DocumentData[]>([]);    
    const {organisationId}=useAuthContext()

    // @ts-ignore 
    useEffect(() => { 
        const fetchedTrips = async () => {
            try {
              // Ensure organisationId is available before making the query
              if (organisationId) {
                const q = query(collection(fbDb, 'trips'), where('organisationId', '==', organisationId));
                const querySnapshot = await getDocs(q);
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
      
              } else {
                // Handle the case when organisationId is not available
                console.error('Organisation ID is not available for fetching Trips .');
              }
            } catch (error) {
              console.error('Error fetching Trips:', error);
            }
          };
      
        fetchedTrips();
    }, [organisationId]); 
 
    const currentDate = Date.now();
    const completedTripsCount = fetchedTrips.filter(
      (trip) => trip.start_time < currentDate && trip.end_time < currentDate
    ).length;
  
    const allTrips = completedTripsCount;
    const completedPercentage = allTrips > 0 ? (completedTripsCount / allTrips) : 0;
    const percentage = completedPercentage * 100;
     const passedTripsCount = fetchedTrips.filter((trip) => trip.start_time < currentDate || trip.end_time < currentDate).length;
     console.log("Passed trips count", passedTripsCount);
    interface dataset {
        datasets: {
            backgroundColor: string[];
            data: number[];
            borderJoinStyle:  "round" | "bevel" | "miter" | ((ctx: ScriptableContext<"doughnut">, options: AnyObject) => CanvasLineJoin | undefined),
            borderWidth: number;
            borderRadius: number;
            borderAlign: "inner" | "center" | ((ctx: ScriptableContext<"doughnut">, options: AnyObject) => "inner" | "center" | undefined) | readonly ("inner" | "center" | undefined)[] | undefined
            spacing: number;
            radius: number;
        }[];
    }

    const data: dataset = {
        // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
                backgroundColor: ['#20C997', '#F7F8FA'],
                data: [passedTripsCount, allTrips],
                borderJoinStyle: 'round',
                borderWidth: 20,
                borderRadius: 100,
                borderAlign: "inner",
                spacing: 15,
                radius: 50,
            },
    
        ],
    };
    const options = {
        cutout: 130,
    
    }
    return (
        <>
            <div className='rounded-lg bg-white shadow lg:min-w-[20] h-full max-h-[24]'>
            <div className="sm:px-6 flex w-full items-center justify-between">
                    <h2 id="applicant-information-title" className="text-xl font-bold leading-6">
                        Trips Completed
                    </h2> 
                    <div className='text-sm flex items-center'>
                                    This Week
                                    <ChevronDownIcon className='ml-2 h-4 w-4'/>
                                </div>
                </div>
                <div className="flex flex-col items-center justify-center relative">
                    <div className='font-extrabold text-3xl absolute pl-4'>
                    {allTrips > 0 ? `${percentage}%` : 'N/A'}
                    </div>
                    <Doughnut id='pp' data={data} options={options}  className='!bg-white '/>
                    <div className='w-56 text-center text-lg absolute bottom-2'>
                        Number of trips Completed this Month
                    </div>
                </div>
            </div>
        </>
    )
}
