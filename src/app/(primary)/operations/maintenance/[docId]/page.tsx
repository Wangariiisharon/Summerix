'use client';
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
import { Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import Maintenances from '@/json/maintenance.json';
import { MAINTENANCE } from '@/models/maintenance';
import MaintenanceVehicle from './vehicle';
import MaintenanceSuppliers from './suppliers';
import moment from 'moment';
import MaintenanceJobcard from './jobcard';
import { MaintenanceFormSchema } from '@/app/schemas/maintenance-form-schema';

//

type Props = {
  params: { docId: string };
};

export default function Maintenance({ params }: Props) {
  const [maintenance, setMaintenance] = useState<MAINTENANCE>();
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();
  const router = useRouter();
  const { docId } = params;

  useEffect(() => {
    if (docId && docId !== 'new') {
      const docRef = doc(fbDb, Constants.fbMaintenance, docId);
      const unsubscribe = onSnapshot(
        docRef,
        async (snapshot) => {
          const data = snapshot.data() as MAINTENANCE;
          data.docId = snapshot.id;
          setMaintenance(data);
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
      console.log('authUser:', authUser);

      toast.error('You are not authorised to manage maintenance.');
      return;
    }

    try {
      if (formValues.schedule) {
        formValues.schedule.startAt = moment(formValues.schedule.startAt).toDate();
        formValues.schedule.endAt = moment(formValues.schedule.endAt).toDate();
      }

      if (docId === 'new') {
        const colRef = collection(fbDb, Constants.fbMaintenance);
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
        toast.success('New maintenance added successfully.');
      } else {
        const docRef = doc(fbDb, Constants.fbMaintenance, docId);
        await updateDoc(docRef, {
          ...formValues,
          lastUpdated: serverTimestamp(),
        });
        toast.success('Maintenance updated successfully.');
      }

      router.push('/operations/maintenance');
    } catch (error) {
      console.error('save maintenance error:', error);
    }
  };

  if (!company) return <></>;

  return (
    <main className="-mx-4 rounded bg-white p-4">
      <h2 className="font-bold">Maintenance</h2>
      <Formik
        enableReinitialize={true}
        initialValues={{
          status: maintenance?.status || 'pending',
          company: maintenance?.company || {
            docId: company.docId,
            name: company.name || '',
            email: company.email || '',
            phoneNumber: company.phoneNumber || '',
            regNumber: company.regNumber || '',
          },
          vehicle: maintenance?.vehicle || null,
          supplier: maintenance?.supplier || null,
          notes: maintenance?.notes || '',
          jobCard: maintenance?.jobCard || null,
          schedule: maintenance?.schedule
            ? {
                startAt: maintenance.schedule.startAt
                  ? moment(maintenance.schedule.startAt.toDate()).format(Constants.dateInputFormat)
                  : '',
                endAt: maintenance.schedule.endAt
                  ? moment(maintenance.schedule.endAt.toDate()).format(Constants.dateInputFormat)
                  : '',
              }
            : {
                startAt: '',
                endAt: '',
              },
          isApproved: maintenance?.isApproved || false,
          cost: maintenance?.cost || 0,
          updatedBy: {
            authId: authUser?.uid,
            email: authUser?.email,
          },
        }}
        validationSchema={MaintenanceFormSchema}
        onSubmit={(values) => doSave(values)}
      >
        {({ isValid, setFieldValue }) => (
          <Form className="mt-6">
            <div className="mt-5 grid gap-5 p-4">
              <hr className="my-3" />

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Vehicle</label>
                </div>
                <MaintenanceVehicle
                  companyId={authUser?.companyId || 'xyz'}
                  setFieldValue={setFieldValue}
                  maintenance={maintenance}
                />
              </label>
              {/* <ErrorMessage name="vehicle" component="span" className="form-error" /> */}

              <hr className="my-3" />

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Suppliers</label>
                </div>
                <MaintenanceSuppliers
                  companyId={authUser?.companyId || 'xyz'}
                  setFieldValue={setFieldValue}
                  maintenance={maintenance}
                />
                {/* <ErrorMessage name="suppliers" component="span" className="form-error" /> */}
              </label>
              <hr className="my-3" />
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Jobcard</label>
                </div>
                <MaintenanceJobcard setFieldValue={setFieldValue} maintenance={maintenance} />
              </label>
              {/* <ErrorMessage name="jobCard" component="span" className="form-error" /> */}

              <hr className="my-3" />
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Start Time</label>
                </div>
                <div className="block">
                  <Field type="datetime-local" name="schedule.startAt" className="form-input" />
                  {/* <ErrorMessage name="schedule.startAt" component="span" className="form-error" /> */}
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">End Time</label>
                </div>
                <div className="block">
                  <Field type="datetime-local" name="schedule.endAt" className="form-input" />
                  {/* <ErrorMessage name="schedule.endAt" component="span" className="form-error" /> */}
                </div>
              </label>

              <hr className="my-3" />
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Cost</label>
                </div>
                <div className="">
                  <Field type="number" name="cost" className="form-input" placeholder="" />
                </div>
              </label>
              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium">Notes</label>
                </div>
                <div className="">
                  <Field type="text" name="notes" className="form-input" placeholder="Optional" />
                </div>
              </label>
            </div>

            <hr className="my-3" />

            <div className="grid gap-5">
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
                    {Maintenances.statusList.map(({ name, value }) => {
                      return (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      );
                    })}
                  </Field>
                  {/* <ErrorMessage name="yom" component="span" className="form-error" /> */}
                </div>
              </label>

              <label className="grid-1-3">
                <div className="text-sm">
                  <label className="font-medium"></label>
                </div>
                <label className="flex items-center gap-5">
                  <Field type="checkbox" name="isApproved" className="form-checkbox" />
                  <span className="form-label">Is Approved</span>
                </label>
              </label>
            </div>

            <div className="grid-1-3 mt-10 gap-5">
              <p className=""></p>
              <div className="flex justify-end gap-5">
                <Link href="/operations/maintenance" className="btn btn-outline">
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
