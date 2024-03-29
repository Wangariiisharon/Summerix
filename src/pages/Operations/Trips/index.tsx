import { Header, HeaderBar } from "@/components/Headers";
import DummyTable, { ClientsTable } from "@/components/Table/Table";
import { Input, Submit } from "@/components/Forms/input";
import { AddButton, Button } from "@/components/Buttons";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  InboxArrowDownIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal } from "@/components/Modals/FormModal";
import { Fragment, SetStateAction, useEffect, useState } from "react";
// import SearchBar from "../../components/Forms/input"
import SiteLayout from "@/Layout/SiteLayout";
import { fbDb } from "@/firebase/configs";
import {
  getDocs,
  collection,
  DocumentData,
  Timestamp,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { Field, Formik, Form, useFormik, FormikHelpers } from "formik";
import setFieldValue from "formik";
import { Tab } from "@headlessui/react";
import Maintenance from "../Vehicles/maintanance";
import { useRouter } from "next/router";
import AllTrips from "./allTrips";
import { AnyIfEmpty } from "react-redux";
import { ErrorMessage } from "formik";
import exportDataToCSV from "../../../components/Exports/tripsExport";
import toast from "react-hot-toast";
import { startOfMonth, endOfMonth, format } from "date-fns";
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";
import PlacesAutocomplete from "react-places-autocomplete";
import { AnyRecord } from "dns";

// Update the import path

interface TripCounts {
  [key: string]: number;
}

const tabs = [
  { key: "all", name: "All" },
  { key: "onRoute", name: "On Route" },
  { key: "waiting", name: "Waiting" },
  { key: "complete", name: "Complete" },
];
const SearchBar = ({ placeholder, value, onChange }: any) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-96	 mx-auto p-2 rounded-md outline-none  focus:border-blue-600 text-xs text-gray-900 focus:bg-white disabled:opacity-50 invalid:border-red-500 invalid:text-red-600
		focus:invalid:border-red-500 focus:invalid:ring-red-500; bg-white w-64"
    />
  );
};
type Coordinates = {
  lat: number;
  lng: number;
};

