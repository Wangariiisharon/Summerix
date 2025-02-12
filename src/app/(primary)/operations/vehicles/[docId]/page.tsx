'use client';

import * as Yup from 'yup';
import { useAuthContext } from '@/app/auth-provider';
import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { VEHICLE } from '@/models/vehicle';
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
import { getVehicleByRegNumber } from '@/services/vehicle';
import Vehicles from '@/json/vehicles.json';
import { getVehiclePhoto } from '@/services/utils';
import DriverAllocation from './driver';
import Image from 'next/image';
import VehicleClass from './class';

const VehicleSchema = (companyId: string, docId: string) => {
  return Yup.object().shape({
    regNumber: Yup.string()
      .trim()
      .required('Reg. number is required.')
      .test({
        exclusive: true,
        name: 'vehicle-regNumber',
        message: 'Reg. number is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getVehicleByRegNumber(companyId, value);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return doc.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    make: Yup.string().required('Make is required.'),
    model: Yup.string().required('Model is required.'),
    yom: Yup.string().required('Year is required.'),
  });
};

type Props = {
  params: { docId: string };
};

export default function Vehicle({ params }: Props) {
  const [vehicle, setVehicle] = useState<VEHICLE>();
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();
  const router = useRouter();
  const { docId } = params;

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbVehicles, docId);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          const data = snapshot.data() as VEHICLE;
          data.photoURL = data.photoURL || getVehiclePhoto(data.regNumber);

          console.log('data:photoURL', data.photoURL);

          data.docId = snapshot.id;
          setVehicle(data);
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
      toast.error('You are not authorised to manage vehicles.');
      return;
    }

    try {
      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbVehicles);
        await addDoc(colRef, {
          ...formValues,
          regNumber: formValues.regNumber.trim(),
          createdBy: {
            authId: authUser.uid,
            email: authUser.email,
          },
          dateCreated: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
        toast.success('New vehicle added successfully.');
      } else {
        const docRef = doc(fbDb, Constants.fbVehicles, docId);
        await updateDoc(docRef, {
          ...formValues,
          lastUpdated: serverTimestamp(),
        });
        toast.success('Vehicle updated successfully.');
      }

      router.push('/operations/vehicles');
    } catch (error) {
      console.error('save vehicle error:', error);
    }
  };

  if (!company) return <></>;

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <h2 className="font-bold">Vehicle</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          regNumber: vehicle?.regNumber || '',
          make: vehicle?.make || '',
          model: vehicle?.model || '',
          yom: vehicle?.yom || '',
          status: vehicle?.status || '',
          company: vehicle?.company || {
            docId: company.docId,
            name: company.name || '',
            email: company.email || '',
            phoneNumber: company.phoneNumber || '',
            regNumber: company.regNumber || '',
          },
          class: vehicle?.class || null,
          driver: vehicle?.driver || null,
          updatedBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
        }}
        validationSchema={VehicleSchema(authUser?.companyId || 'xyz', docId)}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid, setFieldValue }) => (
          <Form className="mt-6">
            {/* <h2 className="text-center font-bold">Account setup</h2> */}

            <div className="mt-5 grid gap-5 p-4">
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Reg. Number</label>
                </div>
                <div className="">
                  <Field
                    type="text"
                    name="regNumber"
                    className="form-input"
                    placeholder="Reg. Number"
                  />
                  <ErrorMessage name="regNumber" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Make</label>
                </div>
                <div className="">
                  <Field type="text" name="make" className="form-input" placeholder="Make" />
                  <ErrorMessage name="make" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Model</label>
                </div>
                <div className="">
                  <Field type="text" name="model" className="form-input" placeholder="Model" />
                  <ErrorMessage name="model" component="span" className="form-error" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Year</label>
                </div>
                <div className="">
                  <Field type="number" name="yom" className="form-input" placeholder="Y.O.M" />
                  <ErrorMessage name="yom" component="span" className="form-error" />
                </div>
              </label>

              <hr className="my-3" />

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Class</label>
                </div>
                <VehicleClass
                  companyId={authUser?.companyId || 'xyz'}
                  setFieldValue={setFieldValue}
                  vehicle={vehicle}
                />
              </label>

              {vehicle && (
                <>
                  <div className="grid-1-3">
                    <div className="text-sm">
                      <label className="font-medium">Driver Allocation</label>
                    </div>
                    <div className="grid-1-2 col-span-2 gap-3">
                      {vehicle.driver && (
                        <div className="flex items-center gap-3 rounded border p-2">
                          <Image
                            src={vehicle.driver.photoURL}
                            alt={vehicle.driver.displayName}
                            className="size-20 shrink-0 rounded-full"
                            width={100}
                            height={100}
                          />
                          <div className="grid gap-0.5">
                            <p className="">{vehicle.driver.displayName}</p>
                            <div className="form-label">
                              <p>{vehicle.driver.email}</p>
                              <p>{vehicle.driver.phoneNumber}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <DriverAllocation vehicle={vehicle} />
                    </div>
                  </div>
                </>
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
                    className="form-select w-fit"
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {Vehicles.statusList.map(({ name, value }) => {
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

            <hr className="my-3" />

            <div className="grid-1-3 mt-10 gap-5">
              <p className=""></p>
              <div className="flex justify-end gap-5">
                <Link href="/operations/vehicles" className="btn btn-outline">
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
