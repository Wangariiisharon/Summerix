import { Button } from "@/components/Buttons";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";
import { FormModal } from "@/components/Modals/FormModal";
import { Field, Formik, Form } from "formik";
import { fbDb } from "@/firebase/configs";
import {
  getDocs,
  collection,
  DocumentData,
  Timestamp,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import { doUploadImage } from "@/lib/utils.service";
import * as Yup from "yup";
import Image from "next/image";

interface MaintenanceTableProps {
  selectedTab: number;
  maintananceList: DocumentData[];
  handleCheckboxClick: any;
  checkboxState: any;
  hasApprpveMaintenancePermission: any;
}
interface MaintenanceData {
  id: string;
  status: string;
  requested_by: string;
  vehicle: string;
  cost: number;
  job_cards: string;
  remarks: string;
  date: Timestamp;
  part: string;
  serial_number: string;
  approvalCount: number;
  approvedBy: string[];
  timestamp: Timestamp;
  broken_partImage?: string;
  broken_partImageName?: string;
}

const validationSchema = Yup.object({
  requested_by: Yup.string().required("Requested By is required"),
  cost: Yup.number().positive().required("Cost is required"),
  remarks: Yup.string().required("Remarks is required"),
  vehicle: Yup.string().required("Vehicle is required"),
  job_cards: Yup.string().required("Maintainace Type is required"),
  date: Yup.string().required("Date is required"),
  serial_number: Yup.string().required("Serial Number is required"),
  part: Yup.string().required("Part is required"),
  broken_partImage: Yup.mixed().required("Cargo Insurance is required"),
});

export default function MaintananceTable({
  selectedTab,
  maintananceList = [],
  hasApprpveMaintenancePermission,
}: MaintenanceTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [checkboxState, setCheckboxState] = useState<boolean[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<DocumentData | null>(null);
  const [vehicleNames, setVehicleNames] = useState<string[]>([]);
  const [jobcards, setJobcards] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [approvalCount, setApprovalCount] = useState(0);
  const [checked, setChecked] = useState(false);
  const { currentUser, organisationId } = useAuthContext();
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    requested_by: "",
    vehicle: "",
    cost: "",
    job_cards: "",
    remarks: "",
    date: "",
    part: "",
    status: "",
    serial_number: "",
    approvalCount: 0,
    broken_partImage: "",
    broken_partImageName: "", // Add this field
    approvedBy: [],
    timestamp: "",
  });

  const rowsPerPage = 6;
  const totalTrips = maintananceList.length;
  const totalPages = Math.ceil(totalTrips / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentDate = new Date();

  useEffect(() => {
    const fetchVehicleNames = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "vehicles"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);
          const names = querySnapshot.docs.map(
            (doc) => doc.data().lisence_plate
          );
          setVehicleNames(names);
        }
      } catch (error) {
        console.error("Error fetching Vehicle names:", error);
      }
    };

    const fetchJobCard = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "jobcard"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);
          const names = querySnapshot.docs.map((doc) => doc.data().name);
          setJobcards(names);
        }
      } catch (error) {
        console.error("Error fetching JobCard names:", error);
      }
    };

    const fetchDriver = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "drivers"),
            where("organisationId", "==", organisationId),
            where("archive", "==", false)
          );
          const querySnapshot = await getDocs(q);
          const names = querySnapshot.docs.map((doc) => doc.data().name);
          setDrivers(names);
        }
      } catch (error) {
        console.error("Error fetching Driver names:", error);
      }
    };

    fetchVehicleNames();
    fetchJobCard();
    fetchDriver();
  }, [organisationId]);

  if (!maintananceList || maintananceList.length === 0) {
    return <div>No maintenance data available.</div>;
  }

  const filteredApprovedMaintenance = maintananceList.filter(
    (maintenance) => (maintenance as MaintenanceData).status === "Approved"
  );

  const filteredMaintenance = filteredApprovedMaintenance.filter(
    (maintenance: any) => {
      const maintenanceDate = new Date(maintenance?.date?.seconds * 1000);

      if (selectedTab === 0) {
        return maintenanceDate > currentDate;
      } else if (selectedTab === 1) {
        return maintenanceDate < currentDate;
      }

      return true;
    }
  );

  const visibleClasses = filteredMaintenance.slice(startIndex, endIndex);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const pageNumbers = () => {
    let pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages = [0, 1, 2, 3, "...", totalPages - 1];
    }
    return pages;
  };

  const handleEditModalClose = () => {
    setSelectedMaintenance(null);
    setEditModalOpen(false);
  };

  function convertToDate(firestoreTimestamp: any) {
    if (firestoreTimestamp instanceof Timestamp) {
      return firestoreTimestamp.toDate();
    } else if (typeof firestoreTimestamp === "string") {
      return new Date(firestoreTimestamp);
    } else {
      return firestoreTimestamp; // Assuming it's already a Date object or null
    }
  }

  const convertDateToInputString = (date: string | number | Date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-"); // Format required for date input fields
  };

  const handleEditClick = (maintenance: DocumentData) => {
    setEditModalOpen(true);
    setChecked(false);
    setSelectedMaintenance(maintenance);
    const maintenanceDate =
      maintenance.date && maintenance.date.toDate()
        ? maintenance.date.toDate()
        : convertToDate(maintenance.date);
    setEditFormInitialValues({
      requested_by: maintenance.requested_by,
      vehicle: maintenance.vehicle,
      cost: maintenance.cost,
      job_cards: maintenance.job_cards,
      remarks: maintenance.remarks,
      date: convertDateToInputString(maintenanceDate),
      part: maintenance.part,
      status: maintenance.status,
      serial_number: maintenance.serial_number,
      approvalCount: maintenance.approvalCount,
      broken_partImage: maintenance.broken_partImage,
      broken_partImageName: maintenance.broken_partImageName || "",
      approvedBy: maintenance.approvedBy,
      timestamp: maintenance.timestamp,
    });
    console.log("Edit Form Initial Values:", editFormInitialValues);
  };

  const handleEditSubmit = async (values: {
    requested_by: any;
    vehicle: any;
    cost: any;
    job_cards: any;
    remarks: any;
    date: any;
    part: any;
    status: any;
    serial_number: any;
    approvalCount: number;
    broken_partImage: any;
    approvedBy: any[];
    timestamp: any;
  }) => {
    if (!selectedMaintenance) {
      console.error("No selected vehicle to update");
      return;
    }

    console.log("Edited Values(Planned):", values);
    console.log("selectedMaintenance", selectedMaintenance);

    try {
      const approvedBy = currentUser?.email;

      // Update the vehicle data in the database using the selectedVehicle.id
      const maintenanceRef = doc(fbDb, "maintenance", selectedMaintenance.id);
      console.log("maintenanceRef", maintenanceRef);

      const dateObj = new Date(values.date);
      const timestamp = Timestamp.fromDate(dateObj);

      const updatedData = {
        approvalCount: values.approvalCount + 1,
        requested_by: values.requested_by,
        vehicle: values.vehicle,
        date: timestamp, // Convert seconds to milliseconds
        cost: values.cost,
        job_cards: values.job_cards,
        remarks: values.remarks,
        serial_number: values.serial_number,
        part: values.part,
        status: values.status,
        approvedBy: Array.isArray(values.approvedBy)
          ? [...values.approvedBy, approvedBy].filter(Boolean)
          : [approvedBy],
        organisationId: organisationId,
        timestamp: values.timestamp,
        notificationNeedsDisplay: true,
        broken_partImage: values.broken_partImage
          ? await doUploadImage(values.broken_partImage, "broken_partImage")
          : selectedMaintenance.broken_partImage,
      };

      if (updatedData.approvalCount === 1) {
        updatedData.status = "Approved";
      } else {
        updatedData.status = "Pending";
      }
      console.log("Updated Data:", updatedData);

      await setDoc(maintenanceRef, updatedData, { merge: true });
      toast.success("Maintenance Edited Successfully");

      setSelectedMaintenance(null);
      setEditModalOpen(false);
      setChecked(true);
    } catch (error) {
      console.error("Error updating Maintenance:", error);
    }
  };

  const handleCheckboxClick = (index: number) => {
    const updatedCheckboxState = [...checkboxState];
    updatedCheckboxState[index] = !updatedCheckboxState[index];
    setCheckboxState(updatedCheckboxState);
  };

  const handleDropdownClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

  return (
    <>
      <div>
        <div className="ml-4 px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      ></th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        VEHICLE
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        DATE
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        JOB CARDS
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        REQUESTED BY
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        COST
                      </th>

                      <th
                        scope="col"
                        className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0"
                      >
                        <span className="sr-only"></span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-[#FAFAFB]">
                    {visibleClasses.map((maintenance: any, index: any) => {
                      const { seconds } = maintenance.date;
                      const updatedDate = new Date(seconds * 1000);

                      return (
                        <Fragment key={index}>
                          <div className="w-full mb-2 font-nunito font-regular"></div>
                          <tr
                            key={maintenance.id}
                            className="hover:bg-gray-100"
                          >
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              <span className="fa-stack fa-lg">
                                <i
                                  className="fa fa-circle fa-stack-2x text-[#F2F2F2]"
                                  aria-hidden="true"
                                ></i>
                                <i
                                  className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]"
                                  aria-hidden="true"
                                ></i>
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {maintenance.vehicle}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {format(updatedDate, "MM/dd/yy")}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {maintenance.job_cards}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {maintenance.requested_by}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {maintenance.cost}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[#777E96]">
                              <div>
                                {hasApprpveMaintenancePermission && (
                                  <button
                                    className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2"
                                    onClick={() => handleEditClick(maintenance)}
                                  >
                                    {maintenance.status}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => handlePageClick(0)}
              disabled={currentPage === 0}
            >
              {"<<"}
            </button>
            {pageNumbers().map((num, index) => {
              if (typeof num === "number") {
                return (
                  <button key={index} onClick={() => handlePageClick(num)}>
                    {num + 1}
                  </button>
                );
              } else {
                return <span key={index}>...</span>;
              }
            })}
            <button
              onClick={() => handlePageClick(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
            >
              {">>"}
            </button>
          </div>
        </div>

        {editModalOpen && selectedMaintenance && (
          <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
            <div className="p-8">
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">Edit Maintanance</div>
                <Button
                  className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                  handleClick={handleEditModalClose}
                >
                  <XMarkIcon className="h-6 w-6 text-red-400" />
                </Button>
              </div>
              <Formik
                validationSchema={validationSchema}
                initialValues={editFormInitialValues}
                onSubmit={(values) => handleEditSubmit(values)}
              >
                {({ values, setFieldValue, errors, touched }) => (
                  <Form>
                    <div className="">
                      <div className="flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">MAINTANANCE TYPE</label>
                          <Field
                            as="select"
                            name="job_cards"
                            value={values.job_cards}
                            className="form-input bg-grey w-96"
                            onClick={handleDropdownClick}
                          >
                            <option value="">Select Maintenance Type</option>
                            {jobcards.map((job_cards, index) => (
                              <option key={index} value={job_cards}>
                                {job_cards}
                              </option>
                            ))}
                          </Field>
                          {errors.job_cards && touched.job_cards ? (
                            <div className="text-red-600 text-sm">
                              {errors.job_cards}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <label className="block  mt-8">
                        <label className="form-label">VEHICLE</label>
                        <Field
                          as="select"
                          name="vehicle"
                          value={values.vehicle}
                          className="form-input bg-grey w-96"
                          onClick={handleDropdownClick}
                        >
                          <option value="">Select Vehicle</option>
                          {vehicleNames.map((vehicle, index) => (
                            <option key={index} value={vehicle}>
                              {vehicle}
                            </option>
                          ))}
                        </Field>
                        {errors.vehicle && touched.vehicle ? (
                          <div className="text-red-600 text-sm">
                            {errors.vehicle}
                          </div>
                        ) : null}
                      </label>
                      <div className="flex w-full justify-between  mt-8">
                        <label className="block">
                          <label className="form-label">REQUESTED BY</label>
                          <Field
                            as="select"
                            name="requested_by"
                            value={values.requested_by}
                            className="form-input bg-grey w-48"
                            onClick={handleDropdownClick}
                          >
                            <option value="">Select Driver</option>
                            {drivers.map((requested_by, index) => (
                              <option key={index} value={requested_by}>
                                {requested_by}
                              </option>
                            ))}
                          </Field>
                          {errors.requested_by && touched.requested_by ? (
                            <div className="text-red-600 text-sm">
                              {errors.requested_by}
                            </div>
                          ) : null}
                        </label>
                        <label className="block">
                          <label className="form-label">DATE</label>
                          <Field
                            type="date"
                            name="date"
                            value={values.date}
                            className="form-input bg-grey w-48"
                          />
                          {errors.date && touched.date ? (
                            <div className="text-red-600 text-sm">
                              {errors.date}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between  mt-8">
                        <label className="block">
                          <label className="form-label">COST</label>
                          <Field
                            type="number"
                            name="cost"
                            placeholder="Ksh"
                            value={values.cost}
                            className="form-input bg-grey w-48"
                          />
                          {errors.cost && touched.cost ? (
                            <div className="text-red-600 text-sm">
                              {errors.cost}
                            </div>
                          ) : null}
                        </label>
                        <label className="block">
                          <label className="form-label">PART</label>
                          <Field
                            type="text"
                            name="part"
                            value={values.part}
                            className="form-input bg-grey w-48"
                          />
                          {errors.part && touched.part ? (
                            <div className="text-red-600 text-sm">
                              {errors.part}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between  mt-8">
                        <label className="block">
                          <label className="form-label">SERIAL NUMBER</label>
                          <Field
                            type="text"
                            name="serial_number"
                            value={values.serial_number}
                            className="form-input bg-grey w-48"
                          />
                          {errors.serial_number && touched.serial_number ? (
                            <div className="text-red-600 text-sm">
                              {errors.serial_number}
                            </div>
                          ) : null}
                        </label>

                        <label className="block ml-14">
                          <label className="form-label">BROKEN PART</label>
                          <div className="">
                            <Field name="broken_partImage">
                              {({ field, form }: any) => (
                                <input
                                  type="file"
                                  onChange={(event) => {
                                    const file =
                                      event.currentTarget?.files?.[0];
                                    if (file) {
                                      form.setFieldValue(
                                        "broken_partImage",
                                        file
                                      );
                                    }
                                  }}
                                />
                              )}
                            </Field>
                            {values.broken_partImage &&
                            typeof values.broken_partImage === "string" ? (
                              <div className="mt-5">
                                <a
                                  href={values.broken_partImage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  View Broken Part
                                </a>
                              </div>
                            ) : null}
                          </div>
                          {errors.broken_partImage &&
                          touched.broken_partImage ? (
                            <div className="text-red-600 text-sm">
                              {errors.broken_partImage}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <label className="block mt-8">
                        <label className="form-label">REMARKS</label>
                        <Field
                          type="text"
                          name="remarks"
                          value={values.remarks}
                          className="form-input bg-grey w-96 h-20"
                        />
                      </label>

                      <label className="block mt-8">
                        <label className="form-label">APPROVE</label>
                        <Field
                          type="checkbox"
                          name="approvalCheckbox"
                          disabled
                          checked={checkboxState[selectedMaintenance.id]}
                          onChange={(event: any) => {
                            const checked = event.currentTarget.checked;
                            setApprovalCount(
                              checked ? approvalCount + 1 : approvalCount - 1
                            );
                          }}
                          className="form-checkbox bg-gray-200"
                        />
                        {errors.remarks && touched.remarks ? (
                          <div className="text-red-600 text-sm">
                            {errors.remarks}
                          </div>
                        ) : null}
                      </label>

                      <div className="flex w-full justify-end mt-24 ">
                        <button
                          className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32"
                          onClick={handleEditModalClose}
                        >
                          Reset
                        </button>
                        <button
                          className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4"
                          type="submit"
                        >
                          Submit(Planned)
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </FormModal>
        )}
      </div>
    </>
  );
}
