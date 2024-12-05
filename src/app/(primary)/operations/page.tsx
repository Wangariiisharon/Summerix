'use client';

import { useAuthContext } from '@/app/auth-provider';
import StatsCard from '@/components/stats-card';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { collection, count, getAggregateFromServer, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

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
  });
  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
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
    setTripStats({
      total: snapshot.data().docsCount,
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
    setVehicleStats({
      total: snapshot.data().docsCount,
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
    </main>
  );
}
