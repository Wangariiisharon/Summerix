import { Button } from "@/components/Buttons";
import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal } from "@/components/Modals/FormModal";
import { Fragment, SetStateAction, useEffect, useState } from "react";
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
import { Field, Formik, Form } from "formik";
import { Tab } from "@headlessui/react";
import { useRouter } from "next/router";
import AllTrips from "./allTrips";
import { ErrorMessage } from "formik";
import { exportDataToCSV } from "../../../components/Exports/tripsExport";
import toast from "react-hot-toast";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import PlacesAutocomplete from "react-places-autocomplete";
import * as Yup from "yup";

interface TripCounts {
  [key: string]: number;
}
// Define interfaces for your data types

// Defines a map where the key is a string and the value is a Vehicle
interface VehicleData {
  archive: boolean;
  availability_status: string;
  // Include other properties as needed
}
interface Company {
  id: string;
  name: string;
  vehicle: string[];
}

const tabs = [
  { key: "all", name: "All" },
  { key: "onRoute", name: "On Route" },
  { key: "waiting", name: "Waiting" },
  { key: "complete", name: "Complete" },
];
const statusMap = ["all", "onRoute", "complete", "waiting"];
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

const validationSchema = Yup.object({
  requested_by: Yup.string().required("Driver is required"),
  vehicle: Yup.string().required("Vehicle is required"),
  pick_up_location: Yup.string().required("Pick up location is required"),
  drop_off_location: Yup.string().required("Drop off location is required"),
  start_time: Yup.date().required("Start time is required"),
  // end_time: Yup.date().required("End time is required"),
  cargo_type: Yup.string().required("Cargo type is required"),
  cargo_quantity: Yup.string().required("Cargo quantity is required"),
  company: Yup.string().required("Company is required"),
  client: Yup.string().required("Client is required"),
  dealValue: Yup.number().positive().required("Deal Value is required"),
  fuel: Yup.number().positive().required("Fuel is required"),
  mileage_fee: Yup.number().positive().required("Mileage Fee is required"),
});

const editValidationSchema = Yup.object({
  end_time: Yup.date().required("End time is required"),
  status: Yup.number().positive().required("Status is required"),
});

