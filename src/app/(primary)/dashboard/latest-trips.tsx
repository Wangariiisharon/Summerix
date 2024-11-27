'use client';

import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { TRIP } from '@/models/trip';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

export default function LatestTrips() {
  const [trips, setTrips] = useState<TRIP[]>([]);
  const { authUser } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!authUser || !authUser.companyId) return;

    const q = query(
      collection(fbDb, Constants.fbTrips),
      where('company.docId', '==', authUser.companyId),
      orderBy('lastUpdated', 'desc'),
      limit(5),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const results = snapshot.docs.map(
        (doc) => {
          const data = doc.data() as TRIP;
          data.docId = doc.id;
          return data;
        },
        (error: any) => {
          console.error('onSnapshot > error:', error);
        },
      );
      setTrips(results);
    });
    return () => unsubscribe();
  }, [authUser]);

  return (
    <Suspense fallback="Loading">
      <main className="bg-white p-4">
        <div className="flex items-center justify-between gap-5">
          <h3 className="text-lg">Latest Trips</h3>
          <Link href="/operations/trips" className="btn btn-outline border-[#C0D7FA] font-light">
            View All
          </Link>
        </div>

        <div className="table-wrapper">
          <div className="table-scroll text-sm">
            <table className="my-table">
              <thead className="sticky top-0">
                <tr className="tr-header">
                  <th className="th">Vehicle</th>
                  <th className="th table-cell-sm">From</th>
                  <th className="th table-cell-sm">To</th>
                  <th className="th table-cell-md">Distance</th>
                  <th className="th">Status</th>
                  <th className="th">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip: TRIP) => {
                  return (
                    <tr
                      key={trip.docId}
                      onClick={() => router.push(`/operations/trips/${trip.docId}`)}
                      className="tr-body cursor-pointer"
                    >
                      <td className="td">{trip.vehicle.regNumber}</td>
                      <td className="td table-cell-sm max-w-40">{trip.from.location}</td>
                      <td className="td table-cell-sm max-w-40">{trip.to.location}</td>
                      <td className="td table-cell-md">{trip.distance?.text || 'N/A'}</td>
                      <td className="td">{trip.status}</td>
                      <td className="td">
                        {trip.dateCreated &&
                          moment(trip.dateCreated.toDate()).format(Constants.dateTimeFormat)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </Suspense>
  );
}
