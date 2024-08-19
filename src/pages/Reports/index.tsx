import {
  query,
  collection,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, fbDb } from "@/firebase/configs";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import SiteLayout from "@/Layout/SiteLayout";
import SearchBar from "@/components/Forms/input";
import Image from "next/image";
import { saveAs } from "file-saver";

interface TripData {
  id: string;
  mileage_fee: number;
  fuel: number;
}

interface MaintenanceData {
  id: string;
  cost: number;
}

export default function Reports() {
  const [tripsData, setTripsData] = useState<TripData[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData[]>([]);
  const [totalMileageFee, setTotalMileageFee] = useState(0);
  const [totalFuel, setTotalFuel] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
    departmentData,
  } = useAuthContext();
  const [vehiclePaidAmounts, setVehiclePaidAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);
  const [expensesAmount, setExpensesAmount] = useState<number>(0);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showProfitLoss, setShowProfitLoss] = useState(false);

  const handleProfitLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowProfitLoss(e.target.checked);
  };
  const handleProfitLossCancel = () => {
    setShowProfitLoss(false);
  };

  useEffect(() => {
    if (!organisationId) {
      return;
    }
    const fetchTripsAndMaintenance = async () => {
      setLoading(true);
      setError(null);
      try {
        // Define queries
        const tripsQuery = query(
          collection(fbDb, "trips"),
          where("organisationId", "==", organisationId)
        );
        const maintenanceQuery = query(
          collection(fbDb, "maintenance"),
          where("organisationId", "==", organisationId)
        );
        // Fetch trips data
        const tripsSnapshot = await getDocs(tripsQuery);
        const trips = tripsSnapshot.docs.map((doc) => ({
          id: doc.id,
          mileage_fee: doc.data().mileage_fee,
          fuel: doc.data().fuel,
          ...doc.data(),
        }));
        // Calculate total mileage fee and fuel from trips
        let mileageFeeSum = 0;
        let fuelSum = 0;
        trips.forEach((trip) => {
          mileageFeeSum += trip.mileage_fee || 0;
          fuelSum += trip.fuel || 0;
        });
        // Fetch maintenance data
        const maintenanceSnapshot = await getDocs(maintenanceQuery);
        const maintenance = maintenanceSnapshot.docs.map((doc) => ({
          id: doc.id,
          cost: doc.data().cost,
          ...doc.data(),
        }));
        // Calculate total cost from maintenance
        let costSum = 0;
        maintenance.forEach((maintenanceEntry) => {
          costSum += maintenanceEntry.cost || 0;
        });
        // Update state
        setTripsData(trips);
        setMaintenanceData(maintenance);
        setTotalMileageFee(mileageFeeSum);
        setTotalFuel(fuelSum);
        setTotalCost(costSum);
        const allExpenses = mileageFeeSum + fuelSum + costSum;
        setExpensesAmount(allExpenses);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchTotalPaidAmountByVehicle = async () => {
      try {
        const tripsQuery = query(
          collection(fbDb, "trips"),
          where("organisationId", "==", organisationId)
        );
        const tripsSnapshot = await getDocs(tripsQuery);
        const vehiclePaidAmountMap: { [key: string]: number } = {};
        tripsSnapshot.forEach((doc) => {
          const data = doc.data();
          const vehicle = data.vehicle;
          const paidAmount = data.dealValue || 0;
          if (vehicle in vehiclePaidAmountMap) {
            vehiclePaidAmountMap[vehicle] += paidAmount;
          } else {
            vehiclePaidAmountMap[vehicle] = paidAmount;
          }
        });
        console.log("Total Paid Amount by Vehicle:", vehiclePaidAmountMap);
        setVehiclePaidAmounts(vehiclePaidAmountMap);
        const total = Object.values(vehiclePaidAmountMap).reduce(
          (acc, curr) => acc + curr,
          0
        );
        setTotalPaidAmount(total);
        return vehiclePaidAmountMap;
      } catch (error) {
        console.error("Error fetching total paid amount by vehicle:", error);
      }
    };
    fetchTotalPaidAmountByVehicle();
    fetchTripsAndMaintenance();
  }, [organisationId]);

  const exportToCSV = () => {
    const headers = [
      "Vehicle ID",
      "Revenue",
      "Total Fuel",
      "Total Maintenance",
      "Total Mileage Fee",
    ];
    const rows = Object.entries(vehiclePaidAmounts).map(
      ([vehicleId, totalPaidAmount]) => {
        return [
          vehicleId,
          totalPaidAmount,
          totalFuel,
          totalCost,
          totalMileageFee,
        ].join(",");
      }
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "profit_and_loss_report.csv");
  };
  // const handleDateChange = (date: Date | null) => {
  //   if (date) {
  //     const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  //     setStartDate(firstDayOfMonth);
  //     setEndDate(date);
  //   } else {
  //     // Set default date range to current month
  //     const currentDate = new Date();
  //     const firstDayOfCurrentMonth = new Date(
  //       currentDate.getFullYear(),
  //       currentDate.getMonth(),
  //       1
  //     );
  //     const lastDayOfCurrentMonth = new Date(
  //       currentDate.getFullYear(),
  //       currentDate.getMonth() + 1,
  //       0
  //     );
  //     setStartDate(firstDayOfCurrentMonth);
  //     setEndDate(lastDayOfCurrentMonth);
  //   }
  // };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
  return (
    <SiteLayout>
      <div className="flex flex-col bg-[#F7F8FA]">
        <div className="flex flex-row bg-white ">
          <div className="flex-grow-0 flex justify-center items-center gap-2.5 py-2.5 px-4">
            <div className="flex-grow-0 font-custom text-custom-size flex justify-center font-semibold text-left text-custom-color">
              Reports
            </div>
          </div>

          <div className="py-3 px-6">
            <SearchBar
              placeholder="Search User"
              onChange={handleSearchChange}
              className="h-6"
            />
          </div>
          <div className="flex space-x-2 ml-[300px]">
            <button
              className="flex items-center px-4 border border-blue-500 text-blue-500 rounded-lg"
              onClick={() =>
                setStartDate(new Date(new Date().getFullYear(), 0, 1))
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 4h10M4 11h16M4 15h16m-7 4h3m-10 0h3m2-4h4m-8 0h4"
                />
              </svg>
              Select Year
            </button>
            <button
              className="flex items-center px-4 border border-blue-500 text-blue-500 rounded-lg"
              // onChange={(e) => handleDateChange(new Date(e.target.value))}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 4h10M4 11h16M4 15h16m-7 4h3m-10 0h3m2-4h4m-8 0h4"
                />
              </svg>
              Select Date
            </button>
          </div>
        </div>
        <div className="ml-6 mr-24 mt-6 bg-white rounded-lg shadow-md">
          <p className="mt-2 mb-2 ml-4">Reports</p>
          <div className="border-b border-gray-200 mt-2 mb-2"></div>
          <div className="flex flex-row space-x-6 mt-2">
            <div className="flex flex-col mt-2">
              <div className="flex flex-row mb-2 ml-4">
                <input
                  type="checkbox"
                  className="form-checkbox text-sm h-5 w-5 rounded-md"
                />
                <p className="text-sm ml-2 font-semibold">
                  Show all parts of the report
                </p>
              </div>
              <p className="text-sm ml-4 text-[#A3A3A3]">
                Show the following only
              </p>
              <div className="flex flex-row mb-2 mt-2">
                <input
                  type="checkbox"
                  className="form-checkbox text-sm h-5 w-5 ml-4  rounded-md"
                  checked={showProfitLoss}
                  onChange={handleProfitLossChange}
                />
                <p className="text-sm ml-2 font-semibold">
                  Profit and Loss (P&L)
                </p>
              </div>
              <div className="flex flex-row mb-2 ml-8">
                <input
                  type="checkbox"
                  className="form-checkbox text-sm h-5 w-5 rounded-md"
                  checked={showProfitLoss}
                />
                <p className="text-sm ml-2 font-semibold">Revenue</p>
              </div>
              <div className="flex flex-row mb-2 ml-8">
                <input
                  type="checkbox"
                  className="form-checkbox text-sm h-5 w-5 rounded-md"
                  checked={showProfitLoss}
                />
                <p className="text-sm ml-2 font-semibold">Expenses</p>
              </div>
              <div className="flex flex-row mb-2 ml-8">
                <input
                  type="checkbox"
                  className="form-checkbox text-sm h-5 w-5  rounded-md"
                />
                <p className="text-sm ml-2 font-semibold">Deal Values</p>
              </div>
              <div className="flex flex-row mb-2 ml-8">
                <input
                  type="checkbox"
                  className="form-checkbox text-sm h-5 w-5 rounded-md"
                />
                <p className="text-sm ml-2 font-semibold">
                  Maintenance Reports
                </p>
              </div>
            </div>

            <div className="bg-[#F7F8FA] w-full">
              <div className="bg-white mt-4 ml-4 mr-4">
                <div className="ml-6 py-4">
                  <Image
                    src="/logo-black.png"
                    alt="Truck Mate logo"
                    className="h-auto w-auto"
                    width={150}
                    height={100}
                  />
                </div>
                <div className="flex justify-center items-center flex flex-col">
                  <p className="text-lg text-[#454562] font-semibold">
                    Truck mate Report
                  </p>
                  <p className="text-sm text-[#454562] ">Profit and Loss</p>
                  <p className="text-sm text-[#A3A3A3] ">
                    Nov 26 - Dec 02, 2023
                  </p>
                </div>
                <div className="border-b border-[#A3A3A3] mt-4 mb-2 mr-4 ml-4"></div>
                <p className="flex justify-end font-semibold text-sm mr-4">
                  Total
                </p>
                <div className="border-b border-[#A3A3A3] mt-4 mb-2 mr-4 ml-4"></div>
                <div className="flex justify-between mt-4">
                  <p className="text-sm text-[#A3A3A3] ml-4 flex justify-start">
                    Revenue
                  </p>
                </div>
                {Object.entries(vehiclePaidAmounts).map(
                  ([vehicleId, totalPaidAmount]) => (
                    <div key={vehicleId} className="flex justify-between mt-2">
                      <p className="text-sm font-semibold ml-6 flex justify-start">
                        Plate: {vehicleId}
                      </p>
                      <p className="text-sm font-semibold mr-4 flex justify-end">
                        {totalPaidAmount}
                      </p>
                    </div>
                  )
                )}
                <div className="border-b border-[#A3A3A3] mt-4 mb-2 mr-4 ml-4"></div>
                <div className="flex justify-between mt-4">
                  <p className="text-sm text-[#A3A3A3] ml-6 flex justify-start">
                    Revenue
                  </p>
                  <p className="text-sm font-semibold mr-4 flex justify-end">
                    {totalPaidAmount}
                  </p>
                </div>
                <div className="border-b border-[#A3A3A3] mt-2 mb-2 mr-4 ml-4"></div>
                <div className="flex justify-between mt-4">
                  <p className="text-sm text-[#A3A3A3] ml-4 flex justify-start">
                    Expenses
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm font-semibold ml-6 flex justify-start">
                    Fuel
                  </p>
                  <p className="text-sm font-semibold mr-4 flex justify-end">
                    {totalFuel}
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm font-semibold ml-6 flex justify-start">
                    Maintenance
                  </p>
                  <p className="text-sm font-semibold mr-4 flex justify-end">
                    {totalCost}
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm font-semibold ml-6 flex justify-start">
                    Mileage Fee
                  </p>
                  <p className="text-sm font-semibold mr-4 flex justify-end">
                    {totalMileageFee}
                  </p>
                </div>
                <div className="border-b border-[#A3A3A3] mt-4 mb-2 mr-4 ml-4"></div>
                <div className="flex justify-between mt-4">
                  <p className="text-sm text-[#A3A3A3] ml-6 flex justify-start">
                    Expenses Total
                  </p>
                  <p className="text-sm font-semibold mr-4 flex justify-end">
                    {expensesAmount}
                  </p>
                </div>
                <div className="border-b border-[#A3A3A3] mt-2 mb-2 mr-4 ml-4"></div>
              </div>
            </div>
          </div>
          {showProfitLoss && (
            <div className="bg-[#F7F8FA] w-full">
              <div className="bg-white px-2 py-2">
                {/* Profit and Loss report content here */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleProfitLossCancel}
                    className="bg-white border border-[#4FD1C5] text-[#4FD1C5] px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="bg-[#4FD1C5] text-white px-4 py-2 rounded-lg ml-4"
                  >
                    Export to CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