export default function TripsComponent() {
  const [open, setOpen] = useState(false);
  const [drivers, setDrivers] = useState<
    { id: string; name: string; phonenumber: string }[]
  >([]);
  // const [vehicles, setVehicles] = useState<{ id: string; name: string; availability_status: string; lisence_plate: string }[]>([]);
  const [companies, setCompanies] = useState<
    { id: string; name: string; vehicle: string[] }[]
  >([]);
  const [selectedCompanyVehicles, setSelectedCompanyVehicles] = useState<
    string[]
  >([]);
  const [companyDetailsFetched, setCompanyDetailsFetched] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [fetchedTrips, setfetchedTrips] = useState<DocumentData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTrips, setFilteredTrips] = useState<DocumentData[]>([]);

  const [fetchedClients, setfetchedClients] = useState<DocumentData[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<DocumentData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [distance, setDistance] = useState<string>("");
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { organisationId } = useAuthContext();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim().toLowerCase();
    console.log("Search Query:", query);
    setSearchQuery(query);
    setFilteredTrips(
      fetchedTrips.filter((trip) => {
        const vehicleMatch = `${trip.vehicle}`.toLowerCase().includes(query);
        const tripIdMatch = `${trip.trip_id}`.toLowerCase().includes(query);
        // const startTimeMatch = formatDate(
        //   new Date(trip.start_time.seconds * 1000)
        // ).includes(query);
        const startTimeMatch = `${trip.start_time}`
          .toLowerCase()
          .includes(query);
        const start = formatDate(new Date(trip.start_time.seconds * 1000));
        console.log("start", start);
        console.log("startTimeMatch", startTimeMatch);
        console.log(searchQuery, "searchQuery");

        return vehicleMatch || startTimeMatch || tripIdMatch;
      })
    );
  };

  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // JavaScript months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Formats date as "dd/MM/YYYY"
  }

  const handleAddTrip = () => {
    setOpen(true);
  };

  const handleReset = () => {
    setOpen(false);
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

  const fetchOngoingTrips = async () => {
    const now = new Date();
    const ongoingTripsQuery = query(
      collection(getFirestore(), "trips"),
      where("start_time", "<=", Timestamp.fromDate(now)), // Trips that have started
      where("end_time", ">", Timestamp.fromDate(now)) // But not yet ended
    );

    const querySnapshot = await getDocs(ongoingTripsQuery);
    const ongoingTrips = querySnapshot.docs.map((doc) => {
      console.log(doc.data()); // Debug to see the trip data
      return doc.data();
    });
    return ongoingTrips;
  };

  const fetchDrivers = async (organisationId: any) => {
    const db = getFirestore();
    try {
      // Retrieve trips that are "On Route"
      const tripsQuery = query(
        collection(db, "trips"),
        where("trip_status", "==", "On Route")
      );

      const tripsSnapshot = await getDocs(tripsQuery);
      const driversOnTripsIds = new Set(
        tripsSnapshot.docs.map((doc) => {
          console.log("Trip data for 'On Route':", doc.data());
          return doc.data().requested_by.id;
        })
      );

      if (driversOnTripsIds.size === 0) {
        console.log("No drivers are currently on trips.");
      } else {
        console.log(
          "Drivers currently on trips IDs:",
          Array.from(driversOnTripsIds)
        );
      }

      // Fetch all drivers not in trips
      const allDriversQuery = query(
        collection(db, "drivers"),
        where("organisationId", "==", organisationId),
        where("archive", "==", false)
      );

      const querySnapshot = await getDocs(allDriversQuery);
      const availableDrivers = querySnapshot.docs.filter(
        (doc) => !driversOnTripsIds.has(doc.id)
      );

      console.log(
        "Filtered available drivers:",
        availableDrivers.map((doc) => doc.data())
      );

      return availableDrivers.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        phonenumber: doc.data().phonenumber,
      }));
    } catch (error) {
      console.error("Error in fetchDrivers:", error);
      throw error;
    }
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

    const fetchedClients = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "clients"),
            where("organisationId", "==", organisationId),
            where("archive", "==", false)
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
            collection(fbDb, "trips"),
            where("organisationId", "==", organisationId)
            // orderBy("start_time", "asc") // Adjust 'asc' to 'desc' if you need descending order
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tripsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedTrips(tripsData);
            setFilteredTrips(tripsData);
          });

          return () => unsubscribe();
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
            where("organisationId", "==", organisationId),
            where("archive", "==", false)
          );
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            console.log(
              "No classes found for the organisationId:",
              organisationId
            );
            return;
          }

          const companyDetails = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              const data = doc.data();
              console.log("Class Data:", data);

              if (!data.vehicle || !Array.isArray(data.vehicle)) {
                console.log(
                  "No vehicles or invalid vehicle format in class:",
                  doc.id
                );
                return null;
              }

              const vehiclesPromises = data.vehicle.map(
                async (licensePlate: string) => {
                  const vehicleQuery = query(
                    collection(fbDb, "vehicles"),
                    where("lisence_plate", "==", licensePlate)
                  );
                  const vehicleSnapshot = await getDocs(vehicleQuery);

                  if (vehicleSnapshot.empty) {
                    console.log(
                      "No vehicle found for licensePlate:",
                      licensePlate
                    );
                    return null;
                  }

                  const vehicleDocs = vehicleSnapshot.docs.map(
                    async (vehicleDoc) => {
                      const vehicleData = vehicleDoc.data();
                      console.log("Vehicle Data:", vehicleData);

                      if (
                        !vehicleData.archive &&
                        vehicleData.availability_status !== "Out Of Service"
                      ) {
                        const tripQuery = query(
                          collection(fbDb, "trips"),
                          where("vehicle", "==", licensePlate),
                          where("trip_status", "==", "On Route")
                        );
                        const tripSnapshot = await getDocs(tripQuery);

                        if (tripSnapshot.empty) {
                          return licensePlate; // Return the license plate of available vehicles
                        }
                      }
                      return null;
                    }
                  );

                  const filteredVehicles = await Promise.all(vehicleDocs);
                  return filteredVehicles.filter((v) => v); // Filter out null results
                }
              );

              const vehicles = await Promise.all(vehiclesPromises);
              const availableVehicles = vehicles.flat().filter((v) => v); // Flatten and filter to remove falsy values
              console.log(
                "Available Vehicles for class",
                doc.id,
                ":",
                availableVehicles
              );

              // Ensure name is a string
              if (typeof data.name !== "string") {
                console.log("Invalid name format in class:", doc.id);
                return null;
              }

              return {
                id: doc.id,
                name: data.name,
                vehicle: availableVehicles,
              };
            })
          );

          // Filter out null results and assert the correct type
          const validCompanyDetails: {
            id: string;
            name: string;
            vehicle: string[];
          }[] = companyDetails.filter(
            (c): c is { id: string; name: string; vehicle: string[] } =>
              c !== null
          );

          setCompanies(validCompanyDetails);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchDrivers();
    fetchedTrips();
    fetchedClients();
    fetchedCompanies();
  }, [organisationId]);

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
  async function generateId(organisationId: any) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fbDb, "trips"),
          where("organisationId", "==", organisationId)
        )
      );
      const adminCount = querySnapshot.size;

      // Customize this logic based on your requirements
      return `T${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching Drivers count:", error);
      // Handle error or return a default value
      return "T001";
    }
  }

  const handleSubmit = async (values: {
    requested_by: string;
    pick_up_location: string;
    drop_off_location: string;
    vehicle: string;
    start_time: string;
    // end_time: string;
    cargo_type: string;
    cargo_quantity: string;
    memo: string;
    company: string;
    client: string;
    dealValue: number;
    fuel: number;
    mileage_fee: number;
  }) => {
    console.log("Submitted Values:", values);
    console.log("Distance handlesubmit:", distance);

    try {
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
      // const endDateObj = new Date(values.end_time + "T00:00:00");

      const startTimestamp = Timestamp.fromDate(startDateObj);
      // const endTimestamp = Timestamp.fromDate(endDateObj);

      // Find the selected driver based on the provided name
      const selectedDriver = drivers.find(
        (driver) => driver.name === values.requested_by
      );

      if (!selectedDriver) {
        console.error("Selected driver or vehicle not found");
        return;
      }
      const tripId = await generateTripId(values.vehicle, values.start_time);
      const generateTripid = await generateId(organisationId);

      const maintenanceData = {
        organisationId: organisationId,
        requested_by: {
          id: selectedDriver.id,
          name: selectedDriver.name,
          phonenumber: selectedDriver.phonenumber,
        },
        tripId: tripId,
        trip_id: generateTripid,
        vehicle: values.vehicle,
        start_time: startTimestamp,
        pick_up_location: values.pick_up_location,
        drop_off_location: values.drop_off_location,
        cargo_type: values.cargo_type,
        cargo_quantity: values.cargo_quantity,
        memo: values.memo,
        company: values.company,
        trip_status: "Booked",
        client: values.client,
        dealValue: values.dealValue,
        fuel: values.fuel,
        mileage_fee: values.mileage_fee,
        distance: distanceValue,
      };

      const docRef = await addDoc(collection(fbDb, "trips"), maintenanceData);
      console.log("Trip added with ID: ", docRef.id);
      toast.success("Trip Successfully Added.");
      const newTrip = {
        id: docRef.id,
        ...maintenanceData,
      };
      // Prepend the new driver to the fetchedDrivers state
      setfetchedTrips((prevTrip) => [newTrip, ...prevTrip]);

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
    const status = statusMap[selectedTab]; // Get the status based on the selected tab
    console.log("status:", status);

    try {
      let csvData;
      if (status === "all") {
        csvData = await exportDataToCSV(); // Export all data without filtering
      } else {
        csvData = await exportDataToCSV(status); // Export data filtered by status
      }

      // Create a blob and initiate the download
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exported-data-${status}.csv`;
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
        return filteredTrips.length;
      case 1:
        return filteredTrips.filter((trip) => {
          return trip.trip_status === "On Route";
        }).length;
      case 2:
        return filteredTrips.filter((trip) => {
          return [
            // "At the border",
            // "Offloading dest",
            "Mechanical",
            "Booked",
            // "Returning the Container",
          ].includes(trip.trip_status);
        }).length;
      case 3:
        return filteredTrips.filter((trip) => {
          return trip.trip_status === "Done";
        }).length;

      default:
        return 0;
    }
  };

  const allTripsCount = countTrips(0);
  const onRouteTripsCount = countTrips(1);
  const waitingTripsCount = countTrips(2);
  const completeTripsCount = countTrips(3);

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
              placeholder="Search by Trip ID ,Vehicle and Depature time YYYY-MM-DD"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-96"
            />
          </div>
          <div className="flex  right-4">
            <Button
              className="bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded"
              handleClick={handleAddTrip}
            >
              <>
                <PlusIcon className="h-6 w-6 mr-2" />
                Add Trip
              </>
            </Button>
            <button
              className="ml-4 bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded"
              onClick={handleExportButtonClick}
              disabled={isExporting}
            >
              <>
                <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
                Export
              </>
            </button>
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

      {open && (
        <FormModal open={open} setOpen={setOpen}>
          <div className="p-8">
            <div>
              <div className="flex w-full h-full justify-between items-center ">
                <div className="text-xl font-semibold ">New Trip</div>
                <Button
                  className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                  handleClick={handleReset}
                >
                  <XMarkIcon className="h-6 w-6 text-red-400" />
                </Button>
              </div>
              <p className="text-red-500 text-xs mt-3">
                All fields are required
              </p>
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
              validationSchema={validationSchema}
              onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values);
                // toast.success("Trip successfully saved!");
                setSubmitting(false);
                setOpen(false);
              }}
            >
              {(formik) => (
                <Form>
                  <div className="">
                    <div className="flex w-full justify-between mt-6">
                      {/* PICK UP LOCATION with Autocomplete */}
                      <div className="block">
                        <label className="form-label">PICK UP LOCATION</label>
                        <PlacesAutocomplete
                          value={formik.values.pick_up_location}
                          onChange={(address) =>
                            formik.setFieldValue("pick_up_location", address)
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
                          )}
                        </PlacesAutocomplete>
                        <ErrorMessage
                          name="pick_up_location"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </div>

                      {/* DROP OFF LOCATION with Autocomplete */}
                      <div className="block">
                        <label className="form-label">DROP OFF LOCATION</label>
                        <PlacesAutocomplete
                          value={formik.values.drop_off_location}
                          onChange={(address) =>
                            formik.setFieldValue("drop_off_location", address)
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
                          )}
                        </PlacesAutocomplete>
                        <ErrorMessage
                          name="drop_off_location"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </div>
                    </div>
                    {/* START TIME and END TIME */}
                    <div className="flex w-full justify-between mt-8">
                      <div className="block">
                        <label className="form-label">START TIME</label>
                        <Field
                          type="date"
                          value={formik.values.start_time}
                          name="start_time"
                          className="form-input bg-grey w-48"
                        />
                        <ErrorMessage
                          name="start_time"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </div>
                      <div className="block">
                        <label className="form-label">END TIME</label>
                        <Field
                          disabled
                          type="date"
                          name="end_time"
                          value={formik.values.end_time}
                          className="form-input bg-grey w-48"
                        />
                        {/* <ErrorMessage
                        name="end_time"
                        component="div"
                        className="error text-red-500 "
                      /> */}
                      </div>
                    </div>

                    <div className="flex w-full justify-between  mt-8">
                      <label className="block">
                        <label className="form-label">CLASS</label>
                        <Field
                          as="select"
                          name="company"
                          value={formik.values.company}
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
                            formik.setFieldValue(
                              "company",
                              selectedCompanyName
                            );
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
                        <ErrorMessage
                          name="company"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </label>
                      <label className="block">
                        <label className="form-label">CLIENT</label>
                        <Field
                          as="select"
                          name="client"
                          value={formik.values.client}
                          className="form-input bg-grey w-48"
                        >
                          <option value="">Select Client</option>
                          {fetchedClients.map((client, index) => (
                            <option key={index} value={client.name}>
                              {client.name}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="client"
                          component="div"
                          className="error text-red-500 "
                        />
                      </label>
                    </div>
                    <div className="mt-8 flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">SELECT DRIVER</label>
                        <Field
                          as="select"
                          name="requested_by"
                          value={formik.values.requested_by}
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
                        <ErrorMessage
                          name="company"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </label>
                      <label className="block">
                        <label className="form-label">VEHICLE</label>
                        <Field
                          as="select"
                          name="vehicle"
                          value={formik.values.vehicle}
                          className="form-input bg-grey w-48"
                        >
                          <option value="">Select Vehicle</option>
                          {selectedCompanyVehicles.map((vehicle, index) => (
                            <option key={index} value={vehicle}>
                              {vehicle}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="vehicle"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </label>
                    </div>
                    <div className="mt-8 flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">DEAL VALUE</label>
                        <Field
                          type="number"
                          name="dealValue"
                          value={formik.values.dealValue}
                          placeholder="Ksh"
                          className="form-input bg-grey w-48"
                        />
                        <ErrorMessage
                          name="dealValue"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </label>
                      <label className="block">
                        <label className="form-label">FUEL</label>
                        <Field
                          type="number"
                          name="fuel"
                          value={formik.values.fuel}
                          placeholder="Ksh"
                          className="form-input bg-grey w-48"
                        />
                        <ErrorMessage
                          name="fuel"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </label>
                    </div>
                    <div className="mt-8 flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">MILEAGE FEE</label>
                        <Field
                          type="number"
                          name="mileage_fee"
                          value={formik.values.mileage_fee}
                          placeholder="Ksh"
                          className="form-input bg-grey w-48"
                        />
                        <ErrorMessage
                          name="mileage_fee"
                          component="div"
                          className="error text-sm text-red-500 "
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
                        <ErrorMessage
                          name="distance"
                          component="div"
                          className="error text-sm text-red-500 "
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
                          value={formik.values.cargo_type}
                          className="form-input bg-grey w-48"
                        />
                        <ErrorMessage
                          name="cargo_type"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </label>
                      <label className="block mt-8">
                        <label className="form-label">CONTAINER NUMBER</label>
                        <Field
                          type="text"
                          name="cargo_quantity"
                          value={formik.values.cargo_quantity}
                          className="form-input bg-grey w-48"
                        />
                        <ErrorMessage
                          name="cargo_quantity"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </label>
                    </div>
                    <label className="block mt-8">
                      <label className="form-label">MEMO</label>
                      <Field
                        type="text"
                        name="memo"
                        value={formik.values.memo}
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
                        <option>Select Trip status</option>
                        <option value="Booked">Booked</option>
                        {/* <option value="Ready for Departure">
                          Ready for Departure
                        </option> */}
                        {/* <option value="At the border">At the border</option> */}
                        {/* <option value="Offloading dest">Offloading dest</option> */}
                        <option value="On Route">On Route</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Done">Done </option>
                        {/* <option value="Returning the Container">
                          returning with Container
                        </option> */}
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
}

interface TripsPerVehicle {
  [key: string]: {
    count: number;
    lastMonth: string;
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
  const totalTrips = filteredTrips.length;
  const totalPages = Math.ceil(totalTrips / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const router = useRouter();

  const handleTripClick = (trip: any) => {
    router.push(`Operations/Trips/viewTrip?id=${trip.id}`);
  };

  const tripsPerVehicle: TripsPerVehicle = {};
  const currentDate = new Date();

  const filteredAllocation = filteredTrips.filter((trip) => {
    const startTime = new Date(trip?.start_time?.seconds * 1000);
    const endTime = new Date(trip?.end_time?.seconds * 1000);

    switch (selectedTab) {
      case 0: // First tab: Show all trips
        return true;
      case 1: // Second tab: Trips whose status is 'On Route'
        return trip.trip_status === "On Route";
      case 2: // Second last tab: Trips with specific statuses
        return ["Mechanical", "Booked"].includes(trip.trip_status);
      case 3: // Last tab: Show completed trips ('Done')
        return trip.trip_status === "Done";
      default:
        return false;
    }
  });

  console.log("Selected Tab", selectedTab);
  const visibleTrips = filteredAllocation.slice(startIndex, endIndex);

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
