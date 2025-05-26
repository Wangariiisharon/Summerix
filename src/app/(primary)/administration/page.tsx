'use client';

import { useAuthContext } from '@/app/auth-provider';
import StatsCard from '@/components/stats-card';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { UserIcon } from '@heroicons/react/24/outline';
import { collection, count, getAggregateFromServer, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Administration() {
  const { authUser } = useAuthContext();
  const [adminStats, setAdminStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [departmentStats, setDepartmentStats] = useState({
    total: 0,
  });

  const doFilterDrivers = useCallback(async (companyId: string) => {
    let q = query(
      collection(fbDb, Constants.fbAdmins),
      where('company.docId', '==', companyId),
      // where("dateCreated", ">=", Timestamp.fromDate(startDate)),
      // where("dateCreated", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getAggregateFromServer(q, {
      docsCount: count(),
    });
    const snapshot1 = await getAggregateFromServer(
      query(q, where('rolesMap.isActive', '==', true)),
      {
        docsCount: count(),
      },
    );
    const snapshot2 = await getAggregateFromServer(
      query(q, where('rolesMap.isActive', '==', false)),
      {
        docsCount: count(),
      },
    );

    setAdminStats({
      total: snapshot.data().docsCount,
      active: snapshot1.data().docsCount,
      inactive: snapshot2.data().docsCount,
    });
  }, []);

  const doFilterDepartments = useCallback(async (companyId: string) => {
    let q = query(
      collection(fbDb, Constants.fbDepartments),
      where('company.docId', '==', companyId),
      // where("dateCreated", ">=", Timestamp.fromDate(startDate)),
      // where("dateCreated", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getAggregateFromServer(q, {
      docsCount: count(),
    });

    setDepartmentStats({
      total: snapshot.data().docsCount,
    });
  }, []);

  useEffect(() => {
    if (authUser && authUser.companyId) {
      doFilterDrivers(authUser.companyId);
      doFilterDepartments(authUser.companyId);
    }
  }, [authUser, doFilterDepartments, doFilterDrivers]);

  return (
    <main className="-mx-4 rounded">
      {/* <h2 className="font-bold">Overview</h2> */}

      <section className="grid-1-2-4 gap-5">
        <StatsCard
          label="Admin Users"
          value={adminStats.total.toLocaleString()}
          classNames="bg-white border-b-4 border-primary"
        >
          <i className="fas fa-user-shield"></i>
        </StatsCard>
        <StatsCard
          label="Departments"
          value={departmentStats.total.toLocaleString()}
          classNames="bg-white border-b-4 border-primary"
        >
          <i className="fas fa-users-rectangle"></i>
        </StatsCard>
      </section>

      <section className="grid-1-2 mt-5 gap-5">
        <div className="rounded bg-white p-4">
          <div className="flex items-center justify-between gap-5">
            <h3 className="text-lg">Users Overview</h3>
            <Link
              href="/administration/users"
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
                      label: 'Active',
                      data: [adminStats.active, adminStats.total - adminStats.active],
                      backgroundColor: ['#1C1967', '#E9ECEF'],
                      borderWidth: 2,
                    },
                    {
                      label: 'Inactive',
                      data: [adminStats.inactive, adminStats.total - adminStats.inactive],
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
              <p className="text-4xl">{adminStats.total}</p>
              <div className="mt-5 grid gap-1">
                {[
                  {
                    name: 'Active',
                    value: adminStats.active,
                    classNames: 'bg-[#1C1967]/20 text-[#1C1967]',
                  },
                  {
                    name: 'Inactive',
                    value: adminStats.inactive,
                    classNames: 'bg-[#C80815]/20 text-[#C80815]',
                  },
                ].map(({ name, value, classNames }) => {
                  return (
                    <div key={name} className="flex items-center justify-between gap-5">
                      <div className="flex items-center gap-5">
                        <div className={`rounded p-2 ${classNames}`}>
                          <UserIcon className="h-5 w-5" />
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
