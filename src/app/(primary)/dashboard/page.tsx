'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { collection, count, getAggregateFromServer, query, where } from 'firebase/firestore';
import { fbDb } from '@/firebase/configs';
import { useAuthContext } from '@/app/auth-provider';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TruckIcon } from '@heroicons/react/24/solid';
import StatsCard from '@/components/stats-card';
import Constants from '@/Constants';
import LatestTrips from './latest-trips';
import { VEHICLE_STATUS } from '@/models/vehicle';
import { TRIP_STATUS } from '@/models/trip';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const { authUser } = useAuthContext();
  const [tripStats, setTripStats] = useState({
    total: 0,
    booked: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  });
  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    available: 0,
    outOfService: 0,
    underMaintenance: 0,
    onRoute: 0,
  });

  const doFilterVehicles = useCallback(async () => {
    if (!authUser || !authUser.companyId) return;

    let q = query(
      collection(fbDb, Constants.fbVehicles),
      where('company.docId', '==', authUser.companyId),
      // where("dateCreated", ">=", Timestamp.fromDate(startDate)),
      // where("dateCreated", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getAggregateFromServer(q, {
      docsCount: count(),
    });

    const snapshot1 = await getAggregateFromServer(
      query(q, where('status', '==', VEHICLE_STATUS.available)),
      {
        docsCount: count(),
      },
    );

    const snapshot2 = await getAggregateFromServer(
      query(q, where('status', '==', VEHICLE_STATUS.onRoute)),
      {
        docsCount: count(),
      },
    );

    const snapshot3 = await getAggregateFromServer(
      query(q, where('status', '==', VEHICLE_STATUS.outOfService)),
      {
        docsCount: count(),
      },
    );

    const snapshot4 = await getAggregateFromServer(
      query(q, where('status', '==', VEHICLE_STATUS.underMaintenance)),
      {
        docsCount: count(),
      },
    );

    setVehicleStats({
      total: snapshot.data().docsCount,
      available: snapshot1.data().docsCount,
      onRoute: snapshot2.data().docsCount,
      outOfService: snapshot3.data().docsCount,
      underMaintenance: snapshot4.data().docsCount,
    });
  }, [authUser]);

  const doFilterTrips = useCallback(async () => {
    if (!authUser || !authUser.companyId) return;

    let q = query(
      collection(fbDb, Constants.fbTrips),
      where('company.docId', '==', authUser.companyId),
      // where("dateCreated", ">=", Timestamp.fromDate(startDate)),
      // where("dateCreated", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getAggregateFromServer(q, {
      docsCount: count(),
    });

    const snapshot1 = await getAggregateFromServer(
      query(q, where('status', '==', TRIP_STATUS.booked)),
      {
        docsCount: count(),
      },
    );

    const snapshot2 = await getAggregateFromServer(
      query(q, where('status', '==', TRIP_STATUS.active)),
      {
        docsCount: count(),
      },
    );

    const snapshot3 = await getAggregateFromServer(
      query(q, where('status', '==', TRIP_STATUS.completed)),
      {
        docsCount: count(),
      },
    );

    const snapshot4 = await getAggregateFromServer(
      query(q, where('status', '==', TRIP_STATUS.cancelled)),
      {
        docsCount: count(),
      },
    );

    setTripStats({
      total: snapshot.data().docsCount,
      booked: snapshot1.data().docsCount,
      active: snapshot2.data().docsCount,
      completed: snapshot3.data().docsCount,
      cancelled: snapshot4.data().docsCount,
    });
  }, [authUser]);

  useEffect(() => {
    doFilterVehicles();
    doFilterTrips();
  }, [doFilterTrips, doFilterVehicles]);

  return (
    <main className="">
      <div className="bg-white p-6">
        <h2 className="text-xl font-semibold">Analytics</h2>
      </div>

      <section className="grid-1-2-4 mt-5 gap-5">
        <StatsCard
          label="Total Income"
          value="335K"
          classNames="bg-white border-b-4 border-primary"
        >
          <i className="fas fa-money-bills"></i>
        </StatsCard>
        <StatsCard
          label="Total Expense"
          value="335K"
          classNames="bg-white border-b-4 border-[#ffd648]"
        >
          <i className="fas fa-money-bills"></i>
        </StatsCard>
        <StatsCard
          label="Avg. Expenses Per Truck"
          value="335K"
          classNames="bg-white border-b-4 border-cyan-500"
        >
          <i className="fas fa-money-bills"></i>
        </StatsCard>
        <StatsCard
          label="Avg. Profit Per Truck"
          value="335K"
          classNames="bg-white border-b-4 border-green-500"
        >
          <i className="fas fa-money-bills"></i>
        </StatsCard>
      </section>

      <section className="grid-1-2 mt-5 gap-5">
        <div className="rounded bg-white p-4">
          <div className="flex items-center justify-between gap-5">
            <h3 className="text-lg">Vehicles Overview</h3>
            <Link
              href="/operations/vehicles"
              className="btn btn-outline border-[#C0D7FA] font-light"
            >
              View All
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 items-center gap-5 sm:grid-cols-2">
            <div className="">
              <Doughnut
                data={{
                  datasets: [
                    {
                      label: 'Available',
                      data: [vehicleStats.available, vehicleStats.total - vehicleStats.available],
                      backgroundColor: ['#4FD1C5', '#E9ECEF'],
                      borderWidth: 2,
                    },
                    {
                      label: 'On Route',
                      data: [vehicleStats.onRoute, vehicleStats.total - vehicleStats.onRoute],
                      backgroundColor: ['#065AD8', '#E9ECEF'],
                      borderWidth: 1,
                    },
                    {
                      label: 'Under Maintenance',
                      data: [
                        vehicleStats.underMaintenance,
                        vehicleStats.total - vehicleStats.underMaintenance,
                      ],
                      backgroundColor: ['#FFC107', '#E9ECEF'],
                      borderWidth: 1,
                    },
                    {
                      label: 'Out of service',
                      data: [
                        vehicleStats.outOfService,
                        vehicleStats.total - vehicleStats.outOfService,
                      ],
                      backgroundColor: ['#C80815', '#E9ECEF'],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  cutout: '60%',
                  animation: {
                    animateScale: true,
                    easing: 'easeInBack',
                    delay: 500,
                  },
                }}
              />
            </div>
            <div className="">
              <p className="text-gray-500">Total</p>
              <p className="text-4xl">{vehicleStats.total}</p>
              <div className="mt-5 grid gap-1">
                {[
                  {
                    name: 'Available',
                    value: vehicleStats.available,
                    classNames: 'bg-[#4FD1C5]/20 text-[#4FD1C5]',
                  },
                  {
                    name: 'On Route',
                    value: vehicleStats.onRoute,
                    classNames: 'bg-[#065AD8]/20 text-[#065AD8]',
                  },
                  {
                    name: 'Under Maintenance',
                    value: vehicleStats.underMaintenance,
                    classNames: 'bg-[#FFC107]/20 text-[#FFC107]',
                  },
                  {
                    name: 'Out Of Service',
                    value: vehicleStats.outOfService,
                    classNames: 'bg-[#C80815]/20 text-[#C80815]',
                  },
                ].map(({ name, value, classNames }) => {
                  return (
                    <div key={name} className="flex items-center justify-between gap-5">
                      <div className="flex items-center gap-5">
                        <div className={`rounded p-2 ${classNames}`}>
                          <TruckIcon className="h-5 w-5" />
                        </div>
                        <p className="text-gray-500">{name}</p>
                      </div>
                      <p>{value}</p>
                    </div>
                  );
                })}
                <div className="hidden bg-[#FFC107]"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded bg-white p-4">
          <div className="flex items-center justify-between gap-5">
            <h3 className="text-lg">Trips Overview</h3>
            <Link href="/operations/trips" className="btn btn-outline border-[#C0D7FA] font-light">
              View All
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 items-center gap-5 sm:grid-cols-2">
            <div className="">
              <Doughnut
                data={{
                  datasets: [
                    {
                      label: 'Booked',
                      data: [tripStats.booked, tripStats.total - tripStats.booked],
                      backgroundColor: ['#FFC107', '#E9ECEF'],
                      borderWidth: 2,
                    },
                    {
                      label: 'Active',
                      data: [tripStats.active, tripStats.total - tripStats.active],
                      backgroundColor: ['#065AD8', '#E9ECEF'],
                      borderWidth: 2,
                    },
                    {
                      label: 'Completed',
                      data: [tripStats.completed, tripStats.total - tripStats.completed],
                      backgroundColor: ['#4FD1C5', '#E9ECEF'],
                      borderWidth: 2,
                    },
                    {
                      label: 'Cancelled',
                      data: [tripStats.cancelled, tripStats.total - tripStats.cancelled],
                      backgroundColor: ['#C80815', '#E9ECEF'],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  cutout: '60%',
                  animation: {
                    animateScale: true,
                    easing: 'easeInBack',
                    delay: 500,
                  },
                }}
              />
            </div>
            <div className="">
              <p className="text-gray-500">Total</p>
              <p className="text-4xl">{tripStats.total}</p>
              <div className="mt-5 grid gap-1">
                {[
                  {
                    name: 'Booked',
                    value: tripStats.booked,
                    classNames: 'bg-[#FFC107]/20 text-[#FFC107]',
                  },
                  {
                    name: 'Active',
                    value: tripStats.active,
                    classNames: 'bg-[#065AD8]/20 text-[#065AD8]',
                  },
                  {
                    name: 'Completed',
                    value: tripStats.completed,
                    classNames: 'bg-[#4FD1C5]/20 text-[#4FD1C5]',
                  },
                  {
                    name: 'Cancelled',
                    value: tripStats.cancelled,
                    classNames: 'bg-[#C80815]/20 text-[#C80815]',
                  },
                ].map(({ name, value, classNames }) => {
                  return (
                    <div key={name} className="flex items-center justify-between gap-5">
                      <div className="flex items-center gap-5">
                        <div className={`rounded p-2 ${classNames}`}>
                          <TruckIcon className="h-5 w-5" />
                        </div>
                        <p className="text-gray-500">{name}</p>
                      </div>
                      <p>{value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <LatestTrips />
      </section>
    </main>
  );
}
