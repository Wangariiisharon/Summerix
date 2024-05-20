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

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { organisationId } = useAuthContext();
  console.log("Dashboard organisationId:", organisationId);

  // Generate a list of years for the dropdown
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(i);
    }
    return years;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (organisationId) {
          let startOfMonth, endOfMonth;

          if (selectedDate) {
            const selectedYear = selectedDate.getFullYear();
            const selectedMonth = selectedDate.getMonth();
            startOfMonth = new Date(selectedYear, selectedMonth, 1);
            endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
          } else {
            startOfMonth = new Date(selectedYear, 0, 1); // January 1st of the selected year
            endOfMonth = new Date(selectedYear, 11, 31); // December 31st of the selected year
          }

          // Fetch trips data
          const tripsQuerySnapshot = await getDocs(
            query(
              collection(fbDb, "trips"),
              where("organisationId", "==", organisationId),
              where("start_time", ">=", startOfMonth),
              where("start_time", "<=", endOfMonth)
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
              where("organisationId", "==", organisationId),
              where("date", ">=", startOfMonth),
              where("date", "<=", endOfMonth)
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
              where("organisationId", "==", organisationId),
              where("registration_date", ">=", startOfMonth),
              where("registration_date", "<=", endOfMonth)
            )
          );
          const vehiclesData: DocumentData[] = vehiclesQuerySnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );
          setFetchedVehicles(vehiclesData);
          console.log("vehiclesData", vehiclesData);

          const totalFuelCost = tripsData.reduce((acc, trip) => {
            const fuelCost = parseFloat(trip.fuel);
            return acc + (isNaN(fuelCost) ? 0 : fuelCost);
          }, 0);
          console.log("totalFuelCost", totalFuelCost);

          const totalMileageFee = tripsData.reduce((acc, trip) => {
            const mileageFee = parseFloat(trip.mileage_fee);
            return acc + (isNaN(mileageFee) ? 0 : mileageFee);
          }, 0);
          console.log("totalMileageFee", totalMileageFee);

          const totalPurchasePrice = vehiclesData.reduce((acc, vehicle) => {
            const leaseAmount = parseFloat(vehicle.lease_amount);
            return acc + (isNaN(leaseAmount) ? 0 : leaseAmount);
          }, 0);
          console.log("totalPurchasePrice", totalPurchasePrice);

          const totalMaintenanceCost = maintenanceData.reduce(
            (acc, maintenance) => {
              const cost = parseFloat(maintenance.cost);
              return acc + (isNaN(cost) ? 0 : cost);
            },
            0
          );
          console.log("totalMaintenanceCost", totalMaintenanceCost);

          const totalCost =
            totalFuelCost +
            totalMileageFee +
            totalPurchasePrice +
            totalMaintenanceCost;
          setCompanyCost(totalCost);

          const totalEarnings = tripsData.reduce((acc, trip) => {
            const earnings = parseFloat(trip.dealValue);
            return acc + (isNaN(earnings) ? 0 : earnings);
          }, 0);
          console.log("totalEarnings", totalEarnings);
          setOverallEarnings(totalEarnings);

          const validTotalCost = isNaN(totalEarnings) ? 0 : totalEarnings;
          const validTotalEarnings = isNaN(totalCost) ? 0 : totalCost;

          // Average Profit per Truck = (Total Income - Total Expenses) /number of Trucks
          const expensesPerTruck =
            (validTotalEarnings - validTotalCost) / vehiclesData.length;
          setEarningsPerTruck(expensesPerTruck);

          // Average Expense per Truck = Total Expense/number of Trucks
          const avg = validTotalCost / vehiclesData.length;
          setAvgTruckExpense(avg);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [organisationId, selectedYear, selectedDate]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    setSelectedDate(null); // Reset the date when the year changes
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    setSelectedDate(date);
  };

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
      amount: avgTruckExpense.toString(),
      href: "#",
      icon: "/icons/cashIcon.png",
      name: "Average Expenses per Truck",
      border: "#36C76C",
    },
  ];

  return (
    <SiteNav>
      <div className="w-full h-[1595px] bg-[#f7f8fa]">
        <div className="h-[70px] pl-[35px] bg-white flex justify-between w-full">
          <div className="flex items-center py-2">
            <h1 className="text-base font-semibold text-gray-800 mr-4 ml-4">
              Analytics
            </h1>
          </div>
          <div className="flex items-center">
            <select
              className="border border-[#065AD8] bg-[#fff] text-gray-700 px-3 py-1 rounded-md mr-2 text-[#065AD8]"
              onChange={handleYearChange}
              value={selectedYear}
            >
              {getYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <input
              type="date"
              onChange={handleDateChange}
              className="border border-[#065AD8] bg-[#fff] text-gray-700 px-3 py-1 rounded-md mr-2 text-[#065AD8]"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between py-4 px-4">
          {cards.map((card, index) => (
            <Fragment key={index}>
              <MetricCard
                value={card.amount}
                label={card.name}
                icon={card.icon}
                lineColor={card.border}
              />
            </Fragment>
          ))}
        </div>
        <div className="flex justify-between">
          <VehicleOverview />
          <OutOfServiceVehicles />
          <TripsPieGraph />
        </div>
        <div className="flex justify-between mt-8">
          <OnRoute />
        </div>
      </div>
    </SiteNav>
  );
}
