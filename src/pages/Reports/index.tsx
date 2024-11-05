import {
  query,
  collection,
  where,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { fbDb } from "@/firebase/configs";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import SiteLayout from "@/Layout/SiteLayout";
import Image from "next/image";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Avatar_profile_photo from "../../../public/Avatar_profile_photo.png";
import { format } from "date-fns";

interface TripData {
  id: string;
  mileage_fee: number;
  fuel: number;
}

interface MaintenanceData {
  id: string;
  cost: number;
}

interface JobCardData {
  id: string;
  publicProfile: string;
  phoneNumber: string;
  country: string;
  timezone: string;
  currency: string[];
  primaryCurrency: string;
  photoURL: string;
}

export default function Reports() {
  const [tripsData, setTripsData] = useState<TripData[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData[]>([]);
  const [totalMileageFee, setTotalMileageFee] = useState(0);
  const [totalFuel, setTotalFuel] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organisationId } = useAuthContext();
  const [vehiclePaidAmounts, setVehiclePaidAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);
  const [expensesAmount, setExpensesAmount] = useState<number>(0);
  const [netProfit, setNetProfit] = useState<number>(0);

  const [companySettings, setCompanySettings] = useState<JobCardData>({
    id: "",
    publicProfile: "",
    phoneNumber: "",
    country: "",
    timezone: "",
    currency: [],
    photoURL: "",
    primaryCurrency: "KES",
  });

  // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [fetchedJobcards, setFetchedJobcards] = useState<JobCardData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showProfitLoss, setShowProfitLoss] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectYear, setSelectYear] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const handleProfitLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowProfitLoss(e.target.checked);
  };
  const handleProfitLossCancel = () => {
    setShowProfitLoss(false);
  };
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(20), (val, index) => currentYear - index);
  const formatDate = (date: any) => format(new Date(date), "MM/dd/yyyy"); // Or 'dd/MM/yyyy' depending on your preferred format

  useEffect(() => {
    if (!organisationId) {
      console.error("Organisation ID is missing");
      return;
    }

    let start: Date;
    let end: Date;

    const year = selectYear || new Date().getFullYear();
    setYear(year);

    if (startDate && endDate) {
      start = new Date(startDate);
      start.setFullYear(year);
      end = new Date(endDate);
      end.setFullYear(year);
    } else if (selectYear) {
      start = new Date(selectYear, new Date().getMonth(), 1);
      end = new Date(selectYear, new Date().getMonth(), new Date().getDate());
    } else {
      start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      end = new Date();
    }

    const formattedStart = formatDate(start);
    const formattedEnd = formatDate(end);
    console.log(formattedStart, formattedEnd);

    const fetchTripsAndMaintenance = async () => {
      setLoading(true);
      setError(null);
      try {
        const tripsQuery = query(
          collection(fbDb, "trips"),
          where("organisationId", "==", organisationId),
          where("start_time", ">=", start),
          where("start_time", "<=", end)
        );
        const maintenanceQuery = query(
          collection(fbDb, "maintenance"),
          where("organisationId", "==", organisationId),
          where("status", "==", "Approved"),
          where("date", ">=", start),
          where("date", "<=", end)
        );

        const tripsSnapshot = await getDocs(tripsQuery);
        console.log("tripsSnapshot", tripsSnapshot);

        const trips = tripsSnapshot.docs.map((doc) => ({
          id: doc.id,
          mileage_fee: doc.data().mileage_fee,
          fuel: doc.data().fuel,
          ...doc.data(),
        }));
        console.log("Trips", trips);
        console.log("tripsQuery", tripsQuery);

        let mileageFeeSum = 0;
        let fuelSum = 0;
        trips.forEach((trip) => {
          mileageFeeSum += trip.mileage_fee || 0;
          fuelSum += trip.fuel || 0;
        });

        const maintenanceSnapshot = await getDocs(maintenanceQuery);
        const maintenance = maintenanceSnapshot.docs.map((doc) => ({
          id: doc.id,
          cost: doc.data().cost,
          ...doc.data(),
        }));

        let costSum = 0;
        maintenance.forEach((maintenanceEntry) => {
          costSum += maintenanceEntry.cost || 0;
        });

        setTripsData(trips);
        setMaintenanceData(maintenance);
        setTotalMileageFee(mileageFeeSum);
        setTotalFuel(fuelSum);
        setTotalCost(costSum);

        const allExpenses = mileageFeeSum + fuelSum + costSum;
        setExpensesAmount(allExpenses);
      } catch (err) {
        console.error("Error fetching trips and maintenance data:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchTotalPaidAmountByVehicle = async () => {
      try {
        const tripsQuery = query(
          collection(fbDb, "trips"),
          where("organisationId", "==", organisationId),
          where("start_time", ">=", start),
          where("start_time", "<=", end)
        );
        const tripsSnapshot = await getDocs(tripsQuery);
        const vehiclePaidAmountMap: { [key: string]: number } = {};
        tripsSnapshot.forEach((doc) => {
          const data = doc.data();
          const vehicle = data.vehicle;
          const paidAmount = data.paid_amount || 0;
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
      } catch (error) {
        console.error("Error fetching total paid amount by vehicle:", error);
      }
    };

    const fetchJobcards = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(db, "companyProfile"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const jobcardData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              publicProfile: doc.data().publicProfile,
              phoneNumber: doc.data().phoneNumber,
              country: doc.data().country,
              primaryCurrency: doc.data().primaryCurrency,
              timezone: doc.data().timezone,
              currency: doc.data().currency || [],
              photoURL: doc.data().photoURL || "",
            })) as JobCardData[];

            setFetchedJobcards(jobcardData);

            if (jobcardData.length > 0) {
              setCompanySettings(jobcardData[0]);
            } else {
              const newDocRef = doc(collection(db, "companyProfile"));
              const newDocData = {
                organisationId,
                publicProfile: "",
                phoneNumber: "",
                country: "",
                timezone: "",
                currency: [],
                photoURL: "",
                primaryCurrency: "KES",
              };
              setDoc(newDocRef, newDocData);
              setCompanySettings({ id: newDocRef.id, ...newDocData });
            }
          });

          return () => unsubscribe();
        } else {
          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching Company settings:", error);
      }
    };

    fetchJobcards();
    fetchTotalPaidAmountByVehicle();
    fetchTripsAndMaintenance();
  }, [organisationId, selectYear, startDate, endDate]);

  useEffect(() => {
    // Calculate net profit when totalPaidAmount or expensesAmount changes
    if (totalPaidAmount !== null && expensesAmount !== null) {
      const netProfit = totalPaidAmount - expensesAmount;
      setNetProfit(netProfit);
    }
  }, [totalPaidAmount, expensesAmount]);
  const exportToCSV = () => {
    const headers = [
      "Vehicle ID",
      "Revenue",
      "Total Fuel",
      "Total Maintenance",
      "Total Mileage Fee",
      "Net Profit",
    ];
    const rows = Object.entries(vehiclePaidAmounts).map(
      ([vehicleId, totalPaidAmount]) => {
        return [
          vehicleId,
          totalPaidAmount,
          totalFuel,
          totalCost,
          totalMileageFee,
          netProfit,
        ].join(",");
      }
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "profit_and_loss_report.csv");
  };
  // const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedYear(parseInt(event.target.value, 10));
  //   setSelectedDate(null); // Reset the selected date when the year changes
  // };

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };

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
            {/* <SearchBar
              placeholder="Search User"
              onChange={handleSearchChange}
              className="h-6"
            /> */}
          </div>
          <div className="flex space-x-2 ml-[430px] items-center">
            <div className="">
              <select
                onChange={(e) => setSelectYear(Number(e.target.value))}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Year
                </option>
                {[...Array(10).keys()].map((offset) => {
                  const year = new Date().getFullYear() - offset;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <DatePicker
              selected={startDate ?? undefined}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              placeholderText="Start Date"
              className="flex items-center border border-blue-500 text-blue-500 rounded-lg"
            />
            <DatePicker
              selected={endDate ?? undefined}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              placeholderText="End Date"
              className="flex items-center border border-blue-500 text-blue-500 rounded-lg"
            />
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
                  onChange={handleProfitLossChange}
                />
                <p className="text-sm ml-2 font-semibold">Revenue</p>
              </div>
              <div className="flex flex-row mb-2 ml-8">
                <input
                  type="checkbox"
                  className="form-checkbox text-sm h-5 w-5 rounded-md"
                  checked={showProfitLoss}
                  onChange={handleProfitLossChange}
                />
                <p className="text-sm ml-2 font-semibold">Expenses</p>
              </div>
            </div>

            <div className="bg-[#F7F8FA] w-full">
              <div className="bg-white mt-4 ml-4 mr-4">
                <div className="ml-6 py-4">
                  {/* <Image
                    src="/logo-black.png"
                    alt="Truck Mate logo"
                    className="h-auto w-auto"
                    width={150}
                    height={100}
                  /> */}
                  <Image
                    src={companySettings.photoURL || Avatar_profile_photo}
                    className="h-auto w-auto rounded-md"
                    alt="logo"
                    width={100}
                    height={100}
                    priority={true}
                  />
                </div>
                <div className="flex justify-center items-center flex flex-col">
                  <p className="text-lg text-[#454562] font-semibold">
                    {companySettings.publicProfile} Report
                  </p>
                  <p className="text-sm text-[#454562] ">Profit and Loss</p>

                  {/* <p className="text-sm text-[#A3A3A3]">
                    {startDate
                      ? startDate.toLocaleDateString()
                      : `${new Date(
                          year !== null ? year : new Date().getFullYear(),
                          new Date().getMonth(),
                          1
                        ).toLocaleDateString()}`}
                    -
                    {endDate
                      ? endDate.toLocaleDateString()
                      : new Date().toLocaleDateString()}
                    ,{selectYear || currentYear}
                  </p> */}
                  <p className="text-sm text-[#A3A3A3]">
                    {startDate
                      ? formatDate(startDate)
                      : formatDate(
                          new Date(
                            year !== null ? year : new Date().getFullYear(),
                            new Date().getMonth(),
                            1
                          )
                        )}
                    -{endDate ? formatDate(endDate) : formatDate(new Date())},
                    {/* {selectYear || currentYear} */}
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
                        {vehicleId}
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
                    Total Revenue
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
                    Total Expenses
                  </p>
                  <p className="text-sm font-semibold mr-4 flex justify-end">
                    {expensesAmount}
                  </p>
                </div>
                <div className="border-b border-[#A3A3A3] mt-2 mb-2 mr-4 ml-4"></div>
                {/* Net Profit = total rev - total exp */}

                <div className="flex justify-between mt-4">
                  <p className="text-sm text-[#A3A3A3] ml-6 flex justify-start">
                    Net Profit
                  </p>
                  <p className="text-sm font-semibold mr-4 flex justify-end">
                    {netProfit}
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
