import Card from "@/components/Cards/Card";
import SiteLayout from "@/Layout/SiteLayout";
import { Cards } from "@/components/Cards/SmallCard";
import VehicleOverview from "@/pages/Dashboard/VehicleOverview";
import FuelCostOverView from "@/pages/Dashboard/FuelCostOverView";
import TripsPieGraph from "@/pages/Dashboard/TripsPieGraph";
import TripsOverView from "@/pages/Dashboard/TripsOverView";
import ClientsOverView from "@/pages/Dashboard/ClientsOverView";
import OnRoute from "@/pages/Dashboard/OnRoute";
import OutOfService from "@/pages/Dashboard/OutOfService";
import { Header } from "@/components/Headers";
import { Fragment, useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { fbDb } from "@/firebase/configs";
import {
  DocumentData,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import SiteNav from "@/Blocks/SiteNav";
import MetricCard from "./metrics";
import SearchIcon from "@heroicons/react/24/outline";
import OutOfServiceVehicles from "./OutOfService";

export default function DashboardComponent() {
  const [fetchedTrips, setFetchedTrips] = useState<DocumentData[]>([]);
  const [fetchedMaintenace, setFetchedMaintenace] = useState<DocumentData[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [companyCost, setCompanyCost] = useState<number>(0);
  const [mileageFee, setMileageFee] = useState<number>(0);

  const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);
  const [overallEarnings, setOverallEarnings] = useState<number>(0);
  const [earningsPerTruck, setEarningsPerTruck] = useState<number>(0);
  const [trucksAvailable, setTrucksAvailable] = useState<number>(0);
  const [avgTruckExpense, setAvgTruckExpense] = useState<number>(0);

  const { organisationId } = useAuthContext();
  console.log("Dashboard organisationId:", organisationId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (organisationId) {
          // Fetch trips data
          const tripsQuerySnapshot = await getDocs(
            query(
              collection(fbDb, "trips"),
              where("organisationId", "==", organisationId)
            )
          );
          const tripsData: DocumentData[] = tripsQuerySnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );
          setFetchedTrips(tripsData);

          // Fetch maintenance data
          const maintenanceQuerySnapshot = await getDocs(
            query(
              collection(fbDb, "maintenance"),
              where("organisationId", "==", organisationId)
            )
          );
          const maintenanceData: DocumentData[] =
            maintenanceQuerySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          setFetchedMaintenace(maintenanceData);

          // Fetch vehicles data
          const vehiclesQuerySnapshot = await getDocs(
            query(
              collection(fbDb, "vehicles"),
              where("organisationId", "==", organisationId)
            )
          );
          const vehiclesData: DocumentData[] = vehiclesQuerySnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );
          setFetchedVehicles(vehiclesData);

          // Calculate company costs
          const totalFuelCost = tripsData.reduce(
            (acc, trip) => acc + trip.fuel,
            0
          );
          const totalMileageFee = tripsData.reduce(
            (acc, trip) => acc + trip.mileage_fee,
            0
          );
          const totalPurchasePrice = vehiclesData.reduce(
            (acc, vehicle) => acc + vehicle.lease_amount,
            0
          );
          const totalMaintenanceCost = maintenanceData.reduce(
            (acc, maintenance) => acc + maintenance.cost,
            0
          );

          const totalCompanyCost =
            totalFuelCost +
            totalMileageFee +
            totalPurchasePrice +
            totalMaintenanceCost;
          const roundedCompanyCost = Math.floor(totalCompanyCost);
          setCompanyCost(roundedCompanyCost);
          const totalVehicles = vehiclesData.length;
          setTrucksAvailable(totalVehicles);
          // Calculate overall earnings and other metrics... //
          // Calculate overall earnings
          const totalDealValue = tripsData.reduce((acc, trip) => {
            const dealValue = parseFloat(trip.dealValue); // Convert to a floating-point number
            return !isNaN(dealValue) ? acc + dealValue : acc; // Add to the accumulator if it's a valid number
          }, 0);

          // Round down the totalDealValue to remove decimals
          const roundedTotalDealValue = Math.floor(totalDealValue);
          setOverallEarnings(roundedTotalDealValue);
          // Calculate earnings per truck
          const earningsPerTruckValue =
            totalVehicles > 0 ? totalDealValue / totalVehicles : 0;
          // Round down the earningsPerTruckValue to remove decimals
          const roundedEarningsPerTruck = Math.floor(earningsPerTruckValue);

          setEarningsPerTruck(
            isNaN(roundedEarningsPerTruck) ? 0 : roundedEarningsPerTruck
          );

          const vehiclesOnTrip = tripsData.map((trip) => trip.vehicleId);
          const vehiclesOutOfService = vehiclesData
            .filter((vehicle) => vehicle.outOfService)
            .map((vehicle) => vehicle.id);

          // Calculate available trucks
          const availableTrucks =
            totalVehicles - vehiclesOnTrip.length - vehiclesOutOfService.length;
          // setTrucksAvailable(availableTrucks);
          // setTrucksAvailable(isNaN(availableTrucks) ? 0 : availableTrucks);

          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [organisationId]);

  // Rest of your code...
  const cards = [
    {
      amount: overallEarnings.toString(),
      href: "#",
      icon: "/icons/cashIcon.png",
      name: "Total Income",
      border: "#065AD8",
    },
    {
      amount: companyCost.toString(),
      href: "#",
      icon: "/icons/cashIcon.png",
      name: "Total Expenses",
      border: "#FFD648",
    },
    {
      amount: earningsPerTruck.toString(),
      href: "#",
      icon: "/icons/cashIcon.png",
      name: "Average Profit per Truck",
      border: "#14E9E2",
    },

    {
      amount: companyCost.toString(),
      href: "#",
      icon: "/icons/cashIcon.png",
      name: "Average Expenses per Truck",
      border: "#36C76C",
    },
  ];

  return (
    <SiteNav>
      <div className=" w-full h-[1595px] bg-[#f7f8fa]">
        <div className="h-[70px] pl-[35px] bg-white flex justify-between w-full">
          <div className=" flex items-center py-2">
            <h1 className="text-base font-semibold text-gray-800 mr-4 ml-4 ">
              Analytics
            </h1>
          </div>
          <div className="flex items-center">
            <button className="border border-[#065AD8] bg-[#fff] text-gray-700 px-3 py-1 rounded-md mr-2 text-[#065AD8]">
              <i
                className="fa fa-calendar text-[#065AD8] text-base mr-2"
                aria-hidden="true"
              ></i>
              Select Year
            </button>
            <button className="border border-[#065AD8] bg-[#fff] text-gray-700 px-3 py-1 rounded-md mr-2 text-[#065AD8]">
              <i
                className="fa fa-calendar text-[#065AD8] text-base mr-2"
                aria-hidden="true"
              ></i>
              Select Date
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-between py-4 px-4 ">
          {cards.map((card, index) => {
            return (
              <Fragment key={index}>
                <MetricCard
                  value={card.amount}
                  label={card.name}
                  icon={card.icon}
                  lineColor={card.border}
                />
              </Fragment>
            );
          })}
        </div>
        <div className=" flex justify-between">
          <VehicleOverview />
          <OutOfServiceVehicles />
          <TripsPieGraph />
        </div>
        <div className=" flex justify-between mt-8">
          <OnRoute />
        </div>
      </div>
    </SiteNav>
  );
}
