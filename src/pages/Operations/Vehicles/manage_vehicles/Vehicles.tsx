import { Tab } from "@headlessui/react";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { AddButton, Button, DeleteBtn, EditBtn } from "@/components/Buttons";
import Table, { DummyTable } from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "@/components/Table/Cells";
import { TableBody } from "@/components/Table/Row";
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
} from "firebase/firestore";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import SiteLayout from "@/Layout/SiteLayout";
import { toast } from "react-hot-toast";
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const Headers = ["VEHICLE ID", "VEHICLE TYPE", "LICENSE PLATE"];
export default function Vehicles() {
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<DocumentData | null>(
    null
  );
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);
  const [fetchedCompanies, setFetchedCompanies] = useState<DocumentData[]>([]);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [companies, setCompanies] = useState<string[]>([]);
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    cargo_capacity: "",
    lisence_plate: "",
    vehicle_type: "",
    make: "",
    model: "",
    year: 0,
    ownership_status: "",
    lease_amount: 0,
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
  });
  const [showLeaseInput, setShowLeaseInput] = useState(false);
  const [showEditLeaseInput, setShowEditLeaseInput] = useState(false);

  const { organisationId } = useAuthContext();
  console.log(" Vehicles Organisation ID:", organisationId);
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

      // Customize this logic based on your requirements
      return `V${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching Vehicles count:", error);
      // Handle error or return a default value
      return "V001";
    }
  }

  const handleSubmit = async (values: {
    cargo_capacity: any;
    lisence_plate: any;
    vehicle_type: any;
    make: any;
    model: any;
    year: any;
    ownership_status: any;
    lease_amount: any;
    truck_incurance: any;
    cargo_insurance: any;
    port_entry_permits: any;
    inspection_certificates: any;
    transit_permits: any;
  }) => {
    console.log("Ownership Status:", values.ownership_status);

    if (!values.cargo_capacity) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field  Cargo capacity");
      return;
    }
    if (!values.lisence_plate) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Vehicle Identification Number");
      return;
    }
    if (!values.vehicle_type) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Vehicle type");
      return;
    }
    if (!values.make) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Make");
      return;
    }
    if (!values.model) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Model");
      return;
    }
    if (!values.year) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field year");
      return;
    }
    if (!values.ownership_status) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Ownership Status");
      return;
    }
    if (values.ownership_status === "Owned") {
      if (!values.lease_amount) {
        console.error("Required form fields are missing");
        toast.error("Please fill the field Lease Amount");
        return;
      }
    }
    if (!values.truck_incurance) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Truck  Insurance");
      return;
    }
    if (!values.cargo_insurance) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Cargo Insurance");
      return;
    }
    if (!values.port_entry_permits) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Port Entry Permits");
      return;
    }
    if (!values.inspection_certificates) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Inspection Certificates");
      return;
    }
    if (!values.transit_permits) {
      console.error("Required form fields are missing");
      toast.error("Please fill the field Transit Permits");
      return;
    }
    // truck_incurance: null,
    // cargo_insurance: null,
    // port_entry_permits: null,
    // inspection_certificates: null,
    // transit_permits: null,

    const registration_date = new Date();
    const licensePlate = values.lisence_plate;
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
    let truckIncuranceUrl = "";
    if (values.truck_incurance) {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(
        storage,
        `truck_incurance/${values.truck_incurance.name}`
      );

      await uploadBytes(storageRef, values.truck_incurance);
      truckIncuranceUrl = await getDownloadURL(storageRef);
      console.log("ID Image URL:", truckIncuranceUrl);
    }
    let transitPermitsUrl = "";
    if (values.transit_permits) {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(
        storage,
        `transit_permits/${values.transit_permits.name}`
      );

      await uploadBytes(storageRef, values.transit_permits);
      transitPermitsUrl = await getDownloadURL(storageRef);
      console.log("ID Image URL:", transitPermitsUrl);
    }
    let inspectionCertificatesUrl = "";
    if (values.inspection_certificates) {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(
        storage,
        `inspection_certificates/${values.inspection_certificates.name}`
      );

      await uploadBytes(storageRef, values.inspection_certificates);
      inspectionCertificatesUrl = await getDownloadURL(storageRef);
      console.log("ID Image URL:", inspectionCertificatesUrl);
    }
    let portEntryPermitsUrl = "";
    if (values.port_entry_permits) {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(
        storage,
        `port_entry_permits/${values.port_entry_permits.name}`
      );

      await uploadBytes(storageRef, values.port_entry_permits);
      portEntryPermitsUrl = await getDownloadURL(storageRef);
      console.log("ID Image URL:", portEntryPermitsUrl);
    }
    let cargoInsuranceUrl = "";
    if (values.cargo_insurance) {
      const storage = getStorage(firebaseApp);
      const storageRef = ref(
        storage,
        `cargo_insurance/${values.cargo_insurance.name}`
      );

      await uploadBytes(storageRef, values.cargo_insurance);
      cargoInsuranceUrl = await getDownloadURL(storageRef);
      console.log("ID Image URL:", cargoInsuranceUrl);
    }

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
    };

    const docRef = await addDoc(vehiclesCollection, VehicleData);
    console.log("Vehicle added with ID: ", docRef.id);
    toast.success("Vehicle Successfully Added.");

    const newVehicle = {
      id: docRef.id,
      ...VehicleData,
    };
    // Prepend the new driver to the fetchedDrivers state
    setFetchedVehicles((prevVehicle) => [newVehicle, ...prevVehicle]);

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
    console.log("Submitted Values:", values);
    try {
      if (!values) {
        console.error("Form values are undefined");
        return;
      }

      if (!values.vehicle || !values.company) {
        console.error("Required form fields are missing");
        return;
      }

      // Check if the vehicle is already allocated to a company
      const vehicleAllocationsCollectionRef = collection(
        fbDb,
        "vehicleAllocations"
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
          console.error("Vehicle is already allocated to an unknown company");
          toast.error("Vehicle is already allocated to an unknown company");
        }
        return;
      }

      const companiesCollectionRef = collection(fbDb, "classes");
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
            console.error("Vehicle already allocated to this company");
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

        console.log("Vehicle added to company:", values.company);
      } else {
        console.error("Company not found:", values.company);
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
        } else {
          console.error("Organisation ID is not available.");
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
            where("organisationId", "==", organisationId)
          );
          const querySnapshot = await getDocs(q);

          const classData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFetchedCompanies(classData);
        } else {
          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching Classes:", error);
      }
    };

    fetchedVehicles();
    fetchedCompanies();
    console.log(fetchedCompanies);
  }, [organisationId]);

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
  }) => {
    if (!selectedVehicle) {
      console.error("No selected vehicle to update");
      return;
    }

    console.log("Edited Values:", values);

    try {
      if (!values.cargo_capacity) {
        console.error("Required form fields are missing");
        toast.error("please fill the  Cargo Capacity  field");
        return;
      }
      if (!values.lisence_plate) {
        console.error("Required form fields are missing");
        toast.error("please fill the  License Plate  field");
        return;
      }
      if (!values.lisence_plate) {
        console.error("Required form fields are missing");
        toast.error("please fill the  License Plate  field");
        return;
      }
      if (!values.vehicle_type) {
        console.error("Required form fields are missing");
        toast.error("please fill the  Vehicle Type field");
        return;
      }
      if (!values.make) {
        console.error("Required form fields are missing");
        toast.error("please fill the  License Plate  field");
        return;
      }
      if (!values.model) {
        console.error("Required form fields are missing");
        toast.error("please fill the Model field");
        return;
      }
      if (!values.year) {
        console.error("Required form fields are missing");
        toast.error("please fill the Year field");
        return;
      }
      if (!values.ownership_status) {
        console.error("Required form fields are missing");
        toast.error("please fill the Ownership Status field");
        return;
      }
      if (values.ownership_status === "Owned") {
        if (!values.lease_amount) {
          console.error("Required form fields are missing");
          toast.error("please fill the  Lease Amount  field");
          return;
        }
      }

      if (!values.truck_incurance) {
        console.error("Required form fields are missing");
        toast.error("please fill the Truck Insurance field");
        return;
      }
      if (!values.cargo_insurance) {
        console.error("Required form fields are missing");
        toast.error("please fill the Cargo Insurance field");
        return;
      }
      if (!values.port_entry_permits) {
        console.error("Required form fields are missing");
        toast.error("please fill the Port Entry Permits field");
        return;
      }
      if (!values.inspection_certificates) {
        console.error("Required form fields are missing");
        toast.error("please fill the Inspection Certificates field");
        return;
      }
      if (!values.transit_permits) {
        console.error("Required form fields are missing");
        toast.error("please fill the Transit Permits field");
        return;
      }

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
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedVehicles.map((vehicle) =>
        vehicle.id === selectedVehicle.id
          ? {
              ...vehicle,
              cargo_capacity: values.cargo_capacity,
              lisence_plate: values.lisence_plate,
              vehicle_type: values.vehicle_type,
              make: values.make,
              model: values.model,
              year: values.year,
              ownership_status: values.ownership_status,
              lease_amount: values.lease_amount,
              truck_incurance: values.truck_incurance,
              cargo_insurance: values.cargo_insurance,
              port_entry_permits: values.port_entry_permits,
              inspection_certificates: values.inspection_certificates,
              transit_permits: values.transit_permits,
              status: values.status,
              archive: values.archive,
              registration_date: values.registration_date,
              availability_status: values.availability_status,
              vehiclesId: values.vehiclesId,
              organisationId: values.organisationId,
            }
          : vehicle
      );

      setFetchedVehicles(updatedVehicles);

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
                <AddButton
                  name="Add Vehicle"
                  handleAddClick={handleAddVehicles}
                />
                <div className="ml-2">
                  <Button
                    className="rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2 "
                    handleClick={handleAllocateVehicles}
                  >
                    <PlusIcon className="h-6 w-6 mr-2" />
                    Allocate Vehicle
                  </Button>
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
                  truck_incurance: null,
                  cargo_insurance: null,
                  port_entry_permits: null,
                  inspection_certificates: null,
                  transit_permits: null,
                }}
                onSubmit={(values) => handleSubmit(values)}
              >
                {({ values }) => (
                  <Form>
                    <div className="">
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">
                            VEHICLE IDENTIFICATION NUMBER
                          </label>
                          <Field
                            type="text"
                            name="lisence_plate"
                            value={values.lisence_plate}
                            className="form-input bg-grey w-48"
                          />
                        </label>

                        <label className="block">
                          <label className="form-label">VEHICLE TYPE</label>
                          <Field
                            type="text"
                            name="vehicle_type"
                            value={values.vehicle_type}
                            className="form-input bg-grey w-48"
                          />
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
                        </label>
                        <label className="block">
                          <label className="form-label">MAKE</label>
                          <Field
                            type="text"
                            name="make"
                            value={values.make}
                            className="form-input bg-grey w-48"
                          />
                        </label>
                      </div>

                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">OWNERSHIP STATUS</label>
                          <Field
                            as="select"
                            type="text"
                            name="ownership_status"
                            value={values.ownership_status}
                            className="form-input bg-grey w-48"
                            onChange={(e: any) => {
                              setShowLeaseInput(e.target.value === "Owned");
                              console.log(
                                "Ownership Status Changed:",
                                e.target.value
                              );
                            }}
                          >
                            <option value="">Select Status</option>
                            <option value="Owned">Owned</option>
                            <option value="Leased">Leased</option>
                          </Field>

                          {(values.ownership_status === "Owned" ||
                            showLeaseInput) && (
                            <div className="mt-8">
                              <label className="block">
                                <label className="form-label">
                                  PURCHASE PRICE
                                </label>
                                <Field
                                  type="number"
                                  name="lease_amount"
                                  value={values.lease_amount}
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
                        </label>
                        <label className="block">
                          <label className="form-label">TRUCK INSURANCE</label>
                          <Field name="truck_incurance">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("truck_incurance", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                        </label>
                      </div>

                      <div className="flex w-full justify-between mt-8">
                        <label className="block ml-6">
                          <label className="form-label">CARGO INSURANCE</label>
                          <Field name="cargo_insurance">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("cargo_insurance", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                        </label>

                        <label className="block ">
                          <label className="form-label">PORT PERMITS</label>
                          <Field name="port_entry_permits">
                            {({ field, form }: any) => (
                              <input
                                type="file"
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
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block ml-6">
                          <label className="form-label">TRANSIT PERMITS</label>
                          <Field name="transit_permits">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("transit_permits", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                        </label>

                        <label className="block">
                          <label className="form-label">
                            INSPECTION CERTIFICATES
                          </label>
                          <Field name="inspection_certificates">
                            {({ field, form }: any) => (
                              <input
                                type="file"
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
              <div>
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
                  initialValues={editFormInitialValues}
                  onSubmit={handleEditSubmit}
                >
                  {({ values, setFieldValue }) => (
                    <Form>
                      {" "}
                      <div className="">
                        <div className="flex w-full justify-between mt-8">
                          <label className="block">
                            <label className="form-label">
                              VEHICLE IDENTIFICATION NUMBER
                            </label>
                            <Field
                              type="text"
                              name="lisence_plate"
                              value={values.lisence_plate}
                              className="form-input bg-grey w-48"
                            />
                          </label>

                          <label className="block">
                            <label className="form-label">VEHICLE TYPE</label>
                            <Field
                              type="text"
                              name="vehicle_type"
                              value={values.vehicle_type}
                              className="form-input bg-grey w-48"
                            />
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
                          </label>
                          <label className="block">
                            <label className="form-label">MAKE</label>
                            <Field
                              type="text"
                              name="make"
                              value={values.make}
                              className="form-input bg-grey w-48"
                            />
                          </label>
                        </div>

                        <div className="flex w-full justify-between mt-8">
                          <label className="block">
                            <label className="form-label">
                              OWNERSHIP STATUS
                            </label>
                            <Field
                              as="select"
                              name="ownership_status"
                              className="form-input bg-grey w-48"
                              onChange={(e: { target: { value: any } }) => {
                                const { value } = e.target;
                                setFieldValue("ownership_status", value);
                                setShowLeaseInput(value === "Owned");
                              }}
                              value={values.ownership_status}
                            >
                              <option value="">Select Status</option>
                              <option value="Owned">Owned</option>
                              <option value="Leased">Leased</option>
                            </Field>

                            {(values.ownership_status === "Owned" ||
                              showLeaseInput) && (
                              <div className="mt-8">
                                <label className="block">
                                  <label className="form-label">
                                    PURCHASE PRICE
                                  </label>
                                  <Field
                                    type="number"
                                    name="lease_amount"
                                    value={values.lease_amount}
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
                          </label>
                        </div>
                        <div className="flex w-full justify-between mt-8">
                          <label className="block ">
                            <label className="form-label">YEAR</label>
                            <Field
                              type="text"
                              name="year"
                              value={values.year}
                              className="form-input bg-grey w-48"
                            />
                          </label>
                          <label className="block">
                            <label className="form-label">
                              TRUCK INSURANCE
                            </label>
                            <Field name="truck_incurance">
                              {({ field, form }: any) => (
                                <input
                                  type="file"
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
                          </label>
                        </div>

                        <div className="flex w-full justify-between mt-8">
                          <label className="block">
                            <label className="form-label">
                              CARGO INSURANCE
                            </label>
                            <Field name="cargo_insurance">
                              {({ field, form }: any) => (
                                <input
                                  type="file"
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
                          </label>

                          <label className="block ml-10">
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
                          </label>
                        </div>
                        <div className="flex w-full justify-between mt-8">
                          <label className="block">
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
                          </label>

                          <label className="block ml-10">
                            <label className="form-label">
                              INSPECTION CERTIFICATES
                            </label>
                            <Field name="inspection_certificates">
                              {({ field, form }: any) => (
                                <input
                                  type="file"
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
                          </label>
                        </div>

                        <div className="flex w-full justify-end mt-24 ">
                          <Button
                            className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32"
                            handleClick={handleEditModalClose}
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
              {({ values }) => (
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
                          {fetchedVehicles.map((vehicle, index) => (
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

interface VehiclesTableProps {
  selectedTab: number;
  vehicles: DocumentData[];
  updateFetchedVehicles: (updatedDrivers: DocumentData[]) => void;
  handleEditClick: any;
}

export function VehiclesTable({
  selectedTab,
  vehicles,
  updateFetchedVehicles,
  handleEditClick,
}: VehiclesTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 3;

  const activeVehicles = vehicles.filter((vehicle) => vehicle.status);

  // Sort vehicles to put archived vehicles at the bottom
  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (a.archive && !b.archive) {
      return 1; // a should come after b (archived vehicles come after non-archived)
    } else if (!a.archive && b.archive) {
      return -1; // a should come before b
    } else {
      return 0; // no change in order
    }
  });
  console.log("These are the sortedVehicles", sortedVehicles);

  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const visibleVehicles = sortedVehicles.slice(startIndex, endIndex);

  const handleReassign = () => {
    // Implement your reassign logic here
  };
  const router = useRouter();

  const updateVehicleStatusInDatabase = async (
    vehicleId: string,
    newStatus: boolean
  ) => {
    try {
      const vehicleRef = doc(fbDb, "vehicles", vehicleId);
      await setDoc(vehicleRef, { archive: newStatus }, { merge: true });
      console.log("Vehicle status updated in the database:", vehicleId);

      const updatedVehicles = vehicles.map((vehicle) =>
        vehicle.id === vehicleId ? { ...vehicle, archive: newStatus } : vehicle
      );
      updateFetchedVehicles(updatedVehicles);
    } catch (error) {
      console.error("Error updating Vehicle status in database:", error);
    }
  };
  //     // const Headers = ["VEHICLE ID", "VEHICLE TYPE", "LICENSE PLATE"]

  return (
    <div className="px-4 ml-2 sm:px-6 lg:px-8">
      {/* <p className="text-base mb-2 font-bold">Vehicles</p>   */}
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
                    VEHICLE ID
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    VEHICLE TYPE
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    LICENSE PLATE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#FAFAFB]">
                {visibleVehicles.map((vehicle, index) => {
                  return (
                    <Fragment key={index}>
                      <tr className="hover:bg-gray-100">
                        <td className="whitespace-nowrap font-nunito font-regular pr-3  pl-4 pr-3  text-d-blue text-base sm:pl-0">
                          {vehicle.vehiclesId}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {vehicle.vehicle_type}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 relative">
                          {vehicle.lisence_plate}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 relative flex flex-row">
                          <div onClick={() => handleEditClick(vehicle)}>
                            <EditBtn />
                          </div>
                          <div>
                            <button
                              className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2 ml-4"
                              onClick={() =>
                                updateVehicleStatusInDatabase(
                                  vehicle.id,
                                  !vehicle.archive
                                )
                              }
                            >
                              {vehicle.archive ? "Unarchive" : "Archive"}
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

            <div className="flex flex-row justify-center my-4 ui-selected:border-b-4 outline-none text-sm font-nunito font-bold uppercase">
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
                disabled={endIndex >= sortedVehicles.length}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
