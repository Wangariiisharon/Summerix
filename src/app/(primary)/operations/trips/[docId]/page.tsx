'use client';

import * as Yup from 'yup';
import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import Trips from '@/json/trips.json';
import { TRIP, TRIP_STATUS } from '@/models/trip';
import TripVehicle from './vehicle';
import Image from 'next/image';

const TripSchema = () => {
  return Yup.object().shape({
    from: Yup.object().shape({
      location: Yup.string().required('From location is required.'),
    }),
    to: Yup.object().shape({
      location: Yup.string().required('To location is required.'),
    }),
    vehicle: Yup.object().shape({
      regNumber: Yup.string().required('Vehicle reg. number is required.'),
    }),
    status: Yup.string().required('Status is required.'),
  });
};

type Props = {
  params: { docId: string };
};

export default function Vehicle({ params }: Props) {
  const [trip, setTrip] = useState<TRIP>();
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();
  const router = useRouter();
  const { docId } = params;

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbTrips, docId);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          const data = snapshot.data() as TRIP;
          data.docId = snapshot.id;
          setTrip(data);
        },
        (error) => {
          console.error('onSnapshot > error:', error);
        },
      );

      return () => unsubscribe();
    }
  }, [docId]);

  const doSave = async (formValues: any) => {
    console.debug('doSave > formValues:', formValues);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage trips.');
      return;
    }

    try {
      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbTrips);
        await addDoc(colRef, {
          ...formValues,
          createdBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          dateCreated: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
        toast.success('New trip added successfully.');
      } else {
        const docRef = doc(fbDb, Constants.fbTrips, docId);
        await updateDoc(docRef, {
          ...formValues,
          lastUpdated: serverTimestamp(),
        });
        toast.success('Trip updated successfully.');
      }

      router.push('/operations/trips');
    } catch (error) {
      console.error('save trip error:', error);
    }
  };

  if (!company) return <></>;

  return (
    <main className="">
      <h2 className="font-bold">Trip</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          status: trip?.status || TRIP_STATUS.booked,
          company: trip?.company || {
            docId: company.docId,
            name: company.name || '',
            email: company.email || '',
            phoneNumber: company.phoneNumber || '',
            regNumber: company.regNumber || '',
          },
          from: trip?.from || {
            country: '',
            location: '',
          },
          to: trip?.to || {
            country: '',
            location: '',
          },
          driver: trip?.driver || null,
          vehicle: trip?.vehicle || null,
          updatedBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
        }}
        validationSchema={TripSchema()}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid, setFieldValue }) => (
          <Form className="mt-6">
            {/* <h2 className="text-center font-bold"></h2> */}

            <div className="mt-5 grid gap-5 p-4 shadow-sm">
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">From</label>
                </div>
                <div className="">
                  <Field type="text" name="from.location" className="form-input" />
                  <ErrorMessage name="from.location" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">To</label>
                </div>
                <div className="">
                  <Field type="text" name="to.location" className="form-input" />
                  <ErrorMessage name="to.location" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Vehicle</label>
                </div>
                <TripVehicle
                  companyId={authUser?.companyId || 'xyz'}
                  setFieldValue={setFieldValue}
                  trip={trip}
                />
              </label>
              {trip && trip.driver && (
                <div className="grid-1-3 gap-5">
                  <div className="text-sm">
                    <label className="font-medium">Driver</label>
                  </div>
                  <div className="grid-1-2 col-span-2 gap-3">
                    {trip.driver && (
                      <div className="flex items-center gap-3">
                        <Image
                          src={trip.driver.photoURL}
                          alt={trip.driver.displayName}
                          className="size-20 shrink-0 rounded-full"
                          width={100}
                          height={100}
                        />
                        <div className="grid gap-0.5">
                          <p className="">{trip.driver.displayName}</p>
                          <div className="form-label">
                            <p>{trip.driver.email}</p>
                            <p>{trip.driver.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Status</label>
                </div>
                <div className="">
                  <Field
                    as="select"
                    name="status"
                    placeholder="Status"
                    className="form-select w-40"
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {Trips.statusList.map(({ name, value }) => {
                      return (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="yom" component="span" className="form-error" />
                </div>
              </label>
            </div>

            <div className="grid-1-3 mt-10 gap-5">
              <p className=""></p>
              <div className="flex justify-end gap-5">
                <Link href="/operations/trips" className="btn btn-outline">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!isValid || !authUser}
                  className="btn btn-secondary"
                >
                  Save
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
}
