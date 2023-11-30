import Card from "@/components/Cards/Card";
import SiteLayout from "@/Layout/SiteLayout";
import {Cards} from "@/components/Cards/SmallCard";
import VehicleOverview from "@/pages/Dashboard/VehicleOverview";
import FuelCostOverView from "@/pages/Dashboard/FuelCostOverView";
import TripsPieGraph from "@/pages/Dashboard/TripsPieGraph";
import TripsOverView from "@/pages/Dashboard/TripsOverView";
import ClientsOverView from "@/pages/Dashboard/ClientsOverView";
import OnRoute from "@/pages/Dashboard/OnRoute";
import OutOfService from "@/pages/Dashboard/OutOfService";
import {Header} from "@/components/Headers";
import {Fragment, useState,useEffect} from "react";
import {ChevronDownIcon} from "@heroicons/react/24/solid";
import { fbDb } from "@/firebase/configs";
import { DocumentData, getDocs, collection } from "firebase/firestore";


export default function DashboardComponent() {
    const [fetchedTrips, setFetchedTrips] = useState<DocumentData[]>([]);
    const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);
    const [overallEarnings, setOverallEarnings] = useState<number>(0);
    const [earningsPerTruck, setEarningsPerTruck] = useState<number>(0);
    const [trucksAvailable, setTrucksAvailable] = useState<number>(0);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const tripsQuerySnapshot = await getDocs(collection(fbDb, 'trips'));
          const tripsData: DocumentData[] = [];
  
          tripsQuerySnapshot.forEach((doc) => {
            const trip = {
              id: doc.id,
              ...doc.data(),
            };
            tripsData.push(trip);
          });
  
          setFetchedTrips(tripsData);
  
          const vehiclesQuerySnapshot = await getDocs(collection(fbDb, 'vehicles'));
          const vehiclesData: DocumentData[] = [];
  
          vehiclesQuerySnapshot.forEach((doc) => {
            const vehicle = {
              id: doc.id,
              ...doc.data(),
            };
            vehiclesData.push(vehicle);
          });
  
          setFetchedVehicles(vehiclesData);
          const totalVehicles = vehiclesData.length;

          // Calculate overall earnings
          const totalDealValue = tripsData.reduce((acc, trip) => {
            const dealValue = parseFloat(trip.dealValue); // Convert to a floating-point number
            return !isNaN(dealValue) ? acc + dealValue : acc; // Add to the accumulator if it's a valid number
          }, 0);
          
          // Round down the totalDealValue to remove decimals
          const roundedTotalDealValue = Math.floor(totalDealValue);
          setOverallEarnings(roundedTotalDealValue);
                     // Calculate earnings per truck
          const earningsPerTruckValue = totalVehicles > 0 ? totalDealValue / totalVehicles : 0;
                   // Round down the earningsPerTruckValue to remove decimals
          const roundedEarningsPerTruck = Math.floor(earningsPerTruckValue);

          setEarningsPerTruck(isNaN(roundedEarningsPerTruck) ? 0 : roundedEarningsPerTruck);

          const vehiclesOnTrip = tripsData.map(trip => trip.vehicleId);
          const vehiclesOutOfService = vehiclesData.filter(vehicle => vehicle.outOfService).map(vehicle => vehicle.id);
    
          // Calculate available trucks
          const availableTrucks = totalVehicles - vehiclesOnTrip.length - vehiclesOutOfService.length;
          setTrucksAvailable(availableTrucks);

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, []);
  
    const cards = [
      { amount: overallEarnings.toString(), href: '#', icon: '/icons/cashIcon.png', name: 'Overall Earnings' },
      { amount: earningsPerTruck.toString(), href: '#', icon: '/icons/cashIcon.png', name: 'Earnings per truck' },
      { amount: trucksAvailable.toString(), href: '#', icon: '/icons/cashIcon.png', name: 'Trucks Available' },
    ];
    return (
        <SiteLayout>
            <div  className="max-h-full	 overflow-y-auto">
                <p className="text-lg font-nunito font-bold mt-2 ml-5">Dashboard</p>

                <div className='mt-8 flex justify-between '> 
                    {cards.map((card, index) => {
                        return (
                            <Fragment key={index}>
                                <Cards name={card.name} icon={card.icon} amount={card.amount}/> 
                          
                            </Fragment>
                        )
                    })}
                </div>
                <div className='w-full flex justify-between'>
                    <VehicleOverview/> 
                    <OutOfService/>
 
                     {/* <TripsOverView/>  */}
 
                    {/* <FuelCostOverView/>   */}
                </div>
                <div className='flex w-full justify-between mt-8 '>
                    <TripsPieGraph/> 
                    <OnRoute/>

                    {/* <TripsOverView/> */}
                    {/* <ClientsOverView/> */}
                </div>
                <div className='flex w-full mt-8'>
                    {/* <OnRoute/> */}
                    {/* <OutOfService/> */}
                </div>

            </div>
            </SiteLayout>
    )
}

export function ThisWeek() {
    return (
        <>
            <div className='text-sm flex items-center'>
                This Week
                <ChevronDownIcon className='ml-2 h-4 w-4'/>
            </div>
        </>
    )
}
