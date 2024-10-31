import { Button } from "@/components/Buttons";
import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal } from "@/components/Modals/FormModal";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import firebaseApp, { fbDb } from "@/firebase/configs";
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
  updateDoc,
  writeBatch,
  runTransaction,
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
import TripsTable from "./tripsTable";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

interface TripCounts {
  [key: string]: number;
}

interface VehicleData {
  archive: boolean;
  availability_status: string;
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
const statusMap = ["all", "onRoute", "waiting", "complete"];
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
  cargo_type: Yup.string().required("Cargo type is required"),
  cargo_quantity: Yup.string().required("Cargo quantity is required"),
  company: Yup.string().required("Class is required"),
  client: Yup.string().required("Client is required"),
  dealValue: Yup.number().positive().required("Deal Value is required"),
  fuel: Yup.number().positive().required("Fuel is required"),
  cargoSize: Yup.number().positive().required("Cargo Size is required"),
  mileage_fee: Yup.number().positive().required("Mileage Fee is required"),
  payment_status: Yup.string().required("Payment Status is required"),
});

export default function TripsComponent() {
  const [open, setOpen] = useState(false);
  const [drivers, setDrivers] = useState<
    { id: string; name: string; phonenumber: string }[]
  >([]);
  // const [companies, setCompanies] = useState<
  //   { id: string; name: string; vehicle: string[] }[]
  // >([]);
  const [selectedCompanyVehicles, setSelectedCompanyVehicles] = useState<
    string[]
  >([]);
  const [companyDetailsFetched, setCompanyDetailsFetched] = useState(false);
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
    departmentData,
  } = useAuthContext();
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
  const [cargos, setCargos] = useState<string[]>([]);
  const [vehicle, setVehicles] = useState<string[]>([]);

  const [companies, setCompanies] = useState<string[]>([]);

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
    start_time: "",
    end_time: "",
    cargo_type: "",
    cargo_quantity: "",
    memo: "",
    trip_status: "",
    organisationId: "",
    dealValue: 0,
    fuel: 0,
    mileage_fee: 0,
    distance: "",
    timestamp: "",
    company: "",
    client: "",
    payment_status: "",
    paid_amount: 0,
    remaining_amount: 0,
    excess_weight_fee: null,
    t1_form: null,
    interchange_documents: null,
    cargoSize: 0,
    addedBy: "",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim().toLowerCase();
    console.log("Search Query:", query);
    setSearchQuery(query);

    setFilteredTrips(
      fetchedTrips.filter((trip) => {
        const vehicleMatch = `${trip.vehicle}`.toLowerCase().includes(query);
        const tripIdMatch = `${trip.trip_id}`.toLowerCase().includes(query);

        // Safely handle undefined end_time
        const startTime = trip.start_time
          ? `${trip.start_time}`.toLowerCase()
          : "";
        const endTime = trip.end_time ? `${trip.end_time}`.toLowerCase() : "";

        // Compare with query
        const startTimeMatch = startTime.includes(query);
        const endTimeMatch = endTime.includes(query);

        // Format the start time for display
        const start = trip.start_time
          ? formatDate(new Date(trip.start_time.seconds * 1000))
          : "N/A";
        console.log("start", start);
        console.log("startTimeMatch", startTimeMatch);
        console.log("endTimeMatch", endTimeMatch);
        console.log("searchQuery", searchQuery);

        return vehicleMatch || startTimeMatch || tripIdMatch || endTimeMatch;
      })
    );
  };

  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Formats date as "dd/MM/YYYY"
  }

  const handleAddTrip = () => {
    setOpen(true);
  };

  const handleReset = () => {
    setOpen(false);
  };

  // const updateSelectedCompanyVehicles = (companyName: string) => {
  //   if (companyName) {
  //     const company = companies.find((company) => company.name === companyName);
  //     if (company) {
  //       setSelectedCompanyVehicles(company.vehicle);
  //       console.log(setSelectedCompanyVehicles);
  //     }
  //   } else {
  //     setSelectedCompanyVehicles([]);
  //   }
  // };

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
    // const fetchedCompanies = async () => {
    //   try {
    //     if (organisationId) {
    //       const q = query(
    //         collection(fbDb, "classes"),
    //         where("organisationId", "==", organisationId),
    //         where("archive", "==", false)
    //       );
    //       const querySnapshot = await getDocs(q);

    //       if (querySnapshot.empty) {
    //         console.log(
    //           "No classes found for the organisationId:",
    //           organisationId
    //         );
    //         return;
    //       }

    //       const companyDetails = await Promise.all(
    //         querySnapshot.docs.map(async (doc) => {
    //           const data = doc.data();
    //           console.log("Class Data:", data);

    //           if (!data.vehicle || !Array.isArray(data.vehicle)) {
    //             console.log(
    //               "No vehicles or invalid vehicle format in class:",
    //               doc.id
    //             );
    //             return null;
    //           }

    //           const vehiclesPromises = data.vehicle.map(
    //             async (licensePlate: string) => {
    //               const vehicleQuery = query(
    //                 collection(fbDb, "vehicles"),
    //                 where("lisence_plate", "==", licensePlate)
    //               );
    //               const vehicleSnapshot = await getDocs(vehicleQuery);

    //               if (vehicleSnapshot.empty) {
    //                 console.log(
    //                   "No vehicle found for licensePlate:",
    //                   licensePlate
    //                 );
    //                 return null;
    //               }

    //               const vehicleDocs = vehicleSnapshot.docs.map(
    //                 async (vehicleDoc) => {
    //                   const vehicleData = vehicleDoc.data();
    //                   console.log("Vehicle Data:", vehicleData);

    //                   if (
    //                     !vehicleData.archive &&
    //                     vehicleData.availability_status !== "Out Of Service"
    //                   ) {
    //                     const tripQuery = query(
    //                       collection(fbDb, "trips"),
    //                       where("vehicle", "==", licensePlate),
    //                       where("trip_status", "==", "On Route")
    //                     );
    //                     const tripSnapshot = await getDocs(tripQuery);

    //                     if (tripSnapshot.empty) {
    //                       return licensePlate; // Return the license plate of available vehicles
    //                     }
    //                   }
    //                   return null;
    //                 }
    //               );

    //               const filteredVehicles = await Promise.all(vehicleDocs);
    //               return filteredVehicles.filter((v) => v); // Filter out null results
    //             }
    //           );

    //           const vehicles = await Promise.all(vehiclesPromises);
    //           const availableVehicles = vehicles.flat().filter((v) => v); // Flatten and filter to remove falsy values
    //           console.log(
    //             "Available Vehicles for class",
    //             doc.id,
    //             ":",
    //             availableVehicles
    //           );

    //           // Ensure name is a string
    //           if (typeof data.name !== "string") {
    //             console.log("Invalid name format in class:", doc.id);
    //             return null;
    //           }

    //           return {
    //             id: doc.id,
    //             name: data.name,
    //             vehicle: availableVehicles,
    //           };
    //         })
    //       );

    //       // Filter out null results and assert the correct type
    //       const validCompanyDetails: {
    //         id: string;
    //         name: string;
    //         vehicle: string[];
    //       }[] = companyDetails.filter(
    //         (c): c is { id: string; name: string; vehicle: string[] } =>
    //           c !== null
    //       );

    //       setCompanies(validCompanyDetails);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching companies:", error);
    //   }
    // };

    const fetchedCompanies = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "classes"),
            where("organisationId", "==", organisationId),
            where("archive", "==", false) // Only fetch drivers where archive is false
          );
          const querySnapshot = await getDocs(q);
          const names = querySnapshot.docs.map((doc) => doc.data().name);
          setCompanies(names);
          console.log("Classes:", names);
        }
      } catch (error) {
        console.error("Error fetching Class names:", error);
      }
    };

    const fetchCargo = async () => {
      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "cargos"),
            where("organisationId", "==", organisationId),
            where("archive", "==", false) // Only fetch drivers where archive is false
          );
          const querySnapshot = await getDocs(q);
          const names = querySnapshot.docs.map((doc) => doc.data().name);
          setCargos(names);
          console.log("Cargos:", names);
        }
      } catch (error) {
        console.error("Error fetching Cargo names:", error);
      }
    };
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
          setVehicles(names);
        }
      } catch (error) {
        console.error("Error fetching Vehicle names:", error);
      }
    };
    fetchCargo();
    fetchDrivers();
    fetchedTrips();
    fetchedClients();
    fetchedCompanies();
    fetchVehicleNames();
  }, [organisationId]);

  function convertToDate(firestoreTimestamp: any) {
    if (firestoreTimestamp instanceof Timestamp) {
      return firestoreTimestamp.toDate();
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
      fuel: trip.fuel,
      dealValue: trip.dealValue,
      mileage_fee: trip.mileage_fee,
      distance: trip.distance,
      timestamp: trip.timestamp,
      company: trip.company,
      client: trip.client,
      payment_status: trip.payment_status,
      paid_amount: trip.paid_amount,
      remaining_amount: trip.remaining_amount,
      excess_weight_fee: trip.excess_weight_fee,
      t1_form: trip.t1_form,
      interchange_documents: trip.interchange_documents,
      cargoSize: trip.cargoSize,
      addedBy: trip.addedBy,
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
    fuel: any;
    dealValue: any;
    mileage_fee: any;
    distance: any;
    timestamp: any;
    company: any;
    client: any;
    payment_status: any;
    paid_amount: any;
    remaining_amount: any;
    excess_weight_fee: any;
    t1_form: any;
    interchange_documents: any;
    cargoSize: any;
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
        dealValue: values.dealValue,
        fuel: values.fuel,
        mileage_fee: values.mileage_fee,
        distance: values.distance,
        timestamp: values.timestamp,
        company: values.company,
        client: values.client,
        payment_status: values.payment_status,
        paid_amount: values.paid_amount,
        remaining_amount: values.remaining_amount,
        excess_weight_fee: values.excess_weight_fee,
        t1_form: values.t1_form,
        interchange_documents: values.interchange_documents,
        cargoSize: values.cargoSize,
        addedBy: currentUser?.email,
      });

      // Update the local fetchedVehicles state

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

  async function generateId(organisationId: string) {
    const counterRef = doc(fbDb, "organisationTripCounters", organisationId);

    try {
      const tripId = await runTransaction(fbDb, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newTripCount = 1;

        if (counterDoc.exists()) {
          newTripCount = counterDoc.data().tripCounter + 1;
          transaction.update(counterRef, { tripCounter: newTripCount });
        } else {
          transaction.set(counterRef, { tripCounter: newTripCount });
        }

        return `T${newTripCount.toString().padStart(3, "0")}`;
      });

      return tripId;
    } catch (error) {
      console.error("Error generating trip ID:", error);
      // return "T001"; // Return default value in case of an error
    }
  }

  const storage = getStorage(firebaseApp); // Initialize once

  const uploadFile = async (folder: any, file: any) => {
    const storageRef = ref(storage, `${folder}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  async function handleSubmit(values: {
    requested_by: string;
    pick_up_location: string;
    drop_off_location: string;
    vehicle: string;
    start_time: string;
    cargo_type: string;
    cargo_quantity: string;
    memo: string;
    company: string;
    client: string;
    dealValue: number;
    fuel: number;
    mileage_fee: number;
    payment_status: string;
    paid_amount: number;
    remaining_amount: number;
    excess_weight_fee: any;
    t1_form: any;
    interchange_documents: any;
    cargoSize: number;
  }) {
    try {
      const startDateObj = new Date(values.start_time + "T00:00:00");
      const startTimestamp = Timestamp.fromDate(startDateObj);

      if (!organisationId) {
        console.error("organisationId is required but was null or undefined.");
        return;
      }
      const [
        distanceValue,
        [excessWeightFeeUrl, t1FormUrl, interchangeDocumentsUrl],
        generateTripId,
      ] = await Promise.all([
        fetchDistance(values.pick_up_location, values.drop_off_location),
        Promise.all([
          values.excess_weight_fee && values.excess_weight_fee.size
            ? uploadFile("excess_weight_fee", values.excess_weight_fee)
            : Promise.resolve(""),
          values.t1_form && values.t1_form.size
            ? uploadFile("t1_form", values.t1_form)
            : Promise.resolve(""),
          values.interchange_documents && values.interchange_documents.size
            ? uploadFile("interchange_documents", values.interchange_documents)
            : Promise.resolve(""),
        ]),
        generateId(organisationId),
      ]);

      const selectedDriver = drivers.find(
        (driver) => driver.name === values.requested_by
      );

      if (!selectedDriver) {
        console.error("Selected driver or vehicle not found");
        return;
      }

      // Prepare trip data to be saved in Firestore
      const tripData = {
        organisationId: organisationId,
        requested_by: {
          id: selectedDriver.id,
          name: selectedDriver.name,
          phonenumber: selectedDriver.phonenumber,
        },
        trip_id: generateTripId,
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
        timestamp: Timestamp.now(),
        payment_status: values.payment_status,
        paid_amount: values.paid_amount,
        remaining_amount: values.remaining_amount,
        excess_weight_fee: excessWeightFeeUrl,
        t1_form: t1FormUrl,
        interchange_documents: interchangeDocumentsUrl,
        cargoSize: values.cargoSize,
        addedBy: currentUser?.email,
      };

      // Use a batch write to save data faster
      const batch = writeBatch(fbDb);
      const docRef = doc(collection(fbDb, "trips"));
      batch.set(docRef, tripData);

      await batch.commit(); // Commit batch write

      console.log("Trip added with ID: ", docRef.id);
      toast.success("Trip Successfully Added.");

      // Update state asynchronously after batch commit
      setOpen(false);
    } catch (error) {
      console.error("Error adding Trip:", error);
      toast.error("Error adding Trip. Please try again.");
    }
  }

  const handleCompanyChange = (selectedCompanyName: SetStateAction<string>) => {
    setSelectedCompany(selectedCompanyName);
  };
  const handleExportButtonClick = async () => {
    setIsExporting(true);
    const status = statusMap[selectedTab]; // Get the status based on the selected tab
    console.log("status:", status);

    if (!organisationId) {
      console.error("Organisation ID is null or undefined.");
      setIsExporting(false);
      return;
    }

    try {
      let csvData;
      if (status === "all") {
        csvData = await exportDataToCSV(organisationId); // Export all data without filtering
      } else {
        csvData = await exportDataToCSV(organisationId, status); // Export data filtered by status
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
  const uploadImage = async (file: File, folder: string) => {
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `${folder}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const allTripsCount = countTrips(0);
  const onRouteTripsCount = countTrips(1);
  const waitingTripsCount = countTrips(2);
  const completeTripsCount = countTrips(3);

  const hasExportPermission =
    userClaims?.additionalPermissions?.includes("Export Trip") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Export Trip");

  const hasAddPermission =
    userClaims?.additionalPermissions?.includes("Add Trip") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Add Trip");
  const hasViewTripermission =
    userClaims?.additionalPermissions?.includes("View Trip Detail") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("View Trip Detail");
  const hasEditTripermission =
    userClaims?.additionalPermissions?.includes("Edit Trip") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Edit Trip");

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
            {hasAddPermission && (
              <Button
                className="bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded"
                handleClick={handleAddTrip}
              >
                <>
                  <PlusIcon className="h-6 w-6 mr-2" />
                  Add Trip
                </>
              </Button>
            )}

            {hasExportPermission && (
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
            )}
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
                    hasViewTripermission={hasViewTripermission}
                    hasEditTripermission={hasEditTripermission}
                  />
                </div>
              ) : (
                <div className="overflow-y-auto">
                  <TripsTable
                    selectedTab={selectedTab}
                    trips={fetchedTrips}
                    filteredTrips={filteredTrips}
                    handleEditClick={handleEditClick}
                    hasViewTripermission={hasViewTripermission}
                    hasEditTripermission={hasEditTripermission}
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
                  hasViewTripermission={hasViewTripermission}
                  hasEditTripermission={hasEditTripermission}
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
                  hasViewTripermission={hasViewTripermission}
                  hasEditTripermission={hasEditTripermission}
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
                  hasViewTripermission={hasViewTripermission}
                  hasEditTripermission={hasEditTripermission}
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
                cargoSize: 0,
                mileage_fee: 0,
                payment_status: "",
                paid_amount: 0,
                remaining_amount: 0,
                excess_weight_fee: null,
                t1_form: null,
                interchange_documents: null,
              }}
              validationSchema={validationSchema}
              onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values);
                setSubmitting(false);
                setOpen(false);
              }}
            >
              {(formik) => {
                // Move useEffect outside of Formik render method
                // const calculateRemainingAmount = (
                //   dealValue: any,
                //   paidAmount: any,
                //   paymentStatus: any
                // ) => {
                //   let remainingAmount = 0;

                //   if (paymentStatus === "Partially Paid") {
                //     remainingAmount = dealValue - paidAmount;
                //   } else if (paymentStatus === "Paid") {
                //     remainingAmount = 0;
                //   } else if (paymentStatus === "Not Paid") {
                //     remainingAmount = dealValue;
                //   }

                //   formik.setFieldValue("remaining_amount", remainingAmount);
                // };
                const calculateRemainingAmount = (
                  dealValue: number,
                  paidAmount: number,
                  paymentStatus: string
                ) => {
                  let remainingAmount = 0;

                  if (paymentStatus === "Paid") {
                    paidAmount = dealValue; // Set paidAmount to dealValue if fully paid
                    remainingAmount = 0;
                  } else if (paymentStatus === "Partially Paid") {
                    remainingAmount = dealValue - paidAmount;
                  } else if (paymentStatus === "Not Paid") {
                    paidAmount = 0; // Set paidAmount to 0 if not paid
                    remainingAmount = dealValue;
                  }

                  formik.setFieldValue("paid_amount", paidAmount); // Update paidAmount
                  formik.setFieldValue("remaining_amount", remainingAmount); // Update remainingAmount
                };

                return (
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
                          <label className="form-label">
                            DROP OFF LOCATION
                          </label>
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
                        </div>
                      </div>

                      <div className="flex w-full justify-between  mt-8">
                        <label className="block">
                          <label className="form-label">CLASS</label>
                          <Field
                            as="select"
                            name="company"
                            value={formik.values.company}
                            className="form-input bg-grey w-48"
                          >
                            <option value="">Select Class</option>
                            {companies.map((company, index) => (
                              <option key={index} value={company}>
                                {company}
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
                            name="requested_by"
                            component="div"
                            className="error text-sm text-red-500"
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
                            {/* <option value="">Select Vehicle</option>
                            {selectedCompanyVehicles.map((vehicle, index) => (
                              <option key={index} value={vehicle}>
                                {vehicle}
                              </option>
                            ))} */}

                            <option value="">Select Vehicle</option>
                            {vehicle.map((vehicle, index) => (
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
                            onChange={(e: any) => {
                              const dealValue = Number(e.target.value);
                              formik.setFieldValue("dealValue", dealValue);
                              calculateRemainingAmount(
                                dealValue,
                                formik.values.paid_amount,
                                formik.values.payment_status
                              );
                            }}
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
                      <div className="mt-8 flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">PAYMENT STATUS</label>

                          <Field
                            // as="select"
                            // type="text"
                            // name="payment_status"
                            // className="form-input bg-grey w-48"
                            // onChange={(e: any) => {
                            //   const paymentStatus = e.target.value;
                            //   formik.setFieldValue(
                            //     "payment_status",
                            //     paymentStatus
                            //   );
                            //   calculateRemainingAmount(
                            //     formik.values.dealValue,
                            //     formik.values.paid_amount,
                            //     paymentStatus
                            //   );
                            // }}
                            as="select"
                            name="payment_status"
                            className="form-input bg-grey w-48"
                            onChange={(e: any) => {
                              const paymentStatus = e.target.value;
                              formik.setFieldValue(
                                "payment_status",
                                paymentStatus
                              );
                              calculateRemainingAmount(
                                formik.values.dealValue,
                                formik.values.paid_amount,
                                paymentStatus
                              );
                            }}
                          >
                            <option>Select Payment Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">
                              Partially Paid
                            </option>
                            <option value="Not Paid">Not Paid</option>
                          </Field>
                          <ErrorMessage
                            name="payment_status"
                            component="div"
                            className="error text-sm text-red-500 "
                          />
                          {/* {formik.values.payment_status ===
                            "Partially Paid" && (
                            <div className="mt-8">
                              <label className="block">
                                <label className="form-label">
                                  PAID AMOUNT
                                </label>
                                <Field
                                  type="number"
                                  name="paid_amount"
                                  placeholder="Ksh"
                                  className="form-input bg-grey w-48"
                                  onChange={(e: any) => {
                                    const paidAmount = Number(e.target.value);
                                    formik.setFieldValue(
                                      "paid_amount",
                                      paidAmount
                                    );
                                    calculateRemainingAmount(
                                      formik.values.dealValue,
                                      paidAmount,
                                      formik.values.payment_status
                                    );
                                  }}
                                />
                              </label>
                            </div>
                          )} */}
                          {formik.values.payment_status ===
                            "Partially Paid" && (
                            <div className="mt-8">
                              <label className="block">
                                <label className="form-label">
                                  PAID AMOUNT
                                </label>
                                <Field
                                  type="number"
                                  name="paid_amount"
                                  placeholder="Ksh"
                                  className="form-input bg-grey w-48"
                                  onChange={(e: any) => {
                                    const paidAmount = Number(e.target.value);
                                    formik.setFieldValue(
                                      "paid_amount",
                                      paidAmount
                                    );
                                    calculateRemainingAmount(
                                      formik.values.dealValue,
                                      paidAmount,
                                      formik.values.payment_status
                                    );
                                  }}
                                />
                              </label>
                            </div>
                          )}
                        </label>
                        <label className="block">
                          <label className="form-label">REMAINING AMOUNT</label>
                          <Field
                            type="text"
                            disabled
                            name="remaining_amount"
                            value={formik.values.remaining_amount}
                            className="form-input bg-grey w-48"
                          />
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">T1 FORM</label>
                          <Field name="t1_form">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".jpeg, .jpg, .pdf, .png"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("t1_form", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                        </label>

                        <label className="block">
                          <label className="form-label">
                            Excess Weight Fee Documentation
                          </label>
                          <Field name="excess_weight_fee">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".jpeg, .jpg, .pdf, .png"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue(
                                      "excess_weight_fee",
                                      file
                                    );
                                  }
                                }}
                              />
                            )}
                          </Field>
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">
                            INTERCHANGE DOCUMENTS
                          </label>
                          <Field name="interchange_documents">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".jpeg, .jpg, .pdf, .png"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue(
                                      "interchange_documents",
                                      file
                                    );
                                  }
                                }}
                              />
                            )}
                          </Field>
                        </label>
                      </div>

                      <p className="mt-5 font-semibold"> CARGO</p>
                      <div className="flex w-full justify-between">
                        <label className="block mt-8">
                          <label className="form-label">CARGO TYPE</label>
                          <Field
                            as="select"
                            name="cargo_type"
                            value={formik.values.cargo_type}
                            className="form-input bg-grey w-48"
                          >
                            <option value="">Select Cargo Type</option>
                            {cargos.map((cargo, index) => (
                              <option key={index} value={cargo}>
                                {cargo}
                              </option>
                            ))}
                          </Field>
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
                        <label className="form-label">CARGO SIZE</label>
                        <Field
                          type="number"
                          name="cargoSize"
                          value={formik.values.cargoSize}
                          placeholder="ft"
                          className="form-input bg-grey w-48"
                        />
                        <ErrorMessage
                          name="cargoSize"
                          component="div"
                          className="error text-sm text-red-500 "
                        />
                      </label>
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
                );
              }}
            </Formik>
          </div>
        </FormModal>
      )}

      {editModalOpen && selectedTrip && (
        <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
          <div className="p-8">
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
              // onSubmit={handleEditSubmit}
              onSubmit={(values, { setSubmitting }) => {
                handleEditSubmit(values);
                setSubmitting(false);
                setOpen(false);
                handleEditModalClose(); // Close the modal after submitting
              }}
            >
              {(formik) => {
                // Move useEffect outside of Formik render method
                const calculateEditRemainingAmount = (
                  dealValue: number,
                  paidAmount: number
                ) => {
                  let remainingAmount = dealValue - paidAmount;
                  formik.setFieldValue("remaining_amount", remainingAmount);
                  console.log("remainingAmount", remainingAmount);
                };
                const changePaymentStatus = (
                  dealValue: number,
                  paidAmount: number
                ) => {
                  if (paidAmount === dealValue) {
                    formik.setFieldValue("payment_status", "Paid");
                  }
                };

                return (
                  <Form>
                    <div className="">
                      <div className="flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">PICK UP LOCATION</label>
                          <Field
                            disabled
                            type="text"
                            name="pick_up_location"
                            value={formik.values.pick_up_location}
                            className="form-input bg-grey w-48"
                          />
                        </label>
                        <label className="block">
                          <label className="form-label">
                            DROP OFF LOCATION
                          </label>
                          <Field
                            disabled
                            type="text"
                            name="drop_off_location"
                            value={formik.values.drop_off_location}
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
                            value={formik.values.start_time}
                            className="form-input bg-grey w-48"
                          />
                        </label>
                        <label className="block">
                          <label className="form-label">END TIME</label>
                          <Field
                            type="date"
                            name="end_time"
                            value={formik.values.end_time}
                            className="form-input bg-grey w-48"
                          />
                        </label>
                      </div>
                      <div className="flex w-full justify-between  mt-8">
                        <label className="block">
                          <label className="form-label">CLASS</label>
                          <Field
                            disabled
                            name="requested_by"
                            value={formik.values.company}
                            className="form-input bg-grey w-48"
                          ></Field>
                        </label>
                        <label className="block">
                          <label className="form-label">SELECT CLIENT</label>.
                          <Field
                            disabled
                            name="vehicle"
                            value={formik.values.client}
                            className="form-input bg-grey w-48"
                          ></Field>
                        </label>
                      </div>

                      <div className="flex w-full justify-between  mt-8">
                        <label className="block">
                          <label className="form-label">SELECT DRIVER</label>
                          <Field
                            disabled
                            name="requested_by"
                            value={formik.values.requested_by.name}
                            className="form-input bg-grey w-48"
                          ></Field>
                        </label>
                        <label className="block">
                          <label className="form-label">VEHICLE</label>.
                          <Field
                            disabled
                            name="vehicle"
                            value={formik.values.vehicle}
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
                            value={formik.values.dealValue}
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
                            value={formik.values.fuel}
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
                            value={formik.values.mileage_fee}
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
                            value={formik.values.distance}
                            className="form-input bg-grey w-48"
                          />
                        </label>
                      </div>
                      <div className="mt-8 flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">PAYMENT STATUS</label>

                          <Field
                            as="select"
                            type="text"
                            name="payment_status"
                            className="form-input bg-grey w-48"
                            disabled
                            value={formik.values.payment_status}
                            onChange={(e: any) => {
                              const paymentStatus = e.target.value;
                              formik.setFieldValue(
                                "payment_status",
                                paymentStatus
                              );

                              // Optionally reset paid_amount if payment status changes
                              if (paymentStatus === "Not Paid") {
                                formik.setFieldValue("paid_amount", 0);
                                calculateEditRemainingAmount(
                                  formik.values.dealValue,
                                  0
                                );
                              }
                            }}
                          >
                            <option>Select Payment Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">
                              Partially Paid
                            </option>
                            <option value="Not Paid">Not Paid</option>
                          </Field>

                          {formik.values.payment_status === "Partially Paid" ||
                          formik.values.payment_status === "Not Paid" ? (
                            <div className="mt-8">
                              <label className="block">
                                <label className="form-label">
                                  PAID AMOUNT
                                </label>
                                <Field
                                  type="number"
                                  name="paid_amount"
                                  placeholder="Ksh"
                                  className="form-input bg-grey w-48"
                                  onChange={(e: any) => {
                                    const paidAmount = Number(e.target.value);
                                    formik.setFieldValue(
                                      "paid_amount",
                                      paidAmount
                                    );
                                    calculateEditRemainingAmount(
                                      formik.values.dealValue,
                                      paidAmount
                                    );
                                  }}
                                />
                              </label>
                            </div>
                          ) : null}
                        </label>
                        <label className="block">
                          <label className="form-label">REMAINING AMOUNT</label>
                          <Field
                            type="text"
                            disabled
                            name="remaining_amount"
                            value={formik.values.remaining_amount}
                            className="form-input bg-grey w-48"
                          />
                        </label>
                      </div>

                      <div className="mt-8 flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">T1 FORM</label>
                          <div className="">
                            <Field name="t1_form" disabled>
                              {({ field, form }: any) => (
                                <input
                                  type="file"
                                  disabled
                                  onChange={(event) => {
                                    const file =
                                      event.currentTarget?.files?.[0];
                                    if (file) {
                                      form.setFieldValue("t1_form", file);
                                    }
                                  }}
                                />
                              )}
                            </Field>
                            {formik.values.t1_form &&
                            typeof formik.values.t1_form === "string" ? (
                              <div className="mt-5">
                                <a
                                  href={formik.values.t1_form}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  View T1 Form
                                </a>
                              </div>
                            ) : null}
                          </div>
                        </label>

                        <label className="block">
                          <label className="form-label">
                            EXCESS WEIGHT FEE DOCUMENT
                          </label>
                          <div className="">
                            <Field name="excess_weight_fee" disabled>
                              {({ field, form }: any) => (
                                <input
                                  type="file"
                                  disabled
                                  onChange={(event) => {
                                    const file =
                                      event.currentTarget?.files?.[0];
                                    if (file) {
                                      form.setFieldValue(
                                        "excess_weight_fee",
                                        file
                                      );
                                    }
                                  }}
                                />
                              )}
                            </Field>
                            {formik.values.excess_weight_fee &&
                            typeof formik.values.excess_weight_fee ===
                              "string" ? (
                              <div className="mt-5">
                                <a
                                  href={formik.values.excess_weight_fee}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  View Excess Weight Fee Document
                                </a>
                              </div>
                            ) : null}
                          </div>
                        </label>
                      </div>

                      <div className="mt-8 flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">
                            INTERCHANGE DOCUMENT
                          </label>
                          <div className="">
                            <Field name="interchange_documents" disabled>
                              {({ field, form }: any) => (
                                <input
                                  type="file"
                                  disabled
                                  onChange={(event) => {
                                    const file =
                                      event.currentTarget?.files?.[0];
                                    if (file) {
                                      form.setFieldValue(
                                        "interchange_documents",
                                        file
                                      );
                                    }
                                  }}
                                />
                              )}
                            </Field>
                            {formik.values.interchange_documents &&
                            typeof formik.values.interchange_documents ===
                              "string" ? (
                              <div className="mt-5">
                                <a
                                  href={formik.values.interchange_documents}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  View Interchange Document
                                </a>
                              </div>
                            ) : null}
                          </div>
                        </label>
                        <label className="block">
                          <label className="form-label">EDITED BY</label>
                          <Field
                            type="text"
                            disabled
                            name="addedBy"
                            value={formik.values.addedBy}
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
                            value={formik.values.cargo_type}
                            className="form-input bg-grey w-48"
                          />
                        </label>
                        <label className="block mt-8">
                          <label className="form-label">CONTAINER NUMBER</label>
                          <Field
                            disabled
                            type="text"
                            name="cargo_quantity"
                            value={formik.values.cargo_quantity}
                            className="form-input bg-grey w-48"
                          />
                        </label>
                      </div>

                      <div className="flex w-full justify-between">
                        <label className="block mt-8">
                          <label className="form-label">CARGO SIZE</label>
                          <Field
                            type="number"
                            name="cargoSize"
                            value={formik.values.cargoSize}
                            placeholder="ft"
                            className="form-input bg-grey w-48"
                          />
                        </label>

                        <div className="flex w-full justify-between"></div>
                        <label className="block mt-8">
                          <label className="form-label">TRIP STATUS</label>

                          <Field
                            as="select"
                            name="trip_status"
                            value={formik.values.trip_status}
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
                      </div>

                      <label className="block mt-8">
                        <label className="form-label">Memo</label>
                        <Field
                          type="text"
                          name="memo"
                          value={formik.values.memo}
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
                );
              }}
            </Formik>
          </div>
        </FormModal>
      )}
    </div>
  );
}
