import { Tab } from "@headlessui/react";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { AddButton, Button, EditBtn } from "@/components/Buttons";
import { Formik, Field, Form } from "formik/dist/index";
import { FormModal } from "@/components/Modals/FormModal";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  DocumentData,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import {
  FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import * as Yup from "yup";
import VehiclesTable from "./vehiclesTable";
import Image from "next/image";

interface Vehicle {
  id: string;
  lisence_plate: string;
}
interface VehicleProps {
  hasAllocatePermission: any;
  hasAddPermission: any;
  hasEditVehiclesPermission: any;
  hasArchivePermission: any;
}

const Headers = ["VEHICLE ID", "VEHICLE TYPE", "LICENSE PLATE"];
export default function Vehicles({
  hasAllocatePermission,
  hasAddPermission,
  hasEditVehiclesPermission,
  hasArchivePermission,
}: VehicleProps) {
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<DocumentData | null>(
    null
  );
  const [unallocatedVehicles, setUnallocatedVehicles] = useState<Vehicle[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);
  const [fetchedCompanies, setFetchedCompanies] = useState<DocumentData[]>([]);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    cargo_capacity: "",
    lisence_plate: "",
    vehicle_type: "",
    make: "",
    model: "",
    year: 0,
    ownership_status: "",
    lease_amount: 0,
    purchase_price: 0,
    truck_incurance: null,
    cargo_insurance: null,
    port_entry_permits: null,
    inspection_certificates: null,
    transit_permits: null,
    status: true,
    archive: false,
    registration_date: Date,
    availability_status: "",
    vehiclesId: "", // Assign the result of the function
    organisationId: "",
    timestamp: "",
    addedBy: "",
  });
  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
    departmentData,
  } = useAuthContext();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const validationSchema = Yup.object({
    cargo_capacity: Yup.string().required("Cargo Capacity is required"),
    lisence_plate: Yup.string().required(
      "Vehicle Identification Number is required"
    ),
    vehicle_type: Yup.string().required("vehicle_type is required"),
    make: Yup.string().required("Make is required"),
    model: Yup.string().required("Model  is required"),
    year: Yup.string().required("Year is required"),
    ownership_status: Yup.string().required("Ownership Status is required"),
    truck_incurance: Yup.mixed().required("Truck incurance is required"),
    cargo_insurance: Yup.mixed().required("Cargo Insurance is required"),
    port_entry_permits: Yup.mixed().required("Port Entry Permits is required"),
    inspection_certificates: Yup.mixed().required(
      "Inspection Certificates is required"
    ),
    transit_permits: Yup.mixed().required("Transit Permits Fee is required"),
  });

  const allocationValidationSchema = Yup.object({
    vehicle: Yup.string().required("Vehicle is required"),
    company: Yup.string().required("Company is required"),
  });

  const handleAllocateReset = () => {
    setShowAllocateModal(false);
    setOpen(false);
  };

  const handleEditClick = (vehicle: DocumentData) => {
    setSelectedVehicle(vehicle);
    setEditFormInitialValues({
      cargo_capacity: vehicle.cargo_capacity,
      lisence_plate: vehicle.lisence_plate,
      vehicle_type: vehicle.vehicle_type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      ownership_status: vehicle.ownership_status,
      lease_amount: vehicle.lease_amount,
      purchase_price: vehicle.purchase_price,
      truck_incurance: vehicle.truck_incurance,
      cargo_insurance: vehicle.cargo_insurance,
      port_entry_permits: vehicle.port_entry_permits,
      inspection_certificates: vehicle.inspection_certificates,
      transit_permits: vehicle.transit_permits,
      status: vehicle.status,
      archive: vehicle.archive,
      registration_date: vehicle.registration_date,
      availability_status: vehicle.availability_status,
      vehiclesId: vehicle.vehiclesId, // Assign the result of the function
      organisationId: vehicle.organisationId,
      timestamp: vehicle.timestamp,
      addedBy: vehicle.addedBy,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedVehicle(null);
    setEditModalOpen(false);
  };

  const handleAllocateVehicles = () => {
    setOpen(true);
    setShowAllocateModal(true);
    setShowAddVehicleModal(false);
  };
  const handleAddVehicles = () => {
    setOpen(true);
    setShowAddVehicleModal(true);
    setShowAllocateModal(false);
  };
  const handleReset = () => {
    setOpen(false);
    setShowAddVehicleModal(false);
  };
  async function generateVehicleId(organisationId: string) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fbDb, "vehicles"),
          where("organisationId", "==", organisationId)
        )
      );
      const adminCount = querySnapshot.size;

      return `V${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching Vehicles count:", error);
      return "V001";
    }
  }

  // const uploadFile = async (storage: any, folder: any, file: any) => {
  //   const storageRef = ref(storage, `${folder}/${file.name}`);
  //   await uploadBytes(storageRef, file);
  //   return getDownloadURL(storageRef);
  // };
  const storage = getStorage(firebaseApp); // Initialize once

  const uploadFile = async (folder: any, file: any) => {
    const storageRef = ref(storage, `${folder}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (values: {
    cargo_capacity: any;
    lisence_plate: any;
    vehicle_type: any;
    make: any;
    model: any;
    year: any;
    ownership_status: any;
    lease_amount: any;
    purchase_price: any;
    truck_incurance: any;
    cargo_insurance: any;
    port_entry_permits: any;
    inspection_certificates: any;
    transit_permits: any;
  }) => {
    setShowAddVehicleModal(true);
    setOpen(true);
    console.log("Submitted Values", values);

    const registration_date = new Date();
    const vehiclesCollection = collection(fbDb, "vehicles");

    const existingDepartmentQuery = query(
      collection(fbDb, "vehicles"),
      where("lisence_plate", "==", values.lisence_plate),
      where("organisationId", "==", organisationId)
    );

    const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);

    if (!existingDepartmentSnapshot.empty) {
      console.error(
        "Vehicle with this license plate already exists in the same organisation"
      );
      toast.error(
        `A Vehicle with the vehicle identification number  '${values.lisence_plate}' already exists`
      );
      return;
    }

    if (organisationId === null) {
      console.error("organisationId is null");
      // Handle the null case, maybe show an error or return
      return;
    }
    // let truckIncuranceUrl = "";
    // if (values.truck_incurance) {
    //   const storage = getStorage(firebaseApp);
    //   const storageRef = ref(
    //     storage,
    //     `truck_incurance/${values.truck_incurance.name}`
    //   );

    //   await uploadBytes(storageRef, values.truck_incurance);
    //   truckIncuranceUrl = await getDownloadURL(storageRef);
    // }
    // let transitPermitsUrl = "";
    // if (values.transit_permits) {
    //   const storage = getStorage(firebaseApp);
    //   const storageRef = ref(
    //     storage,
    //     `transit_permits/${values.transit_permits.name}`
    //   );

    //   await uploadBytes(storageRef, values.transit_permits);
    //   transitPermitsUrl = await getDownloadURL(storageRef);
    // }
    // let inspectionCertificatesUrl = "";
    // if (values.inspection_certificates) {
    //   const storage = getStorage(firebaseApp);
    //   const storageRef = ref(
    //     storage,
    //     `inspection_certificates/${values.inspection_certificates.name}`
    //   );

    //   await uploadBytes(storageRef, values.inspection_certificates);
    //   inspectionCertificatesUrl = await getDownloadURL(storageRef);
    // }
    // let portEntryPermitsUrl = "";
    // if (values.port_entry_permits) {
    //   const storage = getStorage(firebaseApp);
    //   const storageRef = ref(
    //     storage,
    //     `port_entry_permits/${values.port_entry_permits.name}`
    //   );

    //   await uploadBytes(storageRef, values.port_entry_permits);
    //   portEntryPermitsUrl = await getDownloadURL(storageRef);
    // }
    // let cargoInsuranceUrl = "";
    // if (values.cargo_insurance) {
    //   const storage = getStorage(firebaseApp);
    //   const storageRef = ref(
    //     storage,
    //     `cargo_insurance/${values.cargo_insurance.name}`
    //   );

    //   await uploadBytes(storageRef, values.cargo_insurance);
    //   cargoInsuranceUrl = await getDownloadURL(storageRef);
    // }

    const fileUploadPromises = [
      values.truck_incurance
        ? uploadFile("truck_incurance", values.truck_incurance)
        : "",
      values.transit_permits
        ? uploadFile("transit_permits", values.transit_permits)
        : "",
      values.inspection_certificates
        ? uploadFile("inspection_certificates", values.inspection_certificates)
        : "",
      values.port_entry_permits
        ? uploadFile("port_entry_permits", values.port_entry_permits)
        : "",
      values.cargo_insurance
        ? uploadFile("cargo_insurance", values.cargo_insurance)
        : "",
    ];

    // Destructure the file URLs
    const [
      truckIncuranceUrl,
      transitPermitsUrl,
      inspectionCertificatesUrl,
      portEntryPermitsUrl,
      cargoInsuranceUrl,
    ] = await Promise.all(fileUploadPromises);

    const generatedVehicleId = await generateVehicleId(organisationId);

    const VehicleData = {
      cargo_capacity: values.cargo_capacity,
      lisence_plate: values.lisence_plate,
      vehicle_type: values.vehicle_type,
      make: values.make,
      model: values.model,
      year: values.year,
      ownership_status: values.ownership_status,
      lease_amount: values.lease_amount,
      purchase_price: values.purchase_price,
      truck_incurance: truckIncuranceUrl,
      cargo_insurance: cargoInsuranceUrl,
      port_entry_permits: portEntryPermitsUrl,
      inspection_certificates: inspectionCertificatesUrl,
      transit_permits: transitPermitsUrl,
      status: true,
      archive: false,
      registration_date: registration_date,
      availability_status: "Available",
      vehiclesId: generatedVehicleId,
      organisationId: organisationId,
      timestamp: Timestamp.now(),
      addedBy: currentUser?.email,
    };

    const docRef = await addDoc(vehiclesCollection, VehicleData);
    toast.success("Vehicle Successfully Added.");

    const newVehicle = {
      id: docRef.id,
      ...VehicleData,
    };

    setOpen(false);
    setShowAddVehicleModal(false);
  };

  interface CompanyData {
    name: string;
    vehicle?: string[]; // Assuming 'vehicle' is an array of strings
  }
  const handleAllocateSubmit = async (values: {
    vehicle: string;
    company: string;
  }) => {
    try {
      if (!values) {
        console.error("Form values are undefined");
        return;
      }

      if (!values.vehicle || !values.company) {
        console.error("Required form fields are missing");
        return;
      }

      const vehicleAllocationsCollectionRef = query(
        collection(fbDb, "vehicleAllocations"),
        where("organisationId", "==", organisationId)
      );

      const vehicleQuerySnapshot = await getDocs(
        vehicleAllocationsCollectionRef
      );

      const isVehicleAlreadyAllocated = vehicleQuerySnapshot.docs.some(
        (doc) => {
          const allocationData = doc.data();
          return allocationData.vehicle === values.vehicle;
        }
      );

      if (isVehicleAlreadyAllocated) {
        const allocatedCompany = vehicleQuerySnapshot.docs.find((doc) => {
          const allocationData = doc.data() as {
            vehicle: string;
            name: string;
          };
          return allocationData.vehicle === values.vehicle;
        });

        if (allocatedCompany) {
          console.error(
            "Vehicle is already allocated to " + allocatedCompany.data().name
          );
          toast.error(
            "Vehicle is already allocated to " + allocatedCompany.data().name
          );
        } else {
          toast.error("Vehicle is already allocated to an unknown company");
        }
        return;
      }

      // const companiesCollectionRef = collection(fbDb, "classes");
      const companiesCollectionRef = query(
        collection(fbDb, "classes"),
        where("organisationId", "==", organisationId),
        where("archive", "==", false)
      );

      const querySnapshot = await getDocs(companiesCollectionRef);

      let companyDocRef;
      let allocated = false;

      querySnapshot.forEach((doc) => {
        const companyData = doc.data() as CompanyData;
        console.log("Company Data:", companyData);
        if (companyData.name === values.company) {
          companyDocRef = doc.ref;
          if (
            companyData.vehicle &&
            companyData.vehicle.includes(values.vehicle)
          ) {
            toast.error("Vehicle already allocated to this company.");
            allocated = true;
          }
        }
      });

      if (allocated) {
        return;
      }

      if (companyDocRef) {
        const companySnapshot = await getDoc(companyDocRef);
        const existingCompanyData = companySnapshot.data() as CompanyData;

        const existingVehicles = existingCompanyData.vehicle || [];
        existingVehicles.push(values.vehicle);

        // Update the company document with the added vehicle
        await updateDoc(companyDocRef, {
          vehicle: existingVehicles,
        });
      } else {
        toast.error("Company not found: " + values.company);
        return;
      }

      const AllocationData = {
        vehicle: values.vehicle,
        name: values.company,
      };

      const docRef = await addDoc(
        collection(fbDb, "vehicleAllocations"),
        AllocationData
      );

      console.log("Allocation added with ID: ", docRef.id);
    } catch (error) {
      console.error("Error allocating Vehicle:", error);
      toast.error("Error allocating Vehicle: " + error);
    }
    setOpen(false);
    setShowAllocateModal(false);
  };

  useEffect(() => {
    const savedIndex = localStorage.getItem("selectedTabIndex");
    if (savedIndex !== null) {
      setSelectedIndex(parseInt(savedIndex, 10));
    }
    const fetchUnallocatedVehicles = async () => {
      try {
        if (organisationId) {
          // Fetch all vehicles
          // const vehiclesSnapshot = await getDocs(collection(fbDb, "vehicles"));
          const vehiclesSnapshot = await getDocs(
            query(
              collection(fbDb, "vehicles"),
              where("organisationId", "==", organisationId),
              where("archive", "==", false)
            )
          );

          const vehicles: Vehicle[] = vehiclesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Vehicle[];

          // Fetch all companies
          // const companiesSnapshot = await getDocs(collection(fbDb, "classes"));

          const companiesSnapshot = await getDocs(
            query(
              collection(fbDb, "classes"),
              where("organisationId", "==", organisationId),
              where("archive", "==", false)
            )
          );

          const allocatedVehicles = new Set<string>();
          companiesSnapshot.forEach((doc) => {
            const companyData = doc.data();
            if (companyData.vehicles) {
              companyData.vehicles.forEach((plate: string) =>
                allocatedVehicles.add(plate)
              );
            }
          });

          // Filter unallocated vehicles
          const unallocatedVehiclesList = vehicles.filter(
            (vehicle) => !allocatedVehicles.has(vehicle.lisence_plate)
          );

          setUnallocatedVehicles(unallocatedVehiclesList);
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };

    const fetchedVehicles = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(db, "vehicles"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const vehiclesData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setFetchedVehicles(vehiclesData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Vehicles:", error);
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

          const classData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFetchedCompanies(classData);
        }
      } catch (error) {
        console.error("Error fetching Classes:", error);
      }
    };

    fetchedVehicles();
    fetchedCompanies();
    fetchUnallocatedVehicles();
  }, [organisationId]);

  const hasAddVehiclesPermission =
    userClaims?.additionalPermissions?.includes("Add vehicles") ||
    userClaims?.admin;
  const hasDepartmentsPermission = userClaims?.department?.includes("");

  const updateFetchedVehicles = (
    updatedDrivers: SetStateAction<DocumentData[]>
  ) => {
    setFetchedVehicles(updatedDrivers);
  };
  const uploadImage = async (file: File, folder: string) => {
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `${folder}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleEditSubmit = async (values: {
    cargo_capacity: any;
    lisence_plate: any;
    vehicle_type: any;
    make: any;
    model: any;
    year: any;
    ownership_status: any;
    lease_amount: any;
    purchase_price: any;
    truck_incurance: File | null;
    cargo_insurance: File | null;
    port_entry_permits: File | null;
    inspection_certificates: File | null;
    transit_permits: File | null;
    status: any;
    archive: any;
    registration_date: any;
    availability_status: any;
    vehiclesId: any;
    organisationId: any;
    timestamp: any;
  }) => {
    if (!selectedVehicle) {
      console.error("No selected vehicle to update");
      return;
    }

    try {
      // Update the vehicle data in the database using the selectedVehicle.id
      const vehicleRef = doc(fbDb, "vehicles", selectedVehicle.id);
      await setDoc(vehicleRef, {
        cargo_capacity: values.cargo_capacity,
        lisence_plate: values.lisence_plate,
        vehicle_type: values.vehicle_type,
        make: values.make,
        model: values.model,
        year: values.year,
        ownership_status: values.ownership_status,
        lease_amount: values.lease_amount,
        purchase_price: values.purchase_price,
        truck_incurance: values.truck_incurance
          ? await uploadImage(values.truck_incurance, "truck_incurance")
          : selectedVehicle.truck_incurance,
        cargo_insurance: values.cargo_insurance
          ? await uploadImage(values.cargo_insurance, "cargo_insurance")
          : selectedVehicle.cargo_insurance,
        port_entry_permits: values.port_entry_permits
          ? await uploadImage(values.port_entry_permits, "port_entry_permits")
          : selectedVehicle.port_entry_permits,
        inspection_certificates: values.inspection_certificates
          ? await uploadImage(
              values.inspection_certificates,
              "inspection_certificates"
            )
          : selectedVehicle.inspection_certificates,
        transit_permits: values.transit_permits
          ? await uploadImage(values.transit_permits, "transit_permits")
          : selectedVehicle.transit_permits,
        status: values.status,
        archive: values.archive,
        registration_date: values.registration_date,
        availability_status: values.availability_status,
        vehiclesId: values.vehiclesId,
        organisationId: values.organisationId,
        timestamp: values.timestamp,
        addedBy: currentUser?.email,
      });

      setSelectedVehicle(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Vehicle:", error);
    }
  };

  return (
    <>
      <div className="mt-2 h-full">
        <Tab.Group>
          <div className="flex w-full justify-end mt-4">
            <div className="flex justify-end text-base mr-2">
              <div className="ml-2 flex flex-row">
                {hasAddPermission && (
                  <AddButton
                    name="Add Vehicle"
                    handleAddClick={handleAddVehicles}
                  />
                )}
                <div className="ml-2">
                  {/* {hasAllocatePermission && (
                    <Button
                      className="rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2 "
                      handleClick={handleAllocateVehicles}
                    >
                      <PlusIcon className="h-6 w-6 mr-2" />
                      Allocate Vehicle
                    </Button>
                  )} */}
                </div>
              </div>
            </div>
          </div>

          <Tab.Panels>
            <Tab.Panel>
              <div className="h-full overflow-y-auto">
                <VehiclesTable
                  selectedTab={selectedTab}
                  vehicles={fetchedVehicles}
                  updateFetchedVehicles={updateFetchedVehicles}
                  handleEditClick={handleEditClick}
                  hasEditVehiclesPermission={hasEditVehiclesPermission}
                  hasArchivePermission={hasArchivePermission}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="h-full overflow-y-auto">
                <VehiclesTable
                  selectedTab={selectedTab}
                  vehicles={fetchedVehicles}
                  updateFetchedVehicles={updateFetchedVehicles}
                  handleEditClick={handleEditClick}
                  hasEditVehiclesPermission={hasEditVehiclesPermission}
                  hasArchivePermission={hasArchivePermission}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className=" h-full overflow-y-auto">
                <VehiclesTable
                  selectedTab={selectedTab}
                  vehicles={fetchedVehicles}
                  updateFetchedVehicles={updateFetchedVehicles}
                  handleEditClick={handleEditClick}
                  hasEditVehiclesPermission={hasEditVehiclesPermission}
                  hasArchivePermission={hasArchivePermission}
                />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        <div>
          <FormModal
            open={showAddVehicleModal}
            setOpen={setShowAddVehicleModal}
          >
            <div className="p-5">
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">New Truck</div>
                <Button
                  className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                  handleClick={handleReset}
                >
                  <XMarkIcon className="h-6 w-6 text-red-400" />
                </Button>
              </div>
              <Formik
                initialValues={{
                  cargo_capacity: "",
                  lisence_plate: "",
                  vehicle_type: "",
                  make: "",
                  model: "",
                  year: 0,
                  ownership_status: "",
                  lease_amount: 0,
                  purchase_price: 0,
                  truck_incurance: null,
                  cargo_insurance: null,
                  port_entry_permits: null,
                  inspection_certificates: null,
                  transit_permits: null,
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => handleSubmit(values)}
              >
                {({ values, errors, touched }) => (
                  <Form>
                    <div className="">
                      <div className="flex w-full justify-between mt-8">
                        <div className="block">
                          <label className="form-label">
                            VEHICLE IDENTIFICATION NUMBER
                          </label>
                          <Field
                            type="text"
                            name="lisence_plate"
                            value={values.lisence_plate}
                            className="form-input bg-grey w-48"
                          />
                          {errors.lisence_plate && touched.lisence_plate ? (
                            <div className="text-red-600 text-sm">
                              {errors.lisence_plate}
                            </div>
                          ) : null}
                        </div>

                        <label className="block">
                          <label className="form-label">VEHICLE TYPE</label>
                          <Field
                            type="text"
                            name="vehicle_type"
                            value={values.vehicle_type}
                            className="form-input bg-grey w-48"
                          />
                          {errors.vehicle_type && touched.vehicle_type ? (
                            <div className="text-red-600 text-sm">
                              {errors.vehicle_type}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label"> CARGO CAPACITY</label>
                          <Field
                            type="text"
                            name="cargo_capacity"
                            value={values.cargo_capacity}
                            className="form-input bg-grey w-48"
                          />
                          {errors.cargo_capacity && touched.cargo_capacity ? (
                            <div className="text-red-600 text-sm">
                              {errors.cargo_capacity}
                            </div>
                          ) : null}
                        </label>
                        <label className="block">
                          <label className="form-label">MAKE</label>
                          <Field
                            type="text"
                            name="make"
                            value={values.make}
                            className="form-input bg-grey w-48"
                          />
                          {errors.make && touched.make ? (
                            <div className="text-red-600 text-sm">
                              {errors.make}
                            </div>
                          ) : null}
                        </label>
                      </div>

                      <div className="flex w-full justify-between mt-8">
                        {/* <label className="block">
                          <label className="form-label">OWNERSHIP STATUS</label>

                          <Field
                            as="select"
                            type="text"
                            name="ownership_status"
                            className="form-input bg-grey w-48"
                          >
                            <option value="">Select Status</option>
                            <option value="Owned">Owned</option>
                            <option value="Leased">Leased</option>
                          </Field>
                          {errors.ownership_status &&
                          touched.ownership_status ? (
                            <div className="text-red-600 text-sm">
                              {errors.ownership_status}
                            </div>
                          ) : null}
                          {values.ownership_status === "Owned" && (
                            <div className="mt-8">
                              <label className="block">
                                <label className="form-label">
                                  PURCHASE PRICE
                                </label>
                                <Field
                                  type="number"
                                  name="lease_amount"
                                  placeholder="Ksh"
                                  className="form-input bg-grey w-48"
                                />
                              </label>
                            </div>
                          )}
                        </label> */}
                        <label className="block">
                          <label className="form-label">OWNERSHIP STATUS</label>

                          <Field
                            as="select"
                            type="text"
                            name="ownership_status"
                            className="form-input bg-grey w-48"
                          >
                            <option value="">Select Status</option>
                            <option value="Owned">Owned</option>
                            <option value="Leased">Leased</option>
                          </Field>
                          {errors.ownership_status &&
                          touched.ownership_status ? (
                            <div className="text-red-600 text-sm">
                              {errors.ownership_status}
                            </div>
                          ) : null}
                          {values.ownership_status === "Owned" && (
                            <div className="mt-8">
                              <label className="block">
                                <label className="form-label">
                                  PURCHASE PRICE
                                </label>
                                <Field
                                  type="number"
                                  name="purchase_price"
                                  placeholder="Ksh"
                                  className="form-input bg-grey w-48"
                                />
                              </label>
                            </div>
                          )}
                          {values.ownership_status === "Leased" && (
                            <div className="mt-8">
                              <label className="block">
                                <label className="form-label">
                                  MONTHLY LEASE AMOUNT
                                </label>
                                <Field
                                  type="number"
                                  name="lease_amount"
                                  placeholder="Ksh"
                                  className="form-input bg-grey w-48"
                                />
                              </label>
                            </div>
                          )}
                        </label>
                        <label className="block">
                          <label className="form-label">MODEL</label>
                          <Field
                            type="text"
                            name="model"
                            value={values.model}
                            className="form-input bg-grey w-48"
                          />
                          {errors.model && touched.model ? (
                            <div className="text-red-600 text-sm">
                              {errors.model}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">YEAR</label>
                          <Field
                            type="text"
                            name="year"
                            value={values.year}
                            className="form-input bg-grey w-48"
                          />
                          {errors.year && touched.year ? (
                            <div className="text-red-600 text-sm">
                              {errors.year}
                            </div>
                          ) : null}
                        </label>
                        <label className="block ml-14">
                          <label className="form-label">TRUCK INSURANCE</label>
                          <Field name="truck_incurance">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".jpeg, .jpg, .pdf, .png"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("truck_incurance", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.truck_incurance && touched.truck_incurance ? (
                            <div className="text-red-600 text-sm">
                              {errors.truck_incurance}
                            </div>
                          ) : null}
                        </label>
                      </div>

                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">CARGO INSURANCE</label>
                          <Field name="cargo_insurance">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".jpeg, .jpg, .pdf, .png"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("cargo_insurance", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.cargo_insurance && touched.cargo_insurance ? (
                            <div className="text-red-600 text-sm">
                              {errors.cargo_insurance}
                            </div>
                          ) : null}
                        </label>

                        <label className="block ">
                          <label className="form-label">PORT PERMITS</label>
                          <Field name="port_entry_permits">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".jpeg, .jpg, .pdf, .png"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue(
                                      "port_entry_permits",
                                      file
                                    );
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.port_entry_permits &&
                          touched.port_entry_permits ? (
                            <div className="text-red-600 text-sm">
                              {errors.port_entry_permits}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">TRANSIT PERMITS</label>
                          <Field name="transit_permits">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".jpeg, .jpg, .pdf, .png"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("transit_permits", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.transit_permits && touched.transit_permits ? (
                            <div className="text-red-600 text-sm">
                              {errors.transit_permits}
                            </div>
                          ) : null}
                        </label>

                        <label className="block">
                          <label className="form-label">
                            INSPECTION CERTIFICATES
                          </label>
                          <Field name="inspection_certificates">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".jpeg, .jpg, .pdf, .png"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue(
                                      "inspection_certificates",
                                      file
                                    );
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.inspection_certificates &&
                          touched.inspection_certificates ? (
                            <div className="text-red-600 text-sm">
                              {errors.inspection_certificates}
                            </div>
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
        </div>
        <div>
          {/*Edit Form modal goes Here  */}

          {editModalOpen && selectedVehicle && (
            <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
              <div className="p-8">
                <div className="flex w-full h-full justify-between items-center mb-12">
                  <div className="text-xl font-semibold ">
                    Edit Truck Details
                  </div>
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
                  onSubmit={handleEditSubmit}
                >
                  {({ values, setFieldValue, errors, touched }) => (
                    <Form>
                      <div className="">
                        <div className="flex w-full justify-between mt-8">
                          <div className="block">
                            <label className="form-label">
                              VEHICLE IDENTIFICATION NUMBER
                            </label>
                            <Field
                              type="text"
                              name="lisence_plate"
                              value={values.lisence_plate}
                              className="form-input bg-grey w-48"
                            />
                            {errors.lisence_plate && touched.lisence_plate ? (
                              <div className="text-red-600 text-sm">
                                {errors.lisence_plate}
                              </div>
                            ) : null}
                          </div>

                          <label className="block">
                            <label className="form-label">VEHICLE TYPE</label>
                            <Field
                              type="text"
                              name="vehicle_type"
                              value={values.vehicle_type}
                              className="form-input bg-grey w-48"
                            />
                            {errors.vehicle_type && touched.vehicle_type ? (
                              <div className="text-red-600 text-sm">
                                {errors.vehicle_type}
                              </div>
                            ) : null}
                          </label>
                        </div>
                        <div className="flex w-full justify-between mt-8">
                          <label className="block">
                            <label className="form-label">
                              {" "}
                              CARGO CAPACITY
                            </label>
                            <Field
                              type="text"
                              name="cargo_capacity"
                              value={values.cargo_capacity}
                              className="form-input bg-grey w-48"
                            />
                            {errors.cargo_capacity && touched.cargo_capacity ? (
                              <div className="text-red-600 text-sm">
                                {errors.cargo_capacity}
                              </div>
                            ) : null}
                          </label>
                          <label className="block">
                            <label className="form-label">MAKE</label>
                            <Field
                              type="text"
                              name="make"
                              value={values.make}
                              className="form-input bg-grey w-48"
                            />
                            {errors.make && touched.make ? (
                              <div className="text-red-600 text-sm">
                                {errors.make}
                              </div>
                            ) : null}
                          </label>
                        </div>

                        <div className="flex w-full justify-between mt-8">
                          <label className="block">
                            <label className="form-label">
                              OWNERSHIP STATUS
                            </label>

                            <Field
                              as="select"
                              type="text"
                              name="ownership_status"
                              className="form-input bg-grey w-48"
                            >
                              <option value="">Select Status</option>
                              <option value="Owned">Owned</option>
                              <option value="Leased">Leased</option>
                            </Field>
                            {errors.ownership_status &&
                            touched.ownership_status ? (
                              <div className="text-red-600 text-sm">
                                {errors.ownership_status}
                              </div>
                            ) : null}
                            {values.ownership_status === "Owned" && (
                              <div className="mt-8">
                                <label className="block">
                                  <label className="form-label">
                                    PURCHASE PRICE
                                  </label>
                                  <Field
                                    type="number"
                                    name="purchase_price"
                                    placeholder="Ksh"
                                    className="form-input bg-grey w-48"
                                  />
                                </label>
                              </div>
                            )}
                            {values.ownership_status === "Leased" && (
                              <div className="mt-8">
                                <label className="block">
                                  <label className="form-label">
                                    MONTHLY LEASE AMOUNT
                                  </label>
                                  <Field
                                    type="number"
                                    name="lease_amount"
                                    placeholder="Ksh"
                                    className="form-input bg-grey w-48"
                                  />
                                </label>
                              </div>
                            )}
                          </label>
                          <label className="block">
                            <label className="form-label">MODEL</label>
                            <Field
                              type="text"
                              name="model"
                              value={values.model}
                              className="form-input bg-grey w-48"
                            />
                            {errors.model && touched.model ? (
                              <div className="text-red-600 text-sm">
                                {errors.model}
                              </div>
                            ) : null}
                          </label>
                        </div>
                        <div className="flex w-full justify-between mt-8">
                          <label className="block">
                            <label className="form-label">YEAR</label>
                            <Field
                              type="text"
                              name="year"
                              value={values.year}
                              className="form-input bg-grey w-48"
                            />
                            {errors.year && touched.year ? (
                              <div className="text-red-600 text-sm">
                                {errors.year}
                              </div>
                            ) : null}
                          </label>

                          <label className="block ml-20">
                            <label className="form-label">
                              TRUCK INSURANCE
                            </label>
                            <div className="">
                              <Field name="truck_incurance">
                                {({ field, form }: any) => (
                                  <input
                                    type="file"
                                    accept=".jpeg, .jpg, .pdf, .png"
                                    onChange={(event) => {
                                      const file =
                                        event.currentTarget?.files?.[0];
                                      if (file) {
                                        form.setFieldValue(
                                          "truck_incurance",
                                          file
                                        );
                                      }
                                    }}
                                  />
                                )}
                              </Field>
                              {values.truck_incurance &&
                              typeof values.truck_incurance === "string" ? (
                                <div className="mt-5">
                                  <a
                                    href={values.truck_incurance}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    View Truck Insurance
                                  </a>
                                </div>
                              ) : null}
                            </div>
                            {errors.truck_incurance &&
                            touched.truck_incurance ? (
                              <div className="text-red-600 text-sm">
                                {errors.truck_incurance}
                              </div>
                            ) : null}
                          </label>
                        </div>

                        <div className="flex w-full justify-between mt-8">
                          <label className="block">
                            <label className="form-label">
                              CARGO INSURANCE
                            </label>
                            <div className="">
                              <Field name="cargo_insurance">
                                {({ field, form }: any) => (
                                  <input
                                    type="file"
                                    accept=".jpeg, .jpg, .pdf, .png"
                                    onChange={(event) => {
                                      const file =
                                        event.currentTarget?.files?.[0];
                                      if (file) {
                                        form.setFieldValue(
                                          "cargo_insurance",
                                          file
                                        );
                                      }
                                    }}
                                  />
                                )}
                              </Field>
                              {values.cargo_insurance &&
                              typeof values.cargo_insurance === "string" ? (
                                <div className="mt-5">
                                  <a
                                    href={values.cargo_insurance}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    View Cargo Insurance
                                  </a>
                                </div>
                              ) : null}
                            </div>
                            {errors.cargo_insurance &&
                            touched.cargo_insurance ? (
                              <div className="text-red-600 text-sm">
                                {errors.cargo_insurance}
                              </div>
                            ) : null}
                          </label>

                          {/* <label className="block ">
                            <label className="form-label">PORT PERMITS</label>
                            <Field name="port_entry_permits">
                              {({ field, form }: any) => (
                                <input
                                  type="file"
                                  onChange={(event) => {
                                    const file =
                                      event.currentTarget?.files?.[0];
                                    if (file) {
                                      form.setFieldValue(
                                        "port_entry_permits",
                                        file
                                      );
                                    }
                                  }}
                                />
                              )}
                            </Field>
                            {errors.port_entry_permits &&
                            touched.port_entry_permits ? (
                              <div className="text-red-600 text-sm">
                                {errors.port_entry_permits}
                              </div>
                            ) : null}
                          </label> */}

                          <label className="block">
                            <label className="form-label">PORT PERMITS</label>
                            <div className="">
                              <Field name="port_entry_permits">
                                {({ field, form }: any) => (
                                  <input
                                    type="file"
                                    accept=".jpeg, .jpg, .pdf, .png"
                                    onChange={(event) => {
                                      const file =
                                        event.currentTarget?.files?.[0];
                                      if (file) {
                                        form.setFieldValue(
                                          "port_entry_permits",
                                          file
                                        );
                                      }
                                    }}
                                  />
                                )}
                              </Field>
                              {values.port_entry_permits &&
                              typeof values.port_entry_permits === "string" ? (
                                <div className="mt-5">
                                  <a
                                    href={values.port_entry_permits}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    View Port Entry Permit
                                  </a>
                                </div>
                              ) : null}
                            </div>
                            {errors.port_entry_permits &&
                            touched.port_entry_permits ? (
                              <div className="text-red-600 text-sm">
                                {errors.port_entry_permits}
                              </div>
                            ) : null}
                          </label>
                        </div>
                        <div className="flex w-full justify-between mt-8">
                          {/* <label className="block ml-6">
                            <label className="form-label">
                              TRANSIT PERMITS
                            </label>
                            <Field name="transit_permits">
                              {({ field, form }: any) => (
                                <input
                                  type="file"
                                  onChange={(event) => {
                                    const file =
                                      event.currentTarget?.files?.[0];
                                    if (file) {
                                      form.setFieldValue(
                                        "transit_permits",
                                        file
                                      );
                                    }
                                  }}
                                />
                              )}
                            </Field>
                            {errors.transit_permits &&
                            touched.transit_permits ? (
                              <div className="text-red-600 text-sm">
                                {errors.transit_permits}
                              </div>
                            ) : null}
                          </label> */}

                          <label className="block">
                            <label className="form-label">
                              TRANSIT PERMITS
                            </label>
                            <div className="">
                              <Field name="transit_permits">
                                {({ field, form }: any) => (
                                  <input
                                    type="file"
                                    accept=".jpeg, .jpg, .pdf, .png"
                                    onChange={(event) => {
                                      const file =
                                        event.currentTarget?.files?.[0];
                                      if (file) {
                                        form.setFieldValue(
                                          "transit_permits",
                                          file
                                        );
                                      }
                                    }}
                                  />
                                )}
                              </Field>
                              {values.transit_permits &&
                              typeof values.transit_permits === "string" ? (
                                <div className="mt-5">
                                  <a
                                    href={values.transit_permits}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    View Transit Permit
                                  </a>
                                </div>
                              ) : null}
                            </div>
                            {errors.transit_permits &&
                            touched.transit_permits ? (
                              <div className="text-red-600 text-sm">
                                {errors.transit_permits}
                              </div>
                            ) : null}
                          </label>

                          <label className="block">
                            <label className="form-label">
                              INSPECTION CERTIFICATES
                            </label>
                            <div className="">
                              <Field name="inspection_certificates">
                                {({ field, form }: any) => (
                                  <input
                                    type="file"
                                    accept=".jpeg, .jpg, .pdf, .png"
                                    onChange={(event) => {
                                      const file =
                                        event.currentTarget?.files?.[0];
                                      if (file) {
                                        form.setFieldValue(
                                          "inspection_certificates",
                                          file
                                        );
                                      }
                                    }}
                                  />
                                )}
                              </Field>
                              {values.inspection_certificates &&
                              typeof values.inspection_certificates ===
                                "string" ? (
                                <div className="mt-5">
                                  <a
                                    href={values.inspection_certificates}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    View Inspection Certificate
                                  </a>
                                </div>
                              ) : null}
                            </div>
                            {errors.inspection_certificates &&
                            touched.inspection_certificates ? (
                              <div className="text-red-600 text-sm">
                                {errors.inspection_certificates}
                              </div>
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
        </div>

        <FormModal open={showAllocateModal} setOpen={setShowAllocateModal}>
          <div className="p-8">
            <div className="flex w-full h-full justify-between items-center mb-12">
              <div className="text-xl font-semibold ">ALLOCATE VEHICLE</div>
              <Button
                className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                handleClick={handleAllocateReset}
              >
                <XMarkIcon className="h-6 w-6 text-red-400" />
              </Button>
            </div>

            <Formik
              initialValues={{
                vehicle: "",
                company: "",
              }}
              onSubmit={(values) => handleAllocateSubmit(values)}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <div className="">
                    <div className="flex w-full justify-between">
                      <label className="block">
                        <label className="form-label">VEHICLE</label>.
                        <Field
                          as="select"
                          name="vehicle"
                          value={values.vehicle}
                          className="form-input bg-grey w-48"
                        >
                          <option value="">Select Vehicle</option>
                          {unallocatedVehicles.map((vehicle, index) => (
                            <option key={index} value={vehicle.lisence_plate}>
                              {vehicle.lisence_plate}
                            </option>
                          ))}
                        </Field>
                      </label>

                      <label className="block">
                        <label className="form-label">CLASS</label>.
                        <Field
                          as="select"
                          name="company"
                          value={values.company}
                          className="form-input bg-grey w-48"
                        >
                          <option value="">Select Class</option>

                          {fetchedCompanies.map((company, index) => (
                            <option key={index} value={company.name}>
                              {company.name}
                            </option>
                          ))}
                        </Field>
                      </label>
                    </div>
                    <div className="flex w-full justify-end mt-24 ">
                      <Button
                        className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32"
                        handleClick={handleAllocateReset}
                      >
                        Reset
                      </Button>
                      {/* <Submit name="save" handleSubmit={handleSubmit}/> */}
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
      </div>
    </>
  );
}