export default function TripsComponent() {
  const [open, setOpen] = useState(false);
  const [drivers, setDrivers] = useState<
    { id: string; name: string; phonenumber: string }[]
  >([]);
  // const [vehicles, setVehicles] = useState<{ id: string; name: string; availability_status: string; lisence_plate: string }[]>([]);
  const [companies, setCompanies] = useState<
    { id: string; name: string; vehicle: string[] }[]
  >([]);
  const [selected, setSelected] = useState("");
  const [selectedCompanyVehicles, setSelectedCompanyVehicles] = useState<
    string[]
  >([]);
  const [companyDetailsFetched, setCompanyDetailsFetched] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [fetchedTrips, setfetchedTrips] = useState<DocumentData[]>([]);
  const [fetchedClients, setfetchedClients] = useState<DocumentData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<DocumentData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pickUpLocation, setPickUpLocation] = useState<string>("");
  const [dropOffLocation, setDropOffLocation] = useState<string>("");
  const [distance, setDistance] = useState<string>("");

  const [editFormInitialValues, setEditFormInitialValues] = useState({
    requested_by: "",
    vehicle: "",
    pick_up_location: "",
    drop_off_location: "",
    start_time: "" as unknown as Date, // Initialize as an empty string, cast to Date
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
  const router = useRouter();

  const { organisationId } = useAuthContext();
  console.log("OrganisationId on Trips page:", organisationId);

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    console.log("Search Query:", query);
    setSearchQuery(query);
  };
  const filteredTrips = fetchedTrips.filter((trip) => {
    const fullName = `${trip.vehicle}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    return nameMatch;
  });
  const handleAddTrip = () => {
    setOpen(true);
  };

  const handleReset = () => {
    setOpen(false);
  };
  const convertAddressToCoordinates = async (
    address: string
  ): Promise<Coordinates> => {
    // Implementation goes here
    return { lat: 0, lng: 0 }; // Dummy return to satisfy function return type
  };

  const updateSelectedCompanyVehicles = (companyName: string) => {
    if (companyName) {
      const company = companies.find((company) => company.name === companyName);
      if (company) {
        setSelectedCompanyVehicles(company.vehicle);
        console.log(setSelectedCompanyVehicles);
      }
    } else {
      setSelectedCompanyVehicles([]);
    }
  };
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(fbDb, "drivers"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);
          const driverDetails = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              phonenumber: data.phonenumber,
            };
          });
          setDrivers(driverDetails);
        } else {
          // Handle the case when organisationId is not available
          console.error(
            "Organisation ID is not available for fetching Vehicle names."
          );
        }
      } catch (error) {
        console.error("Error fetching Drivers:", error);
      }
    };
    const fetchedClients = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "clients"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);
          console.log(querySnapshot);
          const clientsData: DocumentData[] = [];
          console.log(clientsData);

          querySnapshot.forEach((doc) => {
            const clients = {
              id: doc.id,
              ...doc.data(),
            };
            clientsData.push(clients);
          });
          setfetchedClients(clientsData);
        } else {
          console.error(
            "Organisation ID is not available for fetching Trips ."
          );
        }
      } catch (error) {
        console.error("Error fetching Clients:", error);
      }
    };
    const fetchedTrips = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(db, "trips"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tripsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedTrips(tripsData);
          });

          return () => unsubscribe();
        } else {
          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching Trips:", error);
      }
    };

    const fetchedCompanies = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "classes"),
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);
          const companyDetails = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              vehicle: data.vehicle || [], // Ensure it's an array
            };
          });
          setCompanies(companyDetails);
          if (companyDetails.length > 0) {
            setSelectedCompany(companyDetails[0].name); // Set the first company as the default selected company
            setSelectedCompanyVehicles(companyDetails[0].vehicle); // Set its vehicles
          }
        } else {
          // Handle the case when organisationId is not available
          console.error(
            "Organisation ID is not available for fetching Companies ."
          );
        }
      } catch (error) {
        console.error("Error fetching Company details:", error);
      }
    };
    fetchedTrips();
    fetchedClients();
    fetchDrivers();
    fetchedCompanies();
  }, [organisationId]);
  console.log(selectedCompanyVehicles, "SelectedCompanyVehicles");
  console.log(selectedCompany, "SelectedCompany");

  const handleEditClick = (trip: DocumentData) => {
    const { seconds } = trip.start_time;
    const startTime = new Date(seconds * 1000);
    const { endseconds } = trip.end_time;
    const endTime = new Date(endseconds * 1000).toDateString();
    setSelectedTrip(trip);
    setEditFormInitialValues({
      requested_by: trip.requested_by,
      vehicle: trip.vehicle,
      pick_up_location: trip.pick_up_location,
      drop_off_location: trip.drop_off_location,
      start_time: startTime,
      end_time: endTime,
      cargo_type: trip.cargo_type,
      cargo_quantity: trip.cargo_quantity,
      memo: trip.memo,
      trip_status: trip.trip_status,
      organisationId: trip.organisation_id,
      tripId: trip.tripId,
      dealValue: trip.dealValue,
      fuel: trip.fuel,
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
    dealValue: any;
    fuel: any;
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
      if (!values.end_time) {
        console.error("Required form fields are missing");
        toast.error("Please fill the field End time");
        return;
      }
      const endTimeDate = new Date(values.end_time);
      const startTimeDate = new Date(values.start_time);

      const startTimeTimestamp = Timestamp.fromDate(endTimeDate);

      // Convert the Date to a Firestore Timestamp
      const endTimeTimestamp = Timestamp.fromDate(endTimeDate);

      // Update the vehicle data in the database using the selectedVehicle.id
      const AdminRef = doc(fbDb, "trips", selectedTrip.id);
      await setDoc(AdminRef, {
        requested_by: values.requested_by,
        vehicle: values.vehicle,
        pick_up_location: values.pick_up_location,
        drop_off_location: values.drop_off_location,
        start_time: values.start_time,
        end_time: endTimeTimestamp,
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
              dealValue: values.dealValue,
              fuel: values.fuel,
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
  // Assuming tripsPerVehicle is a global variable to keep track of trip counts
  const tripsPerVehicle: Record<string, { count: number; lastMonth: string }> =
    {};
  const currentMonth = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date());

  // Function to calculate the trip count for a given month and vehicle
  function calculateTripCount(vehicle: string, startMonth: string): number {
    const vehicleTrips = tripsPerVehicle[vehicle];

    if (vehicleTrips && vehicleTrips.lastMonth === startMonth) {
      // If the vehicle has trips in the start month, return the count
      return vehicleTrips.count + 1; // Include the current trip in the count
    }
    // If no trips for the start month, return 1 for the current trip
    return 1;
  }

  const tripCounts: {
    [key: string]: { month: string; counts: { [vehicle: string]: number } };
  } = {};

  const generateTripId = async (vehicle: string, start_time: string) => {
    try {
      const startDateObj = new Date(start_time + "T00:00:00");
      const startOfMonthDate = startOfMonth(startDateObj);
      const endOfMonthDate = endOfMonth(startDateObj);

      // Query Firestore to get the number of trips for the selected vehicle in the current month
      const tripsQuery = query(
        collection(fbDb, "trips"),
        where("vehicle", "==", vehicle),
        where("start_time", ">=", startOfMonthDate),
        where("start_time", "<=", endOfMonthDate)
      );

      const tripsSnapshot = await getDocs(tripsQuery);
      const numberOfTrips = tripsSnapshot.size + 1; // Increment by 1

      const formattedMonth = format(startDateObj, "MMM");
      const tripId = `${formattedMonth} ${numberOfTrips
        .toString()
        .padStart(2, "0")} ${vehicle}`;
      return tripId;
    } catch (error) {
      console.error("Error generating tripId:", error);
      throw error;
    }
  };

  async function fetchDistance(pickUpAddress: any, dropOffAddress: any) {
    try {
      const response = await fetch(
        `/api/distance?origins=${encodeURIComponent(
          pickUpAddress
        )}&destinations=${encodeURIComponent(dropOffAddress)}`
      );
      const { distance } = await response.json();
      console.log("fetchDistance:", distance);
      // setDistance(distance)

      if (distance) {
        return distance;
      } else {
        throw new Error("Distance not found in response");
      }
    } catch (error) {
      console.error("Failed to fetch distance:", error);
      throw error;
    }
  }

  const handleSubmit = async (values: {
    requested_by: string;
    pick_up_location: string;
    drop_off_location: string;
    vehicle: string;
    start_time: string;
    end_time: string;
    cargo_type: string;
    cargo_quantity: string;
    memo: string;
    company: string;
    client: string;
    dealValue: number;
    fuel: number;
    mileage_fee: number;
  }) => {
    setOpen(false);
    console.log("Submitted Values:", values);
    console.log("Distance handlesubmit:", distance);

    try {
      if (!values) {
        console.error("Form values are undefined");
        return;
      }
      if (!values.requested_by) {
        console.error("Required form fields are missing");
        return;
      }
      if (!values.vehicle) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field  Vehicle`);
        return;
      }
      if (!values.pick_up_location) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Pick uplo cation`);
        return;
      }
      if (!values.drop_off_location) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Drop off location`);
        return;
      }
      if (!values.start_time) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Start time`);
        return;
      }
      if (!values.cargo_type) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Cargo type`);
        return;
      }
      if (!values.cargo_quantity) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Cargo quantity`);
        return;
      }
      if (!values.company) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field company`);
        return;
      }
      if (!values.company) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field Company `);
        return;
      }
      if (!values.client) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field  Client`);
        return;
      }
      if (!values.dealValue) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field  Deal Value`);
        return;
      }
      if (!values.fuel) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field  Fuel`);
        return;
      }
      if (!values.mileage_fee) {
        console.error("Required form fields are missing");
        toast.error(`Please fill the field  Mileage Fee`);
        return;
      }
      const pickUpAddress = values.pick_up_location;
      const dropOffAddress = values.drop_off_location;
      console.log("PickUpAddress", pickUpAddress);
      console.log("dropOffAddress", dropOffAddress);

      //  const distanceValue = await fetchDistance(pickUpAddress, dropOffAddress);
      const distanceValue = await fetchDistance(pickUpAddress, dropOffAddress);
      console.log("Fetched Distance Value:", distanceValue);
      // Query Firestore to get the number of trips for the selected vehicle
      const tripsQuery = query(
        collection(fbDb, "trips"),
        where("vehicle", "==", values.vehicle)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const numberOfTrips = tripsSnapshot.size;

      console.log(`Number of trips for ${values.vehicle}: ${numberOfTrips}`);

      const startDateObj = new Date(values.start_time + "T00:00:00");
      const endDateObj = new Date(values.end_time + "T00:00:00");

      const startTimestamp = Timestamp.fromDate(startDateObj);
      const endTimestamp = Timestamp.fromDate(endDateObj);

      // Find the selected driver based on the provided name
      const selectedDriver = drivers.find(
        (driver) => driver.name === values.requested_by
      );

      if (!selectedDriver) {
        console.error("Selected driver or vehicle not found");
        return;
      }
      const tripId = await generateTripId(values.vehicle, values.start_time);
      const maintenanceData = {
        organisationId: organisationId,
        requested_by: {
          id: selectedDriver.id,
          name: selectedDriver.name,
          phonenumber: selectedDriver.phonenumber,
        },
        tripId: tripId,
        vehicle: values.vehicle,
        start_time: startTimestamp,
        end_time: "",
        pick_up_location: values.pick_up_location,
        drop_off_location: values.drop_off_location,
        cargo_type: values.cargo_type,
        cargo_quantity: values.cargo_quantity,
        memo: values.memo,
        company: values.company,
        trip_status: "",
        client: values.client,
        dealValue: values.dealValue,
        fuel: values.fuel,
        mileage_fee: values.mileage_fee,
        distance: distanceValue,
      };

      const docRef = await addDoc(collection(fbDb, "trips"), maintenanceData);
      console.log("Trip added with ID: ", docRef.id);
      toast.success("Trip Successfully Added.");
      setOpen(false);
    } catch (error) {
      console.error("Error adding Trip:", error);
      toast.error("Error adding Trip. Please try again.");
    }
  };

  const handleCompanyChange = (selectedCompanyName: SetStateAction<string>) => {
    setSelectedCompany(selectedCompanyName);
  };
  const handleExportButtonClick = async () => {
    setIsExporting(true);

    try {
      const csvData = await exportDataToCSV();

      // Create a blob and initiate the download
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exported-data.csv";
      a.click();
    } catch (error) {
      console.error("Error exporting data:", error);
    }

    setIsExporting(false);
  };
  const currentTimestamp = Date.now();
  const currentDate = new Date();

  const countTrips = (selectedTab: number) => {
    switch (selectedTab) {
      case 0:
        // Count all trips`w
        return filteredTrips.length;
      case 1:
        // Count trips where the current date is within the trip's start and end times
        return filteredTrips.filter((trip) => {
          const startTime = new Date(trip?.start_time?.seconds * 1000);
          const endTime = new Date(trip?.end_time?.seconds * 1000);
          return currentDate >= startTime && currentDate < endTime;
        }).length;
      case 2:
      case 3:
        // Count trips where the current date is greater than the trip's end time
        return filteredTrips.filter((trip) => {
          const endTime = new Date(trip?.end_time?.seconds * 1000);
          return currentDate > endTime;
        }).length;
      default:
        return 0;
    }
  };
  const allTripsCount = countTrips(0);
  const onRouteTripsCount = countTrips(1);
  const completeTripsCount = countTrips(2);
  const waitingTripsCount = countTrips(3);
  return (
    <div>
      <p className="text-lg font-nunito font-bold mt-2 ml-10 mb-2">Trips</p>
      <div className="flex flex-col">
        <div className="flex flex-row">
          <Tab.Group>
            <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start ml-10">
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  className={`${
                    selectedTab === index
                      ? "rounded-md bg-d-green text-white"
                      : "text-black bg-white"
                  } w-40 flex justify-between items-center h-10 pl-4 text-base pr-2 mr-2 cursor-pointer font-bold`}
                  onClick={() => {
                    console.log("Tab Clicked", index);
                    setSelectedTab(index);
                  }}
                >
                  <div>{tab.name}</div>
                  <div
                    className={`${
                      selectedTab === index ? "bg-dd-green" : "bg-grey"
                    } w-12 text-center py-1 rounded`}
                  >
                    {tab.key === "all"
                      ? allTripsCount
                      : tab.key === "onRoute"
                      ? onRouteTripsCount
                      : tab.key === "complete"
                      ? completeTripsCount
                      : waitingTripsCount}
                  </div>
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>
        </div>

        <div className="flex w-full flex-row mt-6">
          <div className=" ml-10 w-full">
            <SearchBar
              placeholder="Search  Trips "
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-96"
            />
          </div>
          <div className="flex  right-4">
            <button
              className="bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded"
              onClick={handleExportButtonClick}
              disabled={isExporting}
            >
              <>
                <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
                Export
              </>
            </button>

            <Button
              className="ml-4 bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded"
              handleClick={handleAddTrip}
            >
              <>
                <PlusIcon className="h-6 w-6 mr-2" />
                Add Trip
              </>
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <Tab.Group>
          <Tab.Panels>
            <Tab.Panel>
              {selectedTab === 0 ? (
                <div className="overflow-y-auto">
                  <AllTrips
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                </div>
              ) : (
                <div className="overflow-y-auto">
                  <TripsTable
                    selectedTab={selectedTab}
                    trips={fetchedTrips}
                    filteredTrips={filteredTrips}
                    handleEditClick={handleEditClick}
                  />
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel>
              <div className="overflow-y-auto">
                <TripsTable
                  selectedTab={1}
                  trips={fetchedTrips}
                  filteredTrips={filteredTrips}
                  handleEditClick={handleEditClick}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="overflow-y-auto">
                <TripsTable
                  selectedTab={2}
                  trips={fetchedTrips}
                  filteredTrips={filteredTrips}
                  handleEditClick={handleEditClick}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="overflow-y-auto">
                <TripsTable
                  selectedTab={3}
                  trips={fetchedTrips}
                  filteredTrips={filteredTrips}
                  handleEditClick={handleEditClick}
                />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      <FormModal open={open} setOpen={setOpen}>
        <div className="p-8">
          <div className="flex w-full h-full justify-between items-center mb-12">
            <div className="text-xl font-semibold ">New Trip</div>
            <Button
              className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
              handleClick={handleReset}
            >
              <XMarkIcon className="h-6 w-6 text-red-400" />
            </Button>
          </div>

          <Formik
            initialValues={{
              requested_by: "",
              vehicle: "",
              pick_up_location: "",
              drop_off_location: "",
              start_time: "",
              end_time: "",
              cargo_type: "",
              cargo_quantity: "",
              memo: "",
              company: "",
              client: "",
              dealValue: 0,
              fuel: 0,
              mileage_fee: 0,
            }}
            onSubmit={(values) => handleSubmit(values)}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="">
                  <div className="flex w-full justify-between mt-8">
                    <label className="block">
                      <label className="form-label">PICK UP LOCATION</label>
                      <PlacesAutocomplete
                        value={values.pick_up_location}
                        onChange={(address) =>
                          setFieldValue("pick_up_location", address)
                        }
                      >
                        {({
                          getInputProps,
                          suggestions,
                          getSuggestionItemProps,
                          loading,
                        }) => (
                          <div>
                            <input
                              {...getInputProps({
                                className: "form-input bg-grey w-48",
                                placeholder: "Enter Pick Up Location",
                              })}
                            />
                            <div>
                              {loading && <div>Loading...</div>}
                              {suggestions.map((suggestion, index) => (
                                <div
                                  {...getSuggestionItemProps(suggestion)}
                                  key={index}
                                >
                                  {suggestion.description}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </PlacesAutocomplete>
                    </label>

                    <label className="block">
                      <label className="form-label">DROP OFF LOCATION</label>
                      <PlacesAutocomplete
                        value={values.drop_off_location}
                        onChange={(address) =>
                          setFieldValue("drop_off_location", address)
                        }
                      >
                        {({
                          getInputProps,
                          suggestions,
                          getSuggestionItemProps,
                          loading,
                        }) => (
                          <div>
                            <input
                              {...getInputProps({
                                className: "form-input bg-grey w-48",
                                placeholder: "Enter Drop Off Location",
                              })}
                            />
                            <div>
                              {loading && <div>Loading...</div>}
                              {suggestions.map((suggestion, index) => (
                                <div
                                  {...getSuggestionItemProps(suggestion)}
                                  key={index}
                                >
                                  {suggestion.description}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </PlacesAutocomplete>
                    </label>
                  </div>

                  <div className="flex w-full justify-between mt-8">
                    <label className="block">
                      <label className="form-label">START TIME</label>
                      <Field
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
                        disabled
                      />
                    </label>
                  </div>

                  <div className="flex w-full justify-between  mt-8">
                    <label className="block">
                      <label className="form-label">CLASS</label>
                      <Field
                        as="select"
                        name="company"
                        value={values.company}
                        onChange={async (e: any) => {
                          const selectedCompanyName = e.target.value;
                          handleCompanyChange(selectedCompanyName);
                          console.log(
                            "selectedCompanyName",
                            selectedCompanyName
                          );

                          // Disable the submit button and reset the fetched flag
                          setCompanyDetailsFetched(false);
                          // Find the selected company's vehicles and set them
                          const selectedCompanyDetails = companies.find(
                            (company) => company.name === selectedCompanyName
                          );
                          setSelectedCompanyVehicles(
                            selectedCompanyDetails
                              ? selectedCompanyDetails.vehicle
                              : []
                          );
                          // Enable the submit button and set the fetched flag
                          setCompanyDetailsFetched(true);
                          console.log(selectedCompanyDetails);
                          console.log(values.company);
                          setFieldValue("company", selectedCompanyName);
                        }}
                        className="form-input bg-grey w-48"
                      >
                        <option value="">Select Class</option>
                        {companies.map((company, index) => (
                          <option key={index} value={company.name}>
                            {company.name}
                          </option>
                        ))}
                      </Field>
                    </label>
                    <label className="block">
                      <label className="form-label">CLIENT</label>
                      <Field
                        as="select"
                        name="client"
                        value={values.client}
                        className="form-input bg-grey w-48"
                      >
                        <option value="">Select Client</option>
                        {fetchedClients.map((client, index) => (
                          <option key={index} value={client.name}>
                            {client.name}
                          </option>
                        ))}
                      </Field>
                    </label>
                  </div>
                  <div className="mt-8 flex w-full justify-between">
                    <label className="block">
                      <label className="form-label">SELECT DRIVER</label>
                      <Field
                        as="select"
                        name="requested_by"
                        value={values.requested_by}
                        className="form-input bg-grey w-48"
                      >
                        <option value="">Select Driver</option>
                        {drivers.map((driver, index) => (
                          <option key={index} value={driver.name}>
                            {driver.name}
                            {/* Display additional driver details */}
                          </option>
                        ))}
                      </Field>
                    </label>
                    <label className="block">
                      <label className="form-label">VEHICLE</label>
                      <Field
                        as="select"
                        name="vehicle"
                        value={values.vehicle}
                        className="form-input bg-grey w-48"
                      >
                        <option value="">Select Vehicle</option>
                        {selectedCompanyVehicles.map((vehicle, index) => (
                          <option key={index} value={vehicle}>
                            {vehicle}
                          </option>
                        ))}
                      </Field>
                    </label>
                  </div>
                  <div className="mt-8 flex w-full justify-between">
                    <label className="block">
                      <label className="form-label">DEAL VALUE</label>
                      <Field
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
                        type="text"
                        name="distance"
                        disabled
                        value={distance}
                        className="form-input bg-grey w-48"
                      />
                    </label>
                  </div>
                  <p className="mt-5 font-semibold"> CARGO</p>
                  <div className="flex w-full justify-between">
                    <label className="block mt-8">
                      <label className="form-label">CARGO TYPE</label>
                      <Field
                        type="text"
                        name="cargo_type"
                        value={values.cargo_type}
                        className="form-input bg-grey w-48"
                      />
                    </label>
                    <label className="block mt-8">
                      <label className="form-label">CONTAINER NUMBER</label>
                      <Field
                        type="text"
                        name="cargo_quantity"
                        value={values.cargo_quantity}
                        className="form-input bg-grey w-48"
                      />
                    </label>
                  </div>
                  <label className="block mt-8">
                    <label className="form-label">MEMO</label>
                    <Field
                      type="text"
                      name="memo"
                      value={values.memo}
                      className="form-input bg-grey w-96 h-20"
                      placeholder="Optional"
                    />
                  </label>
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

      {editModalOpen && selectedTrip && (
        <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
          <div>
            <div className="flex w-full h-full justify-between items-center mb-12">
              <div className="text-xl font-semibold ">Edit Trip Details</div>
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
                          value={values.requested_by}
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
                          type="string"
                          name="distance"
                          value={values.distance}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                    </div>
                    <p className="mt-5 font-semibold"> Cargo</p>
                    <div className="flex w-full justify-between">
                      <label className="block mt-8">
                        <label className="form-label">CARGO TYPE</label>
                        <Field
                          disabled
                          type="text"
                          name="cargo_type"
                          value={values.cargo_type}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                      <label className="block mt-8">
                        <label className="form-label">CARGO QUANTITY</label>
                        <Field
                          disabled
                          type="text"
                          name="cargo_quantity"
                          value={values.cargo_quantity}
                          className="form-input bg-grey w-48"
                        />
                      </label>
                    </div>
                    <label className="block mt-8">
                      <label className="form-label">TRIP STATUS</label>

                      <Field
                        as="select"
                        name="trip_status"
                        value={values.trip_status}
                        className="form-input bg-grey w-48"
                      >
                        <option value="Booked">Select Trip Status</option>
                        <option value="Booked">Booked</option>
                        <option value="Ready for Departure">
                          Ready for Departure
                        </option>
                        <option value="At the border">At the border</option>
                        <option value="Offloading dest">Offloading dest</option>
                        <option value="On Route">On Route</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Done">Done </option>
                        <option value="Returning the Container">
                          returning with Container
                        </option>
                      </Field>
                    </label>
                    <label className="block mt-8">
                      <label className="form-label">MEMO</label>
                      <Field
                        disabled
                        type="text"
                        name="memo"
                        value={values.memo}
                        className="form-input bg-grey w-96 h-20"
                        placeholder="Optional"
                      />
                    </label>
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
    </div>
  );
}

interface TripsTableProps {
  selectedTab: number;
  trips: DocumentData[];
  filteredTrips: DocumentData[];
  handleEditClick: any;
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
}: TripsTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const router = useRouter();
  const handleTripClick = (trip: any) => {
    router.push(`/Trips//viewTrip?id=${trip.id}`);
  };
  const calculateHourDifference = (startTime: number, endTime: number) => {
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = endTime - startTime;

    // Convert milliseconds to hours and round to nearest whole number
    const differenceInHours = Math.round(
      differenceInMilliseconds / (1000 * 60 * 60)
    );

    return differenceInHours;
  };
  const tripsPerVehicle: TripsPerVehicle = {};
  const currentDate = new Date();
  const filteredAllocation = filteredTrips
    .filter((trip) => {
      const startTime = new Date(trip?.start_time?.seconds * 1000);
      const endTime = new Date(trip?.end_time?.seconds * 1000);

      switch (selectedTab) {
        case 0:
          // Show all trips
          return true;
        case 1:
          // Show trips whose start_time has reached but end_time hasn't reached
          return currentDate >= startTime && currentDate < endTime;
        case 2:
          // Show completed trips where both start_time and end_time have already passed
          return currentDate > endTime;
        case 3:
          // Show completed trips where both start_time and end_time have already passed
          return currentDate > endTime;
        case 4:
          // Show completed trips where both start_time and end_time have already passed
          return currentDate > endTime;
        default:
          return false;
      }
    })
    // Sort the filteredAllocation array only if selectedTab is 3 (fourth tab)
    .sort((a, b) =>
      selectedTab === 3
        ? Number(new Date(b.end_time.seconds * 1000)) -
          Number(new Date(a.end_time.seconds * 1000))
        : 0
    );

  console.log("Selected Tab", selectedTab);
  const visibleTrips = filteredAllocation.slice(startIndex, endIndex);

  const formatTripId = (
    currentMonth: string,
    tripCount: { toString: () => string },
    vehicle: any
  ) => {
    const formattedMonth = currentMonth.substring(0, 3); // Get the first three characters of the month
    const formattedTripCount = tripCount.toString().padStart(2, "0"); // Ensure two-digit trip count
    return `${formattedMonth} ${formattedTripCount} ${vehicle}`;
  };

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
                    Trip Cost
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Status
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
                {visibleTrips.map((trip, index) => (
                  <Fragment key={index}>
                    <div className="w-full mb-2 font-nunito font-regular"></div>
                    <tr
                      className="bg-[#FAFAFB] hover:bg-gray-100"
                      onClick={() => handleTripClick(trip)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium  text-blue-700 sm:pl-0">
                        {trip.tripId}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 relative">
                        {trip.vehicle}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trip.drop_off_location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trip.pick_up_location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        Ksh {trip.dealValue}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <button
                          className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(trip);
                          }}
                        >
                          {[
                            "Booked",
                            "Ready for Departure",
                            "At the border",
                            "Offloading dest",
                            "On Route",
                            "Mechanical",
                            "Done",
                            "Returning the Container",
                          ].includes(trip.trip_status)
                            ? trip.trip_status
                            : "Status"}
                        </button>
                      </td>
                    </tr>
                  </Fragment>
                ))}
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
          disabled={endIndex >= filteredAllocation.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}
