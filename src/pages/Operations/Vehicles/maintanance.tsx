import { Header, HeaderBar } from "@/components/Headers";
import { AddButton, Button, DeleteBtn, EditBtn } from "@/components/Buttons";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { headers } from "next/headers";
import { DummyTable } from "@/components/Table/Table";
import { FormEvent, Fragment, ReactNode, useEffect, useState } from "react";
import { FormModal } from "@/components/Modals/FormModal";
import { Field, Formik, Form } from "formik";
import { Input, Submit } from "@/components/Forms/input";
import SiteLayout from "@/Layout/SiteLayout";
import { Tab } from "@headlessui/react";
import Planned from "../../Administration/Users/jobcard";
import firebaseApp, { fbDb } from "@/firebase/configs";
import {
  getDocs,
  collection,
  DocumentData,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  query,
  where,
  getFirestore,
  onSnapshot,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { parseISO, format } from "date-fns";
import Jobcard from "../../Administration/Users/jobcard";
import { serverTimestamp } from "firebase/firestore";
import { AnyCnameRecord } from "dns";
import {
  FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import ImageInput from "@/components/ImageInputs";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import Pending from "./pending";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
interface UserData {
  email: string;
  super_admin: boolean;
}
interface AuthContextData {
  organisationId: string;
  userData: UserData;
}

export default function Maintenance() {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [fetchedMaintanance, setFetchedMaintanance] = useState<DocumentData[]>(
    []
  );
  const [vehicleNames, setVehicleNames] = useState<string[]>([]);
  const [jobcards, setjobcards] = useState<string[]>([]);
  const [drivers, setdrivers] = useState<string[]>([]);
  const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
  const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] =
    useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [approvalCount, setApprovalCount] = useState(0);
  const [checkboxState, setCheckboxState] = useState<boolean[]>([]);
  const [checkedIndexes, setCheckedIndexes] = useState<number[]>([]);

  // const { isAuthenticated, userId, organisationId, userData } =
  //   useAuthContext();
  const { currentUser, organisationId, isSuperAdmin, userData } =
    useAuthContext();

  console.log("Maintanance Page OrganisationId: ", organisationId);
  console.log("Maintanance Page UserData: ", userData);

  const approvedBy = userData?.email;

  console.log("Maintanance Super Admin: ", isSuperAdmin);

  const MaintainanceTabs = [
    { name: "PLANNED", href: "#", current: selectedTabIndex === 0 },
    { name: "HISTORY", href: "#", current: selectedTabIndex === 1 },
    isSuperAdmin
      ? { name: "PENDING", href: "#", current: selectedTabIndex === 2 }
      : null,
  ].filter(Boolean);

  const handleMaintenanceReset = () => {
    setShowScheduleMaintenanceModal(false);
    setOpen(false);
  };
  const handleDropdownClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

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
        } else {
          // Handle the case when organisationId is not available
          console.error(
            "Organisation ID is not available for fetching Vehicle names."
          );
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
          setjobcards(names);
        } else {
          console.error(
            "Organisation ID is not available for fetching JobCard names."
          );
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
            where("archive", "==", false) // Only fetch drivers where archive is false
          );
          const querySnapshot = await getDocs(q);
          const names = querySnapshot.docs.map((doc) => doc.data().name);
          setdrivers(names);
        } else {
          // Handle the case when organisationId is not available
          console.error(
            "Organisation ID is not available for fetching Driver names."
          );
        }
      } catch (error) {
        console.error("Error fetching Driver names:", error);
      }
    };

    const fetchedMaintenance = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(db, "maintenance"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const maintenanceData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setFetchedMaintanance(maintenanceData);
          });

          return () => unsubscribe();
        } else {
          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching Maintanance:", error);
      }
    };

    fetchVehicleNames();
    fetchDriver();
    fetchJobCard();
    fetchedMaintenance();
  }, [organisationId]);

  const sanitizeEmailForFirestore = (email: string) => {
    // Use Base64 encoding to handle special characters
    const encodedEmail = btoa(email);

    // Use the encoded email with a fixed string in the Firestore collection reference
    return `user_${encodedEmail}`;
  };

  const handleScheduleMaintanace = async (values: {
    requested_by: any;
    cost: any;
    remarks: any;
    vehicle: any;
    job_cards: any;
    date: any;
    serial_number: any;
    part: any;
    broken_partImage: any;
  }) => {
    setShowScheduleMaintenanceModal(true);
    setShowAddJobcardModal(false);
    setOpen(true);

    console.log("Submitted Values:", values);

    try {
      if (!values) {
        console.error("Form values are undefined");
        return;
      }

      if (!values) {
        console.error("Form values are undefined");
        return;
      }
      if (!values.requested_by) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Requested by`);
        return;
      }
      if (!values.vehicle) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Vehicle`);
        return;
      }
      if (!values.cost) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Cost`);
        return;
      }
      if (!values.job_cards) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Maintance type`);
        return;
      }
      if (!values.remarks) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Remarks`);
        return;
      }
      if (!values.date) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Date`);
        return;
      }
      if (!values.broken_partImage) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Broken part image`);
        return;
      }
      if (!values.serial_number) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Serial number`);
        return;
      }
      if (!values.part) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field  Part`);
        return;
      }

      const dateObj = new Date(values.date + "T00:00:00");
      const timestamp = Timestamp.fromDate(dateObj);

      let brokenPartImageUrl = "";
      if (values.broken_partImage) {
        const storage = getStorage(firebaseApp);
        const storageRef = ref(
          storage,
          `broken_partImage/${values.broken_partImage.name}`
        );

        await uploadBytes(storageRef, values.broken_partImage);
        brokenPartImageUrl = await getDownloadURL(storageRef);
        console.log("Broken Part Image URL:", brokenPartImageUrl);
      }

      const maintenanceData = {
        approvalCount: 0,
        requested_by: values.requested_by,
        vehicle: values.vehicle,
        date: timestamp,
        cost: values.cost,
        job_cards: values.job_cards,
        remarks: values.remarks,
        serial_number: values.serial_number,
        part: values.part,
        status: "Pending",
        broken_partImage: brokenPartImageUrl,
        organisationId: organisationId,
        notificationNeedsDisplay: true,
        isNotificationViewed: false,
        userId: userData?.userId,
      };

      const docRef = await addDoc(
        collection(fbDb, "maintenance"),
        maintenanceData
      );
      console.log("Maintenance added with ID: ", docRef.id);
      toast.success("Maintenance Request Successfully Added.");

      const superAdminQuerySnapshot = await getDocs(
        query(
          collection(fbDb, "admins"),
          where("super_admin", "==", true),
          where("organisationId", "==", organisationId)
        )
      );
      const superAdmins = superAdminQuerySnapshot.docs.map(
        (doc) => doc.data().email
      );
      const superAdminEmail = userData?.email;
      const superAdminId = userData?.userId;
      const notificationData = {
        title: "New Maintenance Request",
        message: `New maintenance request added by ${values.requested_by}.`,
        organisationId: organisationId,
        timestamp: Timestamp.now(),
        maintenanceId: docRef.id,
        readBy: [], // This will be unused in the new approach but kept for compatibility
        userId: userData?.userId,
      };

      // Send a notification to each super admin
      superAdminQuerySnapshot.docs.forEach(async (doc) => {
        const superAdminId = doc.id; // Correctly represents each super admin's user ID
        await addDoc(
          collection(fbDb, `user_notifications/${superAdminId}/notifications`), // Use adminId here
          notificationData
        );
      });
      const newMaintenance = {
        id: docRef.id,
        ...notificationData,
      };
      // Prepend the new driver to the fetchedDrivers state
      setFetchedMaintanance((prevMaintenance) => [
        newMaintenance,
        ...prevMaintenance,
      ]);

      setOpen(false);
    } catch (error) {
      console.error("Error adding Notification:", error);
    }
    setShowScheduleMaintenanceModal(false);
  };

  const handleCheckboxClick = async (index: number) => {
    const documentId = fetchedMaintanance[index].id;
    const maintenanceDocRef = doc(fbDb, "maintenance", documentId);

    try {
      if (checkedIndexes.includes(index)) {
        console.log("Checkbox already checked.");
        toast.error("Checkbox already checked.");
        return;
      }
      setCheckedIndexes([...checkedIndexes, index]);

      // Get the current approvalCount and approvedBy array from Firestore
      const docSnapshot = await getDoc(maintenanceDocRef);

      if (docSnapshot && docSnapshot.exists()) {
        const currentApprovalCount = docSnapshot.data()?.approvalCount || 0;
        const approvedByArray = docSnapshot.data()?.approvedBy || [];

        // Check if the user has already approved
        if (!approvedByArray.includes(userData?.email)) {
          // Update the approvalCount and add the user email to approvedBy array in Firestore
          await updateDoc(maintenanceDocRef, {
            approvalCount: currentApprovalCount + 1,
            approvedBy: [...approvedByArray, userData?.email],
          });

          // Check if the approval count reaches 3
          if (currentApprovalCount + 1 === 3) {
            // Perform the logic to update the status to "Approved"
            await updateStatusToApproved(documentId);
          }
        } else {
          console.log("User has already approved.");
        }
      } else {
        console.error("Document not found or does not exist.");
      }
    } catch (error) {
      console.error("Error updating approval count:", error);
    }
  };

  const updateStatusToApproved = async (documentId: string) => {
    try {
      const maintenanceDocRef = doc(fbDb, "maintenance", documentId);
      const docSnapshot = await getDoc(maintenanceDocRef);

      if (docSnapshot && docSnapshot.exists()) {
        const currentApprovalCount = docSnapshot.data()?.approvalCount || 0;

        if (currentApprovalCount === 3) {
          // Update the status to "Approved" in Firestore
          await updateDoc(maintenanceDocRef, {
            status: "Approved",
            approvedBy: approvedBy,
          });
        }
      } else {
        console.error("Document not found or does not exist.");
      }
    } catch (error) {
      console.error("Error updating status to Approved:", error);
    }
  };

  return (
    <>
      {/* <div className=''> */}
      {/* <div className="flex flex-row justify-end absolute mb-2 right-10">  
                <div className=""> 
                <Button
                className='rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2'
                handleClick={handleScheduleMaintanace}>
               <PlusIcon className='h-6 w-6 mr-2' />
                 Schedule Maintenance
              </Button>
                </div>
                </div> */}
      <div className="absolute top-12 flex justify-end right-10 ">
        <Button
          className="rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2"
          handleClick={handleScheduleMaintanace}
        >
          <PlusIcon className="h-6 w-6 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      <div className="mt-4">
        <Tab.Group>
          <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3 ml-4">
            {MaintainanceTabs.filter(Boolean).map((tab, index) => (
              <Fragment key={index}>
                <Tab
                  className={classNames(
                    "border-d-green outline-none text-sm font-nunito font-bold uppercase flex flex-row ml-10",
                    tab?.current
                      ? "ui-selected border-b-4 ui-selected:text-d-green"
                      : ""
                  )}
                  onClick={() => setSelectedTabIndex(index)}
                >
                  {tab?.name}
                </Tab>
              </Fragment>
            ))}
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel
              className={classNames(
                selectedTabIndex === 0 ? "ui-selected border-b-4" : "",
                "h-full"
              )}
            >
              <MaintananceTable
                selectedTab={selectedTabIndex}
                maintananceList={fetchedMaintanance}
                isSuperAdmin={isSuperAdmin}
                handleCheckboxClick={handleCheckboxClick}
                checkboxState={checkboxState}
              />
            </Tab.Panel>
            <Tab.Panel
              className={classNames(
                selectedTabIndex === 0 ? "ui-selected border-b-4" : "",
                "h-full"
              )}
            >
              <MaintananceTable
                selectedTab={selectedTabIndex}
                maintananceList={fetchedMaintanance}
                isSuperAdmin={isSuperAdmin}
                handleCheckboxClick={handleCheckboxClick}
                checkboxState={checkboxState}
              />
            </Tab.Panel>
            <Tab.Panel>
              <div className="">
                <Pending />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      <div></div>

      <FormModal
        open={showScheduleMaintenanceModal}
        setOpen={setShowScheduleMaintenanceModal}
      >
        <div className="p-8">
          <div className="flex w-full h-full justify-between items-center mb-12">
            <div className="text-xl font-semibold ">Schedule Maintanance</div>
            <Button
              className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
              handleClick={handleMaintenanceReset}
            >
              <XMarkIcon className="h-6 w-6 text-red-400" />
            </Button>
          </div>
          <Formik
            initialValues={{
              requested_by: "",
              vehicle: "",
              cost: "",
              job_cards: "",
              remarks: "",
              date: "",
              part: "",
              serial_number: "",
              broken_partImage: null,
            }}
            onSubmit={(values) => handleScheduleMaintanace(values)}
          >
            {({ values, setFieldValue }) => (
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
                    </label>
                    <label className="block">
                      <label className="form-label">DATE</label>
                      <Field
                        type="date"
                        name="date"
                        value={values.date}
                        className="form-input bg-grey w-48"
                      />
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
                    </label>
                    <label className="block">
                      <label className="form-label">PART</label>
                      <Field
                        type="text"
                        name="part"
                        value={values.part}
                        className="form-input bg-grey w-48"
                      />
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
                    </label>

                    <label className="block ml-24">
                      <label className="form-label">BROKEN PART</label>
                      <Field name="broken_partImage">
                        {({ field, form }: any) => (
                          <input
                            type="file"
                            onChange={(event) => {
                              const file = event.currentTarget?.files?.[0];
                              if (file) {
                                form.setFieldValue("broken_partImage", file);
                              }
                            }}
                          />
                        )}
                      </Field>
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
                  <div className="flex w-full justify-end mt-24 ">
                    <button
                      className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32"
                      onClick={handleMaintenanceReset}
                    >
                      Reset
                    </button>
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
    </>
  );
}

interface VehiclesTableProps {
  selectedTab: number;
  maintananceList: DocumentData;
  isSuperAdmin: boolean;
  handleCheckboxClick: any;
  checkboxState: any;
}
function MaintananceTable({
  selectedTab,
  maintananceList,
  isSuperAdmin,
  handleCheckboxClick,
  checkboxState,
}: VehiclesTableProps) {
  console.log("MaintananceTable Rendering with selectedTab:", selectedTab);
  console.log("Mainanace list", maintananceList);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const currentDate = new Date();

  const filteredApprovedMaintenance = maintananceList.filter(
    (maintenance: { status: string }) => maintenance.status === "Approved"
  );

  const filteredMaintenance = filteredApprovedMaintenance.filter(
    (maintenance: any) => {
      const maintenanceDate = new Date(maintenance?.date?.seconds * 1000);

      if (selectedTab === 0) {
        // Show items with dates that are yet to reach (future dates)
        return maintenanceDate > currentDate;
      } else if (selectedTab === 1) {
        // Show items with dates that have already passed (past dates)
        return maintenanceDate < currentDate;
      }

      return true;
    }
  );
  const visibleClasses = filteredMaintenance.slice(startIndex, endIndex);

  console.log("Filtered Vehicles:", filteredMaintenance);
  return (
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
                      <tr key={maintenance.id} className="hover:bg-gray-100">
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
                          {maintenance.status}
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
          disabled={endIndex >= filteredMaintenance.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}
