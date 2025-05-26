'use client';

import { useAuthContext } from '@/app/auth-provider';
import DateRangeFilter from '@/components/date-range-filter';
import { Card, CardBody } from '@nextui-org/react';
import { useState } from 'react';
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
// import { ProfitLossData } from '@/services/reports';
import useDateRangeFilter from '@/hooks/useDateRangeFilter';
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
  const [reportData, setReportData] = useState<[]>([]);
  const dateParams = useDateRangeFilter({ dateRange });

  

  const formatDateLabel = (dateStr: string) => {
    return moment(dateStr).format('MMM DD, YYYY');
  };

  const hasData = reportData.length > 0;

  const chartData = {
    labels: hasData ? reportData.map((d) => formatDateLabel('Jan')) : ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Income',
        data: hasData ? reportData.map((d) => [2000, 3000, 4000, 5000]) : [0, 0, 0, 0],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Expenses',
        data: hasData ? reportData.map((d) => [2000, 3000, 4000, 5000]) : [0, 0, 0, 0],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Profit',
        data: hasData ? reportData.map((d) => [2000, 3000, 4000, 5000]) : [0, 0, 0, 0],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
  

  
  const totals= 15

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
              <p className="text-success text-2xl font-bold">${totals}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="space-y-2">
              <p className="text-default-500 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-danger">${totals}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="space-y-2">
              <p className="text-default-500 text-sm">Net Profit</p>
              <p className="text-2xl font-bold text-primary">${totals}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="w-[250px]">
          <label className="mb-1 block text-sm font-medium text-gray-700">Select</label>
       
        </div>

        <div className="w-[250px]">
          <label className="mb-1 block text-sm font-medium text-gray-700">Select</label>
         
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
