import { fbDb } from "@/firebase/configs";
import {
  DocumentData,
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, { Fragment, SetStateAction, useEffect, useState } from "react";
import { parseISO, format } from "date-fns";
import { AddButton, Button, DeleteBtn, EditBtn } from "@/components/Buttons";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import { toast } from "react-hot-toast";
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

export default function Jobcard() {
  const [open, setOpen] = useState(false);
  const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
  const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] =
    useState(false);
  const [fetchedJobcards, setfetchedJobcards] = useState<DocumentData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<DocumentData | null>(
    null
  );
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    name: "",
    organisationId: "",
    archive: false,
  });
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
  } = useAuthContext();
  const handleReset = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchedJobcards = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(db, "jobcard"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const jobcardData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedJobcards(jobcardData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Jobcards:", error);
      }
    };
    fetchedJobcards();
  }, [organisationId]);
  const handleEditClick = (jobcard: DocumentData) => {
    setSelectedJobCard(jobcard);
    setEditFormInitialValues({
      name: jobcard.name,
      organisationId: jobcard.organisationId,
      archive: jobcard.archive,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedJobCard(null);
    setEditModalOpen(false);
  };
  const handleEditSubmit = async (values: {
    name: any;
    organisationId: any;
    archive: any;
  }) => {
    if (!selectedJobCard) {
      console.error("No selected vehicle to update");
      return;
    }

    console.log("Edited Values:", values);

    try {
      if (!values.name) {
        console.error("Required form fields are missing");
        toast.error("please fill the Name field");
        return;
      }
      // Update the vehicle data in the database using the selectedVehicle.id
      const vehicleRef = doc(fbDb, "jobcard", selectedJobCard.id);
      await setDoc(vehicleRef, {
        name: values.name,
        organisationId: values.organisationId,
        archive: values.archive,
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedJobcards.map((jobcard) =>
        jobcard.id === selectedJobCard.id
          ? {
              ...jobcard,
              name: values.name,
              organisationId: values.organisationId,
              archive: values.archive,
            }
          : jobcard
      );

      setfetchedJobcards(updatedVehicles);

      setSelectedJobCard(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Jobcard:", error);
    }
  };

  const updateJobcardStatus = async (classId: string, newStatus: boolean) => {
    try {
      // Update the vehicle status in the database
      const vehicleRef = doc(fbDb, "jobcard", classId);
      await setDoc(vehicleRef, { archive: newStatus }, { merge: true });
      toast.success("Job card status updated");

      // Update the local state with the new status
      const updatedVehicles = fetchedJobcards.map((jobcard) =>
        jobcard.id === classId ? { ...jobcard, archive: newStatus } : jobcard
      );
      setfetchedJobcards(updatedVehicles); // Ensure the state update function is correctly named
    } catch (error) {
      console.error("Error updating vehicle status in database:", error);
    }
  };

  const handleJobCardReset = () => {
    setShowAddJobcardModal(false);
    setOpen(false);
  };

  const handleAddJobcard = async (values: { name: any }) => {
    setShowAddJobcardModal(true);
    setShowScheduleMaintenanceModal(false);
    setOpen(true);
    console.log("Submitted Values:", values);

    try {
      if (!values) {
        console.error("Form values are undefined");
        return;
      }

      if (!values.name) {
        console.error("Required form fields are missing");
        return;
      }

      const jobcardCollection = collection(fbDb, "jobcard");
      const existingDepartmentQuery = query(
        collection(fbDb, "jobcard"),
        where("name", "==", values.name),
        where("organisationId", "==", organisationId)
      );

      const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);

      if (!existingDepartmentSnapshot.empty) {
        console.error(
          "Jobcard with this name already exists in the same organisation"
        );
        toast.error(
          `A Jobcard with the  name  '${values.name}' already exists`
        );
        return;
      }

      const JobcardData = {
        name: values.name,
        status: true,
        archive: false,
        organisationId: organisationId,
      };

      const docRef = await addDoc(jobcardCollection, JobcardData);
      toast.success("Jobcard Successfully Added.");

      const newJobcard = {
        id: docRef.id,
        ...JobcardData,
      };

      // Prepend the new driver to the fetchedDrivers state
      setfetchedJobcards((prevJobcards) => [newJobcard, ...prevJobcards]);

      setOpen(false);
      setShowAddJobcardModal(false);
    } catch (error) {
      console.error("Error adding jobcard:", error);
    }
  };

  const visibleJobCards = fetchedJobcards.slice(startIndex, endIndex);

  return (
    <div className="mt-2 h-full">
      <div className=" flex justify-end">
        <Button
          className="rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4  mt-2"
          handleClick={handleAddJobcard}
        >
          <PlusIcon className="h-6 w-6 mr-2" />
          ADD JOB CARD
        </Button>
      </div>
      <div className="mt-2 ml-2 flow-root">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Truck
                      </th>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        NAME
                      </th>

                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        <span className="sr-only"></span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-[#FAFAFB]">
                    {visibleJobCards.map((jobcard: any, index: any) => {
                      return (
                        <Fragment key={index}>
                          <tr key={jobcard.id} className="my-4 bg-[#FAFAFB]">
                            <td className="whitespace-nowrap font-nunito font-regular pr-3 pt-1 pl-4 pr-3  text-d-blue text-base sm:pl-0">
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
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {jobcard.name}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 relative flex flex-row">
                              <div onClick={() => handleEditClick(jobcard)}>
                                <EditBtn />
                              </div>
                              <div>
                                <button
                                  className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2 ml-4"
                                  onClick={() =>
                                    updateJobcardStatus(
                                      jobcard.id,
                                      !jobcard.archive
                                    )
                                  }
                                >
                                  {jobcard.archive ? "Unarchive" : "Archive"}
                                </button>
                              </div>
                              <div className="h-10"></div>
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
        </div>
      </div>

      {showAddJobcardModal && (
        <FormModal open={showAddJobcardModal} setOpen={setShowAddJobcardModal}>
          <div className="p-8">
            <div className="flex w-full h-full justify-between items-center mb-12">
              <div className="text-xl font-semibold ">ADD JOBCARD</div>
              <Button
                className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                handleClick={handleJobCardReset}
              >
                <XMarkIcon className="h-6 w-6 text-red-400" />
              </Button>
            </div>

            <Formik
              initialValues={{
                name: "",
              }}
              validationSchema={validationSchema}
              onSubmit={(values) => handleAddJobcard(values)}

              // onSubmit={(values) => handleEditSubmit(values)}
            >
              {({ values, errors, touched }) => (
                <Form>
                  <div className="">
                    <div className="flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">NAME</label>
                        <Field
                          type="text"
                          name="name"
                          value={values.name}
                          className="form-input bg-grey w-48"
                        />
                        {errors.name && touched.name ? (
                          <div className="text-red-600">{errors.name}</div>
                        ) : null}
                      </label>
                    </div>

                    <div className="flex w-full justify-end mt-24 ">
                      <Button
                        className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center py-4 px-4 mr-32"
                        handleClick={handleJobCardReset}
                      >
                        Reset
                      </Button>
                      <button
                        className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center py-4 px-4"
                        type="submit"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </FormModal>
      )}

      {editModalOpen && selectedJobCard && (
        <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
          <div>
            <div className="flex w-full h-full justify-between items-center mb-12">
              <div className="text-xl font-semibold ">Edit Class Details</div>
              <Button
                className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                handleClick={handleEditModalClose}
              >
                <XMarkIcon className="h-6 w-6 text-red-400" />
              </Button>
            </div>

            <Formik
              initialValues={editFormInitialValues}
              validationSchema={validationSchema}
              onSubmit={handleEditSubmit}
            >
              {({ values, errors, touched }) => (
                <Form>
                  <div className="">
                    <div className="flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">NAME</label>
                        <Field
                          type="text"
                          name="name"
                          value={values.name}
                          className="form-input bg-grey w-48"
                        />
                        {errors.name && touched.name ? (
                          <div className="text-red-600">{errors.name}</div>
                        ) : null}
                      </label>
                    </div>

                    <div className="flex w-full justify-end mt-24 ">
                      <Button
                        className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32"
                        handleClick={handleReset}
                      >
                        Reset
                      </Button>
                      <button
                        className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4"
                        type="submit"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </FormModal>
      )}

      <div
        className="flex flex-row justify-center my-4 ui-selected:border-b-4  outline-none
          text-sm font-nunito font-bold uppercase bg-[#FAFAFB]"
      >
        <button
          className="ml-5"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Prev
        </button>
        <span className="ml-5">{currentPage + 1}</span>
        <button
          className="ml-5"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={endIndex >= fetchedJobcards.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}
