'use client';

import { useAuthContext } from '@/app/auth-provider';
import StatsCard from '@/components/stats-card';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { TRIP_STATUS } from '@/models/trip';
import { TruckIcon } from '@heroicons/react/24/outline';
import { collection, count, getAggregateFromServer, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { VEHICLE_STATUS } from '@/models/vehicle';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Operations() {
  const { authUser } = useAuthContext();
  const [driverStats, setDriverStats] = useState({
    total: 0,
  });
  const [maintenanceStats, setMaintenanceStats] = useState({
    total: 0,
  });
  const [supplierStats, setSupplierStats] = useState({
    total: 0,
  });
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

  const doFilterDrivers = useCallback(async (companyId: string) => {
    let q = query(
      collection(fbDb, Constants.fbDrivers),
      where('company.docId', '==', companyId),
      // where("dateCreated", ">=", Timestamp.fromDate(startDate)),
      // where("dateCreated", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getAggregateFromServer(q, {
      docsCount: count(),
    });

    setDriverStats({
      total: snapshot.data().docsCount,
    });
  }, []);

  const doFilterMaintenance = useCallback(async (companyId: string) => {
    let q = query(
      collection(fbDb, Constants.fbMaintenance),
      where('company.docId', '==', companyId),
      // where("dateCreated", ">=", Timestamp.fromDate(startDate)),
      // where("dateCreated", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getAggregateFromServer(q, {
      docsCount: count(),
    });

    setMaintenanceStats({
      total: snapshot.data().docsCount,
    });
  }, []);

  const doFilterSuppliers = useCallback(async (companyId: string) => {
    let q = query(
      collection(fbDb, Constants.fbSuppliers),
      where('company.docId', '==', companyId),
      // where("dateCreated", ">=", Timestamp.fromDate(startDate)),
      // where("dateCreated", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getAggregateFromServer(q, {
      docsCount: count(),
    });

    setSupplierStats({
      total: snapshot.data().docsCount,
    });
  }, []);

  const doFilterTrips = useCallback(async (companyId: string) => {
    let q = query(
      collection(fbDb, Constants.fbTrips),
      where('company.docId', '==', companyId),
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
  }, []);

  const doFilterVehicles = useCallback(async (companyId: string) => {
    let q = query(
      collection(fbDb, Constants.fbVehicles),
      where('company.docId', '==', companyId),
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
  }, []);

  useEffect(() => {
    if (authUser && authUser.companyId) {
      doFilterDrivers(authUser.companyId);
      doFilterMaintenance(authUser.companyId);
      doFilterSuppliers(authUser.companyId);
      doFilterTrips(authUser.companyId);
      doFilterVehicles(authUser.companyId);
    }
  }, [
    authUser,
    doFilterDrivers,
    doFilterMaintenance,
    doFilterSuppliers,
    doFilterTrips,
    doFilterVehicles,
  ]);

  return (
    <main className="-mx-4 rounded">
      {/* <h2 className="font-bold">Overview</h2> */}

      <section className="grid-1-2-3-5 gap-5">
        <StatsCard
          label="Trips"
          value={tripStats.total.toLocaleString()}
          classNames="bg-white border-b-4 border-primary"
        >
          <i className="fas fa-truck-fast"></i>
        </StatsCard>
        <StatsCard
          label="Vehicles"
          value={vehicleStats.total.toLocaleString()}
          classNames="bg-white border-b-4 border-primary"
        >
          <i className="fas fa-truck"></i>
        </StatsCard>
        <StatsCard
          label="Drivers"
          value={driverStats.total.toLocaleString()}
          classNames="bg-white border-b-4 border-primary"
        >
          <i className="fas fa-person"></i>
        </StatsCard>
        <StatsCard
          label="Maintenance"
          value={maintenanceStats.total.toLocaleString()}
          classNames="bg-white border-b-4 border-primary"
        >
          <i className="fas fa-toolbox"></i>
        </StatsCard>
        <StatsCard
          label="Suppliers"
          value={supplierStats.total.toLocaleString()}
          classNames="bg-white border-b-4 border-primary"
        >
          <i className="fas fa-cart-shopping"></i>
        </StatsCard>
      </section>

      <section className="grid-1-2 mt-5 gap-5">
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
      </section>
    </main>
  );
}
