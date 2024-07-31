import React, { Fragment, useState, useEffect } from "react";
import { fbDb } from "@/firebase/configs";
import {
  DocumentData,
  getDocs,
  collection,
  query,
  where,
  getFirestore,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import SiteNav from "@/components/Headers/SiteNav";
import MetricCard from "./metrics";
import OutOfServiceVehicles from "./OutOfService";
import VehicleOverview from "@/pages/Dashboard/VehicleOverview";
import TripsPieGraph from "@/pages/Dashboard/TripsPieGraph";
import OnRoute from "@/pages/Dashboard/OnRoute";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function DashboardComponent() {
  const [fetchedTrips, setFetchedTrips] = useState<DocumentData[]>([]);
  const [fetchedMaintenance, setFetchedMaintenance] = useState<DocumentData[]>(
    []
  );
  const [companyCost, setCompanyCost] = useState<number>(0);
  const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);
  const [overallEarnings, setOverallEarnings] = useState<number>(0);
  const [earningsPerTruck, setEarningsPerTruck] = useState<number>(0);
  const [avgTruckExpense, setAvgTruckExpense] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [totalFuel, setTotalFuel] = useState(0);
  const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);
  const [mileageFee, setMileageFee] = useState(0);
  const [totalMaintenanceCost, setTotalMaintenanceCost] = useState(0);
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
    departmentData,
  } = useAuthContext();
  const [isTripsFetched, setIsTripsFetched] = useState(false);
  const [isMaintenanceFetched, setIsMaintenanceFetched] = useState(false);
  const [isVehiclesFetched, setIsVehiclesFetched] = useState(false);

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(i);
    }
    return years;
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const startOfMonth = selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(selectedYear, new Date().getMonth(), 1);

    const endOfMonth = selectedDate
      ? new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0,
          23,
          59,
          59
        )
      : new Date(selectedYear, new Date().getMonth() + 1, 0, 23, 59, 59);

    const startOfYear = new Date(
      selectedDate ? selectedDate.getFullYear() : selectedYear,
      0,
      1
    );
    const endOfYear = new Date(
      selectedDate ? selectedDate.getFullYear() : selectedYear,
      11,
      31,
      23,
      59,
      59
    );

    const startDate = selectedDate ? startOfMonth : startOfYear;
    const endDate = selectedDate ? endOfMonth : endOfYear;

    const fetchedTrips = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "trips"),
            where("organisationId", "==", organisationId),
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            where("timestamp", "<=", Timestamp.fromDate(endDate))
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tripsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              fuel: doc.data().fuel,
              mileage_fee: doc.data().mileage_fee,
              dealValue: doc.data().dealValue,
              ...doc.data(),
            }));
            setFetchedTrips(tripsData);
            const fuelSum = tripsData.reduce(
              (sum, trip) => sum + (trip.fuel || 0),
              0
            );
            setTotalFuel(fuelSum);

            const dealValueSum = tripsData.reduce(
              (sum, trip) => sum + (trip.dealValue || 0),
              0
            );
            setOverallEarnings(dealValueSum);

            const mileageSum = tripsData.reduce(
              (sum, trip) => sum + (trip.mileage_fee || 0),
              0
            );
            setMileageFee(mileageSum);

            setIsTripsFetched(true);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Trips:", error);
      }
    };

    const fetchedMaintenance = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(db, "maintenance"),
            where("organisationId", "==", organisationId),
            where("status", "==", "Approved"),
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            where("timestamp", "<=", Timestamp.fromDate(endDate))
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const maintenanceData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              cost: doc.data().cost,
              ...doc.data(),
            }));
            setFetchedMaintenance(maintenanceData);
            const costSum = maintenanceData.reduce(
              (sum, vehicle) => sum + (vehicle.cost || 0),
              0
            );
            setTotalMaintenanceCost(costSum);
            setIsMaintenanceFetched(true);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Maintenance:", error);
      }
    };

    const fetchVehicles = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "vehicles"),
            where("organisationId", "==", organisationId),
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            where("timestamp", "<=", Timestamp.fromDate(endDate))
          );
          const querySnapshot = await getDocs(q);

          const vehiclesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            lease_amount: doc.data().lease_amount,
            ...doc.data(),
          }));
          setFetchedVehicles(vehiclesData);
          const leaseSum = vehiclesData.reduce(
            (sum, vehicle) => sum + (vehicle.lease_amount || 0),
            0
          );
          setMileageFee(leaseSum);
          setIsVehiclesFetched(true);
        }
      } catch (error) {
        console.error("Error fetching Vehicles:", error);
      }
    };

    fetchedTrips();
    fetchedMaintenance();
    fetchVehicles();
  }, [organisationId, selectedDate, selectedYear]);

  useEffect(() => {
    if (isTripsFetched && isMaintenanceFetched && isVehiclesFetched) {
      const totalCost = Math.floor(
        (totalFuel || 0) + (mileageFee || 0) + (totalMaintenanceCost || 0)
      );
      setCompanyCost(totalCost);
      console.log("CompanyCost", totalCost);

      const numberOfTrucks = fetchedVehicles.length || 1;

      // Average Profit per Truck = (Total Income - Total Expenses) / number of Trucks
      const avgTruckProfit = Math.floor(
        (overallEarnings - totalCost) / numberOfTrucks
      );
      setEarningsPerTruck(avgTruckProfit);
      console.log("EarningsPerTruck", avgTruckProfit);

      // Average Expense per Truck = Total Expense / number of Trucks
      const averageTruckExpense = Math.floor(totalCost / numberOfTrucks);
      setAvgTruckExpense(averageTruckExpense);
      console.log("AverageTruckExpense", averageTruckExpense);
    }
  }, [
    isTripsFetched,
    isMaintenanceFetched,
    isVehiclesFetched,
    totalFuel,
    mileageFee,
    totalMaintenanceCost,
    overallEarnings,
    fetchedVehicles,
  ]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    setSelectedDate(null); // Clear selected date when changing the year
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    setSelectedDate(date);
    setSelectedYear(date.getFullYear()); // Update selected year to match the selected date
  };
  const hasViewTotalIncomePermission =
    userClaims?.additionalPermissions?.includes("View Total Income") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("View Total Income");
  const hasViewTotalExpensesPermission =
    userClaims?.additionalPermissions?.includes("View Total Expenses") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("View Total Expenses");
  const hasViewTotalVehicleOverviewPermission =
    userClaims?.additionalPermissions?.includes(
      "View Total Vehicle Overview"
    ) ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("View Total Vehicle Overview");
  const hasTripsCompetedPermission =
    userClaims?.additionalPermissions?.includes("Trips Completed") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Trips Completed");
  const hasViewOutOfServiceVehiclePermission =
    userClaims?.additionalPermissions?.includes(
      "View Out of Service Vehicle"
    ) ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("View Out of Service Vehicle");

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "Ksh",
      minimumFractionDigits: 0,
    }).format(value);
  };
  const overallEarningsCurrency = formatCurrency(overallEarnings);
  const companyCostCurrency = formatCurrency(companyCost);
  const earningsPerTruckCurrency = formatCurrency(earningsPerTruck);
  const avgTruckExpenseCurrency = formatCurrency(avgTruckExpense);
  const cards = [
    {
      amount: overallEarningsCurrency.toString(),
      href: "#",
      icon: "/icons/cashIcon.png",
      name: "Total Income",
      border: "#065AD8",
      visible: hasViewTotalIncomePermission,
    },
    // Total Expenses =  Fuel + Mileage + Maintenance Costs
    {
      amount: companyCostCurrency.toString(),
      href: "#",
      icon: "/icons/cashIcon.png",
      name: "Total Expense",
      border: "#ffd648",
      visible: hasViewTotalExpensesPermission,
    },
    // Total Profit Per Truck = (Total Income - Total Expenses) / number of Trucks
    {
      amount: earningsPerTruckCurrency.toString(),
      href: "#",
      icon: "/icons/cashIcon.png",
      name: "Average Profit per Truck",
      border: "#14e9e2",
      visible: true,
    },
    // Total Expenses Per Truck = Total Expense / number of Trucks
    {
      amount: avgTruckExpenseCurrency.toString(),
      href: "#",
      icon: "/icons/cashIcon.png",
      name: "Average Expenses per Truck",
      border: "##36c76c",
      visible: true,
    },
  ];

  return (
    <SiteNav>
      <div className=" bg-[#f7f8fa]">
        <div className="py-[10px] flex items-center justify-center bg-white flex justify-between w-full">
          <div className="">
            <h1 className="text-base font-semibold text-gray-800 mr-4 ml-[35px]">
              Analytics
            </h1>
          </div>
          {/* <div className=" mr-[35px]">
            <select
              className="border border-[#065AD8] bg-[#fff] text-gray-700 px-3 mr-[10px]  rounded-md"
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
              className="border border-[#065AD8] bg-[#fff] text-gray-700 px-3 rounded-md mr-2"
            />
          </div> */}
        </div>
        <div className=" mr-[12px]">
          <div className="mt-4 ml-4 flex flex-row space-x-[27px]">
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
          <div className="ml-4 flex flex-row space-x-[20px] mt-[25px]">
            {hasViewOutOfServiceVehiclePermission && (
              <OutOfServiceVehicles
                selectedDate={selectedDate}
                selectedYear={selectedYear}
              />
            )}
            {hasTripsCompetedPermission && (
              <TripsPieGraph
                selectedDate={selectedDate}
                selectedYear={selectedYear}
              />
            )}
          </div>
          <div className="flex justify-between mt-8">
            <OnRoute selectedDate={selectedDate} selectedYear={selectedYear} />
          </div>
        </div>
      </div>
    </SiteNav>
  );
}
