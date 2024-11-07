"use client";

import Link from "next/link";
import StatsCard from "./stats-card";
import { useCallback, useEffect, useState } from "react";
import {
  collection,
  count,
  getAggregateFromServer,
  query,
  where,
} from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { useAuthContext } from "@/app/auth-provider";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { TruckIcon } from "@heroicons/react/24/solid";
import Constants from "@/Constants";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const { organisationId } = useAuthContext();
  const [tripStats, setTripStats] = useState({
    total: 0,
    booked: 0,
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
    if (!organisationId) return;

    let q = query(
      collection(fbDb, Constants.fbVehicles),
      where("organisationId", "==", organisationId)
      // where("timestamp", ">=", Timestamp.fromDate(startDate)),
      // where("timestamp", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getAggregateFromServer(q, {
      docsCount: count(),
    });

    const snapshot1 = await getAggregateFromServer(
      query(q, where("availability_status", "==", "Available")),
      {
        docsCount: count(),
      }
    );

    const snapshot2 = await getAggregateFromServer(
      query(q, where("availability_status", "==", "On Route")),
      {
        docsCount: count(),
      }
    );

    const snapshot3 = await getAggregateFromServer(
      query(q, where("availability_status", "==", "Out Of Service")),
      {
        docsCount: count(),
      }
    );

    const snapshot4 = await getAggregateFromServer(
      query(q, where("availability_status", "==", "Under Maintenance")),
      {
        docsCount: count(),
      }
    );

    setVehicleStats({
      total: snapshot.data().docsCount,
      available: snapshot1.data().docsCount,
      onRoute: snapshot2.data().docsCount,
      outOfService: snapshot3.data().docsCount,
      underMaintenance: snapshot4.data().docsCount,
    });
  }, [organisationId]);

  const doFilterTrips = useCallback(async () => {
    if (!organisationId) return;

    let q = query(
      collection(fbDb, Constants.fbTrips),
      where("organisationId", "==", organisationId)
      // where("timestamp", ">=", Timestamp.fromDate(startDate)),
      // where("timestamp", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getAggregateFromServer(q, {
      docsCount: count(),
    });

    const snapshot1 = await getAggregateFromServer(
      query(q, where("trip_status", "==", "Booked")),
      {
        docsCount: count(),
      }
    );

    const snapshot2 = await getAggregateFromServer(
      query(q, where("trip_status", "==", "Done")),
      {
        docsCount: count(),
      }
    );

    const snapshot3 = await getAggregateFromServer(
      query(q, where("trip_status", "==", "Cancelled")),
      {
        docsCount: count(),
      }
    );

    setTripStats({
      total: snapshot.data().docsCount,
      booked: snapshot1.data().docsCount,
      completed: snapshot2.data().docsCount,
      cancelled: snapshot3.data().docsCount,
    });
  }, [organisationId]);

  useEffect(() => {
    doFilterVehicles();
    doFilterTrips();
  }, [doFilterTrips, doFilterVehicles]);

  return (
    <main className="">
      <div className="p-6 bg-white">
        <h2 className="font-semibold text-xl">Analytics</h2>
      </div>

      <section className="mt-5 grid-1-2-4 gap-5">
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

      <section className="mt-5 grid-1-2 gap-5">
        <div className="p-4 bg-white rounded">
          <div className="flex items-center justify-between gap-5">
            <h3 className="text-lg">Vehicles Overview</h3>
            <Link
              href="/vehicles/"
              className="btn btn-outline border-[#C0D7FA] font-light"
            >
              View All
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 items-center gap-5">
            <div className="">
              <Doughnut
                data={{
                  datasets: [
                    {
                      label: "Available",
                      data: [
                        vehicleStats.available,
                        vehicleStats.total - vehicleStats.available,
                      ],
                      backgroundColor: ["#4FD1C5", "#E9ECEF"],
                      borderWidth: 2,
                    },
                    {
                      label: "On Route",
                      data: [
                        vehicleStats.onRoute,
                        vehicleStats.total - vehicleStats.onRoute,
                      ],
                      backgroundColor: ["#065AD8", "#E9ECEF"],
                      borderWidth: 1,
                    },
                    {
                      label: "Under Maintenance",
                      data: [
                        vehicleStats.underMaintenance,
                        vehicleStats.total - vehicleStats.underMaintenance,
                      ],
                      backgroundColor: ["#FFC107", "#E9ECEF"],
                      borderWidth: 1,
                    },
                    {
                      label: "Out of service",
                      data: [
                        vehicleStats.outOfService,
                        vehicleStats.total - vehicleStats.outOfService,
                      ],
                      backgroundColor: ["#C80815", "#E9ECEF"],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  cutout: "60%",
                  animation: {
                    animateScale: true,
                    easing: "easeInBack",
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
                    name: "Available",
                    value: vehicleStats.available,
                    classNames: "bg-[#4FD1C5]/20 text-[#4FD1C5]",
                  },
                  {
                    name: "On Route",
                    value: vehicleStats.onRoute,
                    classNames: "bg-[#065AD8]/20 text-[#065AD8]",
                  },
                  {
                    name: "Under Maintenance",
                    value: vehicleStats.underMaintenance,
                    classNames: "bg-[#FFC107]/20 text-[#FFC107]",
                  },
                  {
                    name: "Out Of Service",
                    value: vehicleStats.outOfService,
                    classNames: "bg-[#C80815]/20 text-[#C80815]",
                  },
                ].map(({ name, value, classNames }) => {
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between gap-5"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-2 rounded ${classNames}`}>
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
        <div className="p-4 bg-white rounded">
          <div className="flex items-center justify-between gap-5">
            <h3 className="text-lg">Trips Overview</h3>
            <Link
              href="/trips"
              className="btn btn-outline border-[#C0D7FA] font-light"
            >
              View All
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 items-center gap-5">
            <div className="">
              <Doughnut
                data={{
                  datasets: [
                    {
                      label: "Booked",
                      data: [
                        tripStats.booked,
                        tripStats.total - tripStats.booked,
                      ],
                      backgroundColor: ["#065AD8", "#E9ECEF"],
                      borderWidth: 2,
                    },
                    {
                      label: "Completed",
                      data: [
                        tripStats.completed,
                        tripStats.total - tripStats.completed,
                      ],
                      backgroundColor: ["#4FD1C5", "#E9ECEF"],
                      borderWidth: 2,
                    },
                    {
                      label: "Cancelled",
                      data: [
                        tripStats.cancelled,
                        tripStats.total - tripStats.cancelled,
                      ],
                      backgroundColor: ["#C80815", "#E9ECEF"],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  cutout: "60%",
                  animation: {
                    animateScale: true,
                    easing: "easeInBack",
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
                    name: "Booked",
                    value: tripStats.booked,
                    classNames: "bg-[#065AD8]/20 text-[#065AD8]",
                  },
                  {
                    name: "Completed",
                    value: tripStats.completed,
                    classNames: "bg-[#4FD1C5]/20 text-[#4FD1C5]",
                  },
                  {
                    name: "Cancelled",
                    value: tripStats.cancelled,
                    classNames: "bg-[#C80815]/20 text-[#C80815]",
                  },
                ].map(({ name, value, classNames }) => {
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between gap-5"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-2 rounded ${classNames}`}>
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
    </main>
  );
}
