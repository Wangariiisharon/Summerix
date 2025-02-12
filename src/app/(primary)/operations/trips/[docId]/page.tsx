'use client';

import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import {
  addDoc,
  collection,
  doc,
  GeoPoint,
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
import TripAddressInput from './address-input';
import TripVehicle from './vehicle';
import Image from 'next/image';
import moment from 'moment';
import { TripFormSchema } from '@/app/schemas/trip-form-schema';
import TripClasses from './class';
import TripClients from './client';
import { DocumentIcon, EyeIcon } from '@heroicons/react/24/outline';
import DeleteDocumentButton from './button-delete-document';
import AddDocumentButton from './button-add-document';

type Props = {
  params: { docId: string };
};

export default function Trip({ params }: Props) {
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
    console.log('doSave > formValues:', formValues);
    if (!(authUser?.isAdmin || authUser?.isOwner)) {
      toast.error('You are not authorised to manage trips.');
      return;
    }

    try {
      if (formValues.schedule) {
        formValues.schedule.startAt = moment(formValues.schedule.startAt).toDate();
        formValues.schedule.endAt = moment(formValues.schedule.endAt).toDate();
      }

      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbTrips);
        await addDoc(colRef, {
          ...formValues,
          createdBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          startedAt: formValues.schedule.startAt,
          endedAt: formValues.schedule.endAt,
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
    <main className="-mx-4 rounded bg-white p-4">
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
            cordinates: new GeoPoint(0, 0),
            location: '',
          },
          to: trip?.to || {
            cordinates: new GeoPoint(0, 0),
            location: '',
          },
          driver: trip?.driver || null,
          vehicle: trip?.vehicle || null,
          documents: trip?.documents || [],
          class: trip?.class || null,
          cargoType: trip?.cargoType || null,
          memo: trip?.memo || '',
          containerNumber: trip?.containerNumber || '',

          payments: {
            dealValue: trip?.payments?.dealValue || 0,
            paidAmount: trip?.payments?.paidAmount || 0,
            mileageFee: trip?.payments?.mileageFee || 0,
          },
          fuel: trip?.fuel || 0,
          currency: trip?.currency || '',
          distance: {
            text: trip?.distance?.text || '',
            value: trip?.distance?.value || 0,
          },
          schedule: trip?.schedule
            ? {
                startAt: trip.schedule.startAt
                  ? moment(trip.schedule.startAt.toDate()).format(Constants.dateInputFormat)
                  : '',
                endAt: trip.schedule.endAt
                  ? moment(trip.schedule.endAt.toDate()).format(Constants.dateInputFormat)
                  : '',
              }
            : {
                startAt: '',
                endAt: '',
              },
          updatedBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
        }}
        validationSchema={TripFormSchema}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid, setFieldValue, values }) => (
          <Form className="mt-6">
            {/* <h2 className="text-center font-bold"></h2> */}

            <div className="mt-5 grid gap-5 p-4">
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">From</label>
                </div>
                <TripAddressInput
                  address="from"
                  locationValue={values.from.location}
                  setFieldValue={setFieldValue}
                />
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">To</label>
                </div>
                <TripAddressInput
                  address="to"
                  locationValue={values.to.location}
                  setFieldValue={setFieldValue}
                />
              </label>

              <hr className="my-3" />

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

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Class</label>
                </div>
                <TripClasses setFieldValue={setFieldValue} trip={trip} />
              </label>

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Client</label>
                </div>
                <TripClients setFieldValue={setFieldValue} trip={trip} />
              </label>

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Currency</label>
                </div>
                <div className="block">
                  <Field as="select" name="currency" className="form-input">
                    <option value="" disabled>
                      Select...
                    </option>
                    {company.currencyList.map(({ code }) => {
                      return (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      );
                    })}
                  </Field>
                </div>
              </label>

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Rates</label>
                </div>
                <div className="block">
                  <Field type="number" name="payments.dealValue" className="form-input" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Paid Amount</label>
                </div>
                <div className="block">
                  <Field type="number" name="payments.paidAmount" className="form-input" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Mileage Fee</label>
                </div>
                <div className="block">
                  <Field type="number" name="payments.mileageFee" className="form-input" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Fuel</label>
                </div>
                <div className="block">
                  <Field type="number" name="fuel" className="form-input" />
                </div>
              </label>

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Cargo Size</label>
                </div>
                <div className="block">
                  <Field type="text" name="cargoType" className="form-input" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Container Number</label>
                </div>
                <div className="block">
                  <Field type="text" name="containerNumber" className="form-input" />
                </div>
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

              <hr className="my-3" />

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Start Time</label>
                </div>
                <div className="block">
                  <Field type="datetime-local" name="schedule.startAt" className="form-input" />
                  <ErrorMessage name="schedule.startAt" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">End Time</label>
                </div>
                <div className="block">
                  <Field type="datetime-local" name="schedule.endAt" className="form-input" />
                  <ErrorMessage name="schedule.endAt" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Memo</label>
                </div>
                <div className="block">
                  <Field type="text" name="memo" className="form-input" placeholder="Required" />
                </div>
              </label>
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
            {trip && (
              <div className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Documents</label>
                </div>
                <div className="grid gap-3">
                  {values.documents.map((document, i) => {
                    return (
                      <div
                        key={`${document.downloadURL}-${i}`}
                        className="flex items-center justify-between gap-5 rounded bg-gray-100 px-4 py-2"
                      >
                        <div className="flex items-center gap-4">
                          <DocumentIcon className="h-12 w-12" />
                          <div className="grid gap-0.5">
                            <p className="">{document.fileName}</p>
                            <Link
                              href={document.downloadURL}
                              className="flex items-center gap-2 text-xs text-primary hover:opacity-50"
                              target="_blank"
                            >
                              <EyeIcon className="h-4 w-4" /> View File
                            </Link>
                          </div>
                        </div>

                        <DeleteDocumentButton document={document} trip={trip} />
                        {/* {trip && <DeleteDocumentButton document={document} trip={trip} />} */}
                      </div>
                    );
                  })}

                  {values.documents.length === 0 && (
                    <p className="text-gray-400">No items to display.</p>
                  )}
                </div>
                <div className="">
                  <AddDocumentButton trip={trip} />
                </div>
              </div>
            )}

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
