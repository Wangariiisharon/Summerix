import { Button } from "@/components/Buttons";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal } from "@/components/Modals/FormModal";
import { Fragment, useEffect, useState } from "react";
import { fbDb } from "@/firebase/configs";
import {
  getDocs,
  collection,
  DocumentData,
  Timestamp,
  doc,
  setDoc,
  query,
  where,
  getFirestore,
  onSnapshot,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { Field, Formik, Form } from "formik";
import { Tab } from "@headlessui/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";

const tabs = [
  { name: "OVERVIEW", href: "#", current: false },
  { name: "UPCOMING TRIPS", href: "#", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AllTrips({ searchQuery }: any) {
  const [open, setOpen] = useState(false);
  const [drivers, setDrivers] = useState<
    { id: string; name: string; phonenumber: string }[]
  >([]);
  const [vehicles, setVehicles] = useState<
    {
      id: string;
      name: string;
      availability_status: string;
      lisence_plate: string;
    }[]
  >([]);
  const [selectedTrip, setSelectedTrip] = useState<DocumentData | null>(null);
  const [fetchedTrips, setfetchedTrips] = useState<DocumentData[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    trip_id: "",
    requested_by: {
      id: "",
      name: "",
      phonenumber: "",
    },
    vehicle: "",
    pick_up_location: "",
    drop_off_location: "",
    start_time: "", // Initialize as an empty string, cast to Date
    end_time: "", // Make sure it's initialized as a string
    cargo_type: "",
    cargo_quantity: "",
    memo: "",
    trip_status: "",
    organisationId: "",
    tripId: "",
    dealValue: 0,
    fuel: 0,
    mileage_fee: 0,
    distance: "",
  });
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
  } = useAuthContext();

  const allTripsTabs = [
    { name: "OVERVIEW", href: "#", current: selectedTabIndex === 0 },
    { name: "UPCOMING TRIPS", href: "#", current: selectedTabIndex === 1 },
  ];

  const router = useRouter();

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

  const handleEditClick = (trip: DocumentData) => {
    // Check and convert Firestore Timestamps to Date objects safely
    const startTime =
      trip.start_time && trip.start_time.toDate
        ? trip.start_time.toDate()
        : convertToDate(trip.start_time);
    const endTime =
      trip.end_time && trip.end_time.toDate
        ? trip.end_time.toDate()
        : convertToDate(trip.end_time);

    setSelectedTrip(trip);
    setEditFormInitialValues({
      trip_id: trip.trip_id,
      requested_by: {
        id: trip.requested_by.id || "", // Assuming the 'id' field exists
        name: trip.requested_by.name || "",
        phonenumber: trip.requested_by.phonenumber || "",
      },
      vehicle: trip.vehicle,
      pick_up_location: trip.pick_up_location,
      drop_off_location: trip.drop_off_location,
      start_time: convertDateToInputString(startTime),
      end_time: convertDateToInputString(endTime),
      cargo_type: trip.cargo_type,
      cargo_quantity: trip.cargo_quantity,
      memo: trip.memo,
      trip_status: trip.trip_status,
      organisationId: trip.organisationId,
      tripId: trip.tripId,
      fuel: trip.fuel,
      dealValue: trip.dealValue,
      mileage_fee: trip.mileage_fee,
      distance: trip.distance,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedTrip(null);
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (values: {
    trip_id: any;
    requested_by: any;
    vehicle: any;
    pick_up_location: any;
    drop_off_location: any;
    start_time: any;
    end_time: any;
    cargo_type: any;
    cargo_quantity: any;
    memo: any;
    trip_status: any;
    organisationId: any;
    tripId: any;
    fuel: any;
    dealValue: any;
    mileage_fee: any;
    distance: any;
  }) => {
    if (!selectedTrip) {
      console.error("No selected Trip to update");
      return;
    }

    console.log("Edited Values:", values);
    try {
      if (!values) {
        console.error("Form values are undefined");
        return;
      }
      if (!values.trip_status) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Trip status`);
        return;
      }

      const endTimeDate = new Date(values.end_time);
      const startTimeDate = new Date(values.start_time);

      const startTimeTimestamp = Timestamp.fromDate(endTimeDate);

      // Convert the Date to a Firestore Timestamp
      const endTimeTimestamp = Timestamp.fromDate(endTimeDate);
      const requestedByData = {
        name: values.requested_by.name,
        id: values.requested_by.id, // Ensure you capture and save all necessary details
        email: values.requested_by.email, // Add more fields as needed
      };

      // Update the vehicle data in the database using the selectedVehicle.id
      const AdminRef = doc(fbDb, "trips", selectedTrip.id);
      await setDoc(AdminRef, {
        // requested_by: values.requested_by.name,
        trip_id: values.trip_id,
        requested_by: values.requested_by, // Passing the entire object
        vehicle: values.vehicle,
        pick_up_location: values.pick_up_location,
        drop_off_location: values.drop_off_location,
        start_time: values.start_time,
        end_time: values.end_time,
        cargo_type: values.cargo_type,
        cargo_quantity: values.cargo_quantity,
        memo: values.memo,
        trip_status: values.trip_status,
        organisationId: values.organisationId,
        tripId: values.tripId,
        dealValue: values.dealValue,
        fuel: values.fuel,
        mileage_fee: values.mileage_fee,
        distance: values.distance,
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedTrips.map((trip) =>
        trip.id === selectedTrip.id
          ? {
              ...trip,
              trip_id: values.trip_id,
              requested_by: values.requested_by,
              vehicle: values.vehicle,
              pick_up_location: values.pick_up_location,
              drop_off_location: values.drop_off_location,
              start_time: values.start_time,
              end_time: values.end_time,
              cargo_type: values.cargo_type,
              cargo_quantity: values.cargo_quantity,
              memo: values.memo,
              trip_status: values.trip_status,
              organisationId: values.organisationId,
              tripId: values.tripId,
              fuel: values.fuel,
              dealValue: values.dealValue,
              mileage_fee: values.mileage_fee,
              distance: values.distance,
            }
          : trip
      );
      setfetchedTrips(updatedVehicles);
      setSelectedTrip(null);
      setEditModalOpen(false);
      toast.success("Trip Successfully Updated.");
    } catch (error) {
      console.error("Error updating trip:", error);
    }
  };

  const filteredTrips = fetchedTrips.filter((trip) => {
    const fullName = `${trip.vehicle}`.toLowerCase();
    const tripIdSearch = `${trip.trip_id}`.toLowerCase();

    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    const tripIdMatch = tripIdSearch.includes(searchQuery.toLowerCase());
    // const startTimeMatch = formatDate(
    //   new Date(trip.start_time.seconds * 1000)
    // ).includes(searchQuery);
    const startTimeMatch = `${trip.start_time}`.includes(
      searchQuery.toLowerCase()
    );
    const start = formatDate(new Date(trip.start_time.seconds * 1000));
    console.log("start", start);

    return nameMatch || startTimeMatch || tripIdMatch;
  });

  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // JavaScript months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Formats date as "dd/MM/YYYY"
  }
  const handleSearch = () => {};
  const handleClick = () => {};
  const handleAddTrip = () => {
    setOpen(true);
  };
  const handleExport = () => {};
  const handleReset = () => {
    setOpen(false);
  };
  useEffect(() => {
    // Retrieve the saved tab index from local storage when the component mounts
    const savedIndex = localStorage.getItem("selectedTabIndex");
    if (savedIndex !== null) {
      setSelectedIndex(parseInt(savedIndex, 10));
    }
    const fetchDrivers = async () => {
      try {
        if (organisationId) {
          // Query to fetch all drivers where archive is false and belong to the same organisation
          const driversQuery = query(
            collection(fbDb, "drivers"),
            where("organisationId", "==", organisationId),
            where("archive", "==", false)
          );
          const querySnapshot = await getDocs(driversQuery);

          const drivers = [];
          for (const driverDoc of querySnapshot.docs) {
            const driverData = driverDoc.data();
            console.log("Driver data:", driverData);

            // Query to check if the driver has any 'On Route' trips
            const tripQuery = query(
              collection(fbDb, "trips"),
              where("requested_by.id", "==", driverDoc.id),
              where("trip_status", "==", "On Route")
            );
            const tripSnapshot = await getDocs(tripQuery);
            if (tripSnapshot.empty) {
              // Only include drivers with no 'On Route' trips
              drivers.push({
                id: driverDoc.id,
                name: driverData.name,
                phonenumber: driverData.phonenumber,
                // Add more fields if necessary
              });
            }
          }
          setDrivers(drivers);
          console.log("FilterdDrivers:", drivers);
        }
      } catch (error) {
        console.error("Error fetching Drivers:", error);
      }
    };

    const fetchVehicleDetails = async () => {
      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(fbDb, "vehicles"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);
          const vehicleDetails = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              availability_status: data.availability_status,
              lisence_plate: data.lisence_plate,
            };
          });
          setVehicles(vehicleDetails);
        }
      } catch (error) {
        console.error("Error fetching Vehicles:", error);
      }
    };

    const fetchedTrips = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(db, "trips"),
            where("organisationId", "==", organisationId),
            orderBy("start_time", "asc") // Adjust 'asc' to 'desc' if you need descending order
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tripsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedTrips(tripsData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Trips:", error);
      }
    };

    fetchedTrips();
    fetchVehicleDetails();
    fetchDrivers();
  }, [organisationId]);

  const filterTripsByTimeRange = (trip: DocumentData): boolean => {
    const currentDate = new Date();

    if (selectedTimeRange === "thisWeek") {
      // Filter trips that occurred within the current week
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(currentDate);
      endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay())); // End of the week (Saturday)
      endOfWeek.setHours(23, 59, 59, 999);

      const tripDate = trip.start_time?.toDate();

      return tripDate && tripDate >= startOfWeek && tripDate <= endOfWeek;
    }

    if (selectedTimeRange === "thisMonth") {
      // Filter trips that occurred within the current month
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      endOfMonth.setHours(23, 59, 59, 999);

      const tripDate = trip.start_time?.toDate();

      return tripDate && tripDate >= startOfMonth && tripDate <= endOfMonth;
    }

    // 'all' selected, no additional filtering
    return true;
  };

  const hasExportPermission =
    userClaims?.additionalPermissions?.includes("Export Trips") ||
    userClaims?.admin;

  const hasAddPermission =
    userClaims?.additionalPermissions?.includes("Add Trips") ||
    userClaims?.admin;
  const hasViewTripermission =
    userClaims?.additionalPermissions?.includes("View trips detail") ||
    userClaims?.admin;
  const hasEditTripermission =
    userClaims?.additionalPermissions?.includes("Edit trip") ||
    userClaims?.admin;

  return (
    <div>
      <div className="flex flex-col"></div>
      {/* <HeaderBar headers={Headers}/> */}
      <div className="mt-2">
        <Tab.Group>
          <div className="flex flex-row">
            <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3">
              {allTripsTabs.map((tab, index) => (
                <Fragment key={index}>
                  <Tab
                    className={classNames(
                      "border-d-green outline-none text-sm font-nunito font-bold uppercase flex flex-row ml-10",
                      tab.current
                        ? "ui-selected border-b-4 ui-selected:text-d-green"
                        : ""
                    )}
                    onClick={() => setSelectedTabIndex(index)}
                  >
                    {tab.name}
                  </Tab>
                </Fragment>
              ))}
            </Tab.List>

            <div className="text-sm flex pr-2">
              {/* Filter by: */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="ml-2 border border-[#4FD1C5] rounded text-sm"
              >
                <option value="all">All</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>
          </div>
          <Tab.Panels>
            <Tab.Panel
              className={classNames(
                selectedTabIndex === 0 ? "ui-selected border-b-4" : "",
                "h-full"
              )}
            >
              <div className=" overflow-y-auto">
                <TripsTable
                  selectedTab={selectedTabIndex}
                  trips={fetchedTrips}
                  filteredTrips={filteredTrips.filter(filterTripsByTimeRange)}
                  handleEditClick={handleEditClick}
                  hasEditTripermission={hasEditTripermission}
                  hasViewTripermission={hasViewTripermission}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel
              className={classNames(
                selectedTabIndex === 0 ? "ui-selected border-b-4" : "",
                "h-full"
              )}
            >
              <div className="overflow-y-auto">
                <TripsTable
                  selectedTab={selectedTabIndex}
                  trips={fetchedTrips}
                  filteredTrips={filteredTrips}
                  handleEditClick={handleEditClick}
                  hasEditTripermission={hasEditTripermission}
                  hasViewTripermission={hasViewTripermission}
                />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {editModalOpen && selectedTrip && (
        <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
          <div>
            <div className="flex w-full h-full justify-between items-center mb-12">
              <div className="text-xl font-semibold ">Edit trip Details</div>
              <Button
                className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                handleClick={handleEditModalClose}
              >
                <XMarkIcon className="h-6 w-6 text-red-400" />
              </Button>
            </div>

            <Formik
              initialValues={editFormInitialValues}
              onSubmit={handleEditSubmit}
            >
              {({ values }) => (
                <Form>
                  <div className="">
                    <div className="flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">PICK UP LOCATION</label>
                        <Field
                          disabled
                          type="text"
                          name="pick_up_location"
                          value={values.pick_up_location}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                      <label className="block">
                        <label className="form-label">DROP OFF LOCATION</label>
                        <Field
                          disabled
                          type="text"
                          name="drop_off_location"
                          value={values.drop_off_location}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                    </div>
                    <div className="flex w-full justify-between mt-8">
                      <label className="block">
                        <label className="form-label">START TIME</label>
                        <Field
                          disabled
                          type="date"
                          name="start_time"
                          value={values.start_time}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                      <label className="block">
                        <label className="form-label">END TIME</label>
                        <Field
                          type="date"
                          name="end_time"
                          value={values.end_time}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                    </div>

                    <div className="flex w-full justify-between  mt-8">
                      <label className="block">
                        <label className="form-label">SELECT DRIVER</label>
                        <Field
                          disabled
                          name="requested_by"
                          value={values.requested_by.name}
                          className="form-input bg-grey w-48"
                        ></Field>
                      </label>
                      <label className="block">
                        <label className="form-label">VEHICLE</label>.
                        <Field
                          disabled
                          name="vehicle"
                          value={values.vehicle}
                          className="form-input bg-grey w-48"
                        ></Field>
                      </label>
                    </div>
                    <div className="mt-8 flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">DEAL VALUE</label>
                        <Field
                          disabled
                          type="number"
                          name="dealValue"
                          value={values.dealValue}
                          placeholder="Ksh"
                          className="form-input bg-grey w-48"
                        />
                      </label>
                      <label className="block">
                        <label className="form-label">FUEL</label>
                        <Field
                          disabled
                          type="number"
                          name="fuel"
                          value={values.fuel}
                          placeholder="Ksh"
                          className="form-input bg-grey w-48"
                        />
                      </label>
                    </div>
                    <div className="mt-8 flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">MILEAGE FEE</label>
                        <Field
                          disabled
                          type="number"
                          name="mileage_fee"
                          value={values.mileage_fee}
                          placeholder="Ksh"
                          className="form-input bg-grey w-48"
                        />
                      </label>
                      <label className="block">
                        <label className="form-label">DISTANCE</label>
                        <Field
                          disabled
                          type="text"
                          name="distance"
                          value={values.distance}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                    </div>

                    <p className="mt-5 font-semibold"> Cargo</p>
                    <div className="flex w-full justify-between">
                      <label className="block mt-8">
                        <label className="form-label">Cargo Type</label>
                        <Field
                          disabled
                          type="text"
                          name="cargo_type"
                          value={values.cargo_type}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                      <label className="block mt-8">
                        <label className="form-label">Cargo Quanitiy</label>
                        <Field
                          disabled
                          type="text"
                          name="cargo_quantity"
                          value={values.cargo_quantity}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                    </div>
                    <div className="flex w-full justify-between"></div>
                    <label className="block mt-8">
                      <label className="form-label">TRIP STATUS</label>

                      <Field
                        as="select"
                        name="trip_status"
                        value={values.trip_status}
                        className="form-input bg-grey w-48"
                      >
                        <option>Select Trip Status</option>
                        <option value="Booked">Booked</option>
                        <option value="On Route">On Route</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Done">Done </option>
                      </Field>
                    </label>
                    <label className="block mt-8">
                      <label className="form-label">Memo</label>
                      <Field
                        type="text"
                        name="memo"
                        value={values.memo}
                        className="form-input bg-grey w-96 h-20"
                        placeholder="Optional"
                      />
                    </label>
                    <div className="flex w-full justify-end mt-24 ">
                      {/* <Button className='text-blue text-xl mr-32' handleClick={handleReset}>Reset</Button>
                                <button type='submit' >Save</button> */}
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
    </div>
  );
}
interface TripsTableProps {
  selectedTab: number;
  trips: DocumentData[];
  filteredTrips: DocumentData[];
  handleEditClick: any;
  hasViewTripermission: any;
  hasEditTripermission: any;
}
interface TripsPerVehicle {
  [key: string]: {
    count: number;
    lastMonth: string; // Keep track of the last month for each vehicle
  };
}

export function TripsTable({
  selectedTab,
  trips,
  filteredTrips,
  handleEditClick,
  hasViewTripermission,
  hasEditTripermission,
}: TripsTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const totalTrips = filteredTrips.length;
  const totalPages = Math.ceil(totalTrips / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const handleTripClick = (trip: any) => {
    router.push(`Operations/Trips/viewTrip?id=${trip.id}`);
  };
  const calculateHourDifference = (startTime: number, endTime: number) => {
    const differenceInMilliseconds = endTime - startTime;
    const differenceInHours = Math.round(
      differenceInMilliseconds / (1000 * 60 * 60)
    );
    return differenceInHours;
  };
  const currentDate = new Date();

  const filteredAllocation = filteredTrips.filter((trip: any) => {
    const maintenanceDate = new Date(trip?.start_time?.seconds * 1000);

    if (selectedTab === 0) {
      return true;
    } else if (selectedTab === 1) {
      return currentDate > maintenanceDate;
    }

    return true;
  });
  const visibleTrips = filteredAllocation.slice(startIndex, endIndex);

  const formatTripId = (
    currentMonth: string,
    tripCount: { toString: () => string },
    vehicle: any
  ) => {
    const formattedMonth = currentMonth.substring(0, 3);
    const formattedTripCount = tripCount.toString().padStart(2, "0"); // Ensure two-digit trip count
    return `${formattedMonth} ${formattedTripCount} ${vehicle}`;
  };

  const tripsPerVehicle: TripsPerVehicle = {};

  const calculateTripCount = (
    startMonth: string,
    endMonth: string,
    currentMonth: string
  ): number => {
    if (startMonth === endMonth) {
      return currentMonth === startMonth ? 1 : 0; // Trip happened in the current month
    } else {
      // Trip spans multiple months
      if (currentMonth === startMonth) {
        return 1; // Trip started in the current month
      } else if (currentMonth === endMonth) {
        return 1; // Trip ends in the current month
      } else {
        return 0; // Trip neither started nor ended in the current month
      }
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };
  const pageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages = [0, 1, 2, 3, "...", totalPages - 1];
    }
    return pages;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Trip ID
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Pick Up
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Drop off
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Trip Identification
                  </th>
                  {hasEditTripermission && (
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                  )}
                  <th
                    scope="col"
                    className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0"
                  >
                    <span className="sr-only"></span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#FAFAFB]">
                {visibleTrips.map((trip, index) => (
                  <Fragment key={index}>
                    <div className="w-full mb-2 font-nunito font-regular"></div>
                    <tr
                      className="bg-[#FAFAFB] hover:bg-gray-100"
                      // onClick={() => handleTripClick(trip)}
                      onClick={
                        hasViewTripermission
                          ? () => handleTripClick(trip)
                          : undefined
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium  text-blue-700 sm:pl-0">
                        {trip.trip_id}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 relative">
                        {trip.vehicle}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trip.pick_up_location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trip.drop_off_location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trip.tripId}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {hasEditTripermission && (
                          <button
                            className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(trip);
                            }}
                          >
                            {[
                              "Booked",
                              "On Route",
                              "Mechanical",
                              "Done",
                            ].includes(trip.trip_status)
                              ? trip.trip_status
                              : "Status"}
                          </button>
                        )}
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button onClick={() => handlePageClick(0)} disabled={currentPage === 0}>
          {"<<"}
        </button>
        {pageNumbers().map((num, index) => {
          // Only render buttons for numbers, and static text for ellipsis
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
  );
}
