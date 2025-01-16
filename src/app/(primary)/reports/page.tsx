'use client';

import { useAuthContext } from '@/app/auth-provider';
import DateRangeFilter from '@/components/date-range-filter';
import { Card, CardBody } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ProfitLossData, ReportFilters, fetchProfitLossData } from '@/services/reports';
import useDateRangeFilter from '@/hooks/useDateRangeFilter';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { fbDb } from '@/firebase/configs';
import Constants from '@/Constants';
import moment from 'moment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function Reports() {
  const { authUser } = useAuthContext();
  const [dateRange, setDateRange] = useState('thisMonth');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [reportData, setReportData] = useState<ProfitLossData[]>([]);
  const dateParams = useDateRangeFilter({ dateRange });
  const [trucks, setTrucks] = useState<any>([]);
  const [drivers, setDrivers] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReportData() {
      if (!authUser?.companyId || !dateParams) return;

      const filters: ReportFilters = {
        startDate: dateParams.startDate,
        endDate: dateParams.endDate,
        truckId: selectedTruck || undefined,
        driverId: selectedDriver || undefined,
      };

      const data = await fetchProfitLossData(authUser.companyId, filters);
      setReportData(data);
    }

    loadReportData();
  }, [authUser?.companyId, dateParams, selectedTruck, selectedDriver]);

  useEffect(() => {
    async function fetchFiltersData() {
      if (!authUser?.companyId) return;

      try {
        setIsLoading(true);

        // Add company filter to queries
        const trucksRef = query(
          collection(fbDb, Constants.fbVehicles),
          where('company.docId', '==', authUser.companyId),
        );

        const driversRef = query(
          collection(fbDb, Constants.fbDrivers),
          where('company.docId', '==', authUser.companyId),
        );

        const [trucksSnap, driversSnap] = await Promise.all([
          getDocs(trucksRef),
          getDocs(driversRef),
        ]);

        console.log('Trucks count:', trucksSnap.size);
        console.log('Drivers count:', driversSnap.size);

        const trucksData = trucksSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            regNumber: data.lisence_plate,
            name: `${data.make} ${data.model}`,
            vehicleId: data.vehiclesId,
          };
        });

        const driversData = driversSnap.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              firstName: data.firstName,
              lastName: data.lastName,
              displayName: data.displayName,
              phoneNumber: data.phoneNumber,
            };
          })
          .filter((driver) => driver.firstName && driver.lastName);

        console.log('Processed trucks:', trucksData);
        console.log('Processed drivers:', driversData);

        setTrucks(trucksData);
        setDrivers(driversData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFiltersData();
  }, [authUser?.companyId]);

  const formatDateLabel = (dateStr: string) => {
    return moment(dateStr).format('MMM DD, YYYY');
  };

  const chartData = {
    labels: reportData.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: 'Income',
        data: reportData.map((d) => d.income),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Expenses',
        data: reportData.map((d) => d.expenses),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Profit',
        data: reportData.map((d) => d.profit),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const totals = reportData.reduce(
    (acc, curr) => ({
      income: acc.income + curr.income,
      expenses: acc.expenses + curr.expenses,
      profit: acc.profit + curr.profit,
    }),
    { income: 0, expenses: 0, profit: 0 },
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profit & Loss Report</h1>
        <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <div className="space-y-2">
              <p className="text-default-500 text-sm">Total Income</p>
              <p className="text-success text-2xl font-bold">${totals.income.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="space-y-2">
              <p className="text-default-500 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-danger">${totals.expenses.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="space-y-2">
              <p className="text-default-500 text-sm">Net Profit</p>
              <p className="text-2xl font-bold text-primary">${totals.profit.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="w-[250px]">
          <label className="mb-1 block text-sm font-medium text-gray-700">Select Truck</label>
          <select
            className="w-full rounded-lg border bg-white p-2"
            value={selectedTruck}
            onChange={(e) => setSelectedTruck(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Trucks</option>
            {trucks.map((truck: any) => (
              <option key={truck.id} value={truck.id}>
                {truck.regNumber} - {truck.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[250px]">
          <label className="mb-1 block text-sm font-medium text-gray-700">Select Driver</label>
          <select
            className="w-full rounded-lg border bg-white p-2"
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Drivers</option>
            {drivers.map((driver: any) => (
              <option key={driver.id} value={driver.id}>
                {driver.displayName || `${driver.firstName} ${driver.lastName}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody>
            <h3 className="mb-4 text-lg font-semibold">Revenue vs Expenses Trend</h3>
            <Line
              data={chartData}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index' as const,
                  intersect: false,
                },
                scales: {
                  x: {
                    ticks: {
                      callback: function (val: any, index: number) {
                        return chartData.labels[index];
                      },
                      maxRotation: 0,
                      autoSkip: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="mb-4 text-lg font-semibold">Profit/Loss Analysis</h3>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      callback: function (val: any, index: number) {
                        return chartData.labels[index];
                      },
                      maxRotation: 0,
                      autoSkip: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
