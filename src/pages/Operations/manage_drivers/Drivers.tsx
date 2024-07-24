import { Tab } from "@headlessui/react";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { AddButton, Button, EditBtn } from "@/components/Buttons";
import Table from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "@/components/Table/Cells";
import { TableBody } from "@/components/Table/Row";
import SearchBar from "@/components/Forms/input";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import {
  getFirestore,
  collection,
  setDoc,
  addDoc,
  getDocs,
  DocumentData,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import * as Yup from "yup";
import firebaseApp, { fbDb } from "@/firebase/configs";
import "firebase/firestore";
import "firebase/storage";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/router";
import { doc } from "firebase/firestore";
import ExportDriverDataToCSV from "../../../components/Exports/driversExport";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import DriversTable from "./driversTable";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  phonenumber: Yup.string().required("Phone number is required"),
  email_adress: Yup.string().required("Email Address are required"),
  city: Yup.string().required("City is required"),
  profile: Yup.mixed().required("Profile are required"),
  identity_card: Yup.mixed().required("Identity card are required"),
  good_conduct: Yup.mixed().required("Good conduct are required"),
  medical_report: Yup.mixed().required("Medical Report are required"),
});

interface DriverDetails {
  name: string;
  phonenumber: string;
  email_adress: string;
  city: string;
  profile: File | null;
  identity_card: File | null;
  good_conduct: File | null;
  medical_report: File | null;
  organisationId: string;
  driversId: string;
  [key: string]: string | File | null; // Index signature
}

export default function Drivers() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<DocumentData | null>(
    null
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [fetchedDrivers, setfetchedDrivers] = useState<DocumentData[]>([]);
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    name: "",
    phonenumber: "",
    email_adress: "",
    city: "",
    organisationId: "",
    profile: null,
    identity_card: null,
    good_conduct: null,
    medical_report: null,
    driversId: "",
  });
  const [isExporting, setIsExporting] = useState(false);

  const {
    currentAdmin,
    currentUser,
    organisationId,
    isSuperAdmin,
    userClaims,
    departmentData,
  } = useAuthContext();
  const handleAddDriver = () => {
    setOpen(true);
  };

  const handleReset = () => {
    setOpen(false);
  };

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  useEffect(() => {
    const fetchedDrivers = async () => {
      const db = getFirestore();
      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(db, "drivers"),
            where("organisationId", "==", organisationId)
          );
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const driversData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedDrivers(driversData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Drivers:", error);
      }
    };
    fetchedDrivers();
  }, [organisationId]);
  async function generateDriverId(organisationId: string) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fbDb, "drivers"),
          where("organisationId", "==", organisationId)
        )
      );
      const adminCount = querySnapshot.size;

      // Customize this logic based on your requirements
      return `D${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching Drivers count:", error);
      // Handle error or return a default value
      return "D001";
    }
  }

  const handleSubmit = async (values: {
    name: any;
    phonenumber: any;
    email_adress: any;
    city: any;
    vehicle_type: any;
    model: any;
    year: any;
    profile: any;
    identity_card: any;
    good_conduct: any;
    medical_report: any;
  }) => {
    console.log("Submitted Values:", values);

    try {
      if (!values.name) {
        console.error("Required form fields are missing");
        toast.error("please fill the Name field");
        return;
      }
      if (!values.phonenumber) {
        console.error("Required form fields are missing");
        toast.error("please fill the Phone number field");
        return;
      }
      if (!values.email_adress) {
        console.error("Required form fields are missing");
        toast.error("please fill the Email Address field");
        return;
      }
      if (!values.city) {
        console.error("Required form fields are missing");
        toast.error("please fill the City field");
        return;
      }
      if (!values.profile) {
        console.error("Required form fields are missing");
        toast.error("please fill the Profile field");
        return;
      }
      if (!values.identity_card) {
        console.error("Required form fields are missing");
        toast.error("please fill the Identity Card field");
        return;
      }
      if (!values.good_conduct) {
        console.error("Required form fields are missing");
        toast.error("please fill the Good Conduct field");
        return;
      }
      if (!values.medical_report) {
        console.error("Required form fields are missing");
        toast.error("please fill the Medical Report field");
        return;
      }

      const existingDepartmentQuery = query(
        collection(fbDb, "drivers"),
        where("email_adress", "==", values.email_adress),
        where("organisationId", "==", organisationId)
      );

      const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);

      if (!existingDepartmentSnapshot.empty) {
        console.error(
          "A driver with this email already exists in the same organisation"
        );
        toast.error(
          `A Driver with the Email '${values.email_adress}' already exists`
        );
        return;
      }

      // medical_report

      let idImageUrl = "";
      if (values.identity_card) {
        const storage = getStorage(firebaseApp);
        const storageRef = ref(
          storage,
          `id_images/${values.identity_card.name}`
        );

        await uploadBytes(storageRef, values.identity_card);
        idImageUrl = await getDownloadURL(storageRef);
        console.log("ID Image URL:", idImageUrl);
      }
      let medicalReportUrl = "";
      if (values.medical_report) {
        const storage = getStorage(firebaseApp);
        const storageRef = ref(
          storage,
          `medical_report/${values.medical_report.name}`
        );

        await uploadBytes(storageRef, values.medical_report);
        medicalReportUrl = await getDownloadURL(storageRef);
        console.log("Medical Report Image URL:", medicalReportUrl);
      }

      let profileImageUrl = "";
      if (values.profile) {
        const storage = getStorage(firebaseApp);
        const storageRef = ref(
          storage,
          `profile_images/${values.profile.name}`
        );
        await uploadBytes(storageRef, values.profile);
        profileImageUrl = await getDownloadURL(storageRef);
        console.log("Profile Image URL:", profileImageUrl);
      }
      let pdfFileUrl = "";
      if (values.good_conduct) {
        const storage = getStorage(firebaseApp);
        const pdfStorageRef = ref(
          storage,
          `good_conduct/${values.good_conduct.name}`
        );
        await uploadBytes(pdfStorageRef, values.good_conduct);
        pdfFileUrl = await getDownloadURL(pdfStorageRef);
        console.log("Good Conduct File URL:", pdfFileUrl);
      }

      if (organisationId === null) {
        console.error("organisationId is null");
        // Handle the null case, maybe show an error or return
        return;
      }
      const registration_date = new Date();
      const generatedVehicleId = await generateDriverId(organisationId);

      const DriversData = {
        name: values.name,
        phonenumber: values.phonenumber,
        email_adress: values.email_adress,
        city: values.city,
        profile: profileImageUrl,
        identity_card: idImageUrl,
        medical_report: medicalReportUrl,
        archive: false,
        good_conduct: pdfFileUrl,
        registration_date: registration_date,
        driversId: generatedVehicleId,
        organisationId: organisationId,
      };

      const docRef = await addDoc(collection(fbDb, "drivers"), DriversData);
      console.log("Driver added with ID: ", docRef.id);
      toast.success("Driver added successfully");
      const newDriver = {
        id: docRef.id,
        ...DriversData,
      };

      // Prepend the new driver to the fetchedDrivers state
      setfetchedDrivers((prevDrivers) => [newDriver, ...prevDrivers]);

      setOpen(false);
    } catch (error) {
      console.error("Error adding Driver:", error);
    }
  };
  const updateFetchedDrivers = (
    updatedDrivers: SetStateAction<DocumentData[]>
  ) => {
    setfetchedDrivers(updatedDrivers);
  };
  const handleEditClick = (driver: DocumentData) => {
    setSelectedDriver(driver);
    setEditFormInitialValues({
      driversId: driver.driversId,
      name: driver.name,
      phonenumber: driver.phonenumber,
      email_adress: driver.email_adress,
      city: driver.city,
      profile: driver.profile,
      identity_card: driver.identity_card,
      good_conduct: driver.good_conduct,
      medical_report: driver.medical_report,
      organisationId: driver.organisationId,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedDriver(null);
    setEditModalOpen(false);
  };

  const uploadImage = async (file: File, folder: string) => {
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `${folder}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleEditSubmit = async (values: DriverDetails) => {
    if (!selectedDriver) {
      console.error("No selected driver to update");
      return;
    }

    console.log("Edited Values:", values);

    try {
      const requiredFields: Array<keyof DriverDetails> = [
        "name",
        "phonenumber",
        "email_adress",
        "city",
        "profile",
        "identity_card",
        "good_conduct",
        "medical_report",
      ];
      for (const field of requiredFields) {
        if (!values[field]) {
          // Ensure field is treated as a string for replace method
          const fieldName = field as string;
          console.error(`Required form field '${fieldName}' is missing`);
          toast.error(`Please fill the ${fieldName.replace("_", " ")} field`);
          return;
        }
      }

      // Check for existing driver with the same email in the same organization
      const driversRef = collection(fbDb, "drivers");
      const emailQuery = query(
        driversRef,
        where("email_adress", "==", values.email_adress),
        where("organisationId", "==", values.organisationId)
      );
      const querySnapshot = await getDocs(emailQuery);

      if (
        !querySnapshot.empty &&
        querySnapshot.docs.some((doc) => doc.id !== selectedDriver.id)
      ) {
        toast.error(
          "Another driver in the same organization already has this email address."
        );
        return;
      }

      // Update the driver data in the database
      const driverRef = doc(fbDb, "drivers", selectedDriver.id);
      await setDoc(
        driverRef,
        {
          ...values,
          organisationId: values.organisationId,
          driversId: values.driversId,
          profile: values.profile
            ? await uploadImage(values.profile, "profile_images")
            : selectedDriver.profile,
          identity_card: values.identity_card
            ? await uploadImage(values.identity_card, "id_images")
            : selectedDriver.identity_card,
          good_conduct: values.good_conduct
            ? await uploadImage(values.good_conduct, "good_conduct")
            : selectedDriver.good_conduct,
          medical_report: values.medical_report
            ? await uploadImage(values.medical_report, "medical_report")
            : selectedDriver.medical_report,
        },
        { merge: true }
      );

      // Update local state
      const updatedDrivers = fetchedDrivers.map((driver) =>
        driver.id === selectedDriver.id ? { ...driver, ...values } : driver
      );
      setfetchedDrivers(updatedDrivers);
      toast.success("Driver edited successfully");
      setSelectedDriver(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating driver:", error);
      toast.error("Failed to update driver. Please try again.");
    }
  };

  const handleExportButtonClick = async () => {
    setIsExporting(true);

    try {
      const csvData = await ExportDriverDataToCSV(organisationId); // Pass organisationId as a parameter

      // Code to initiate download
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

  const hasAddPermission =
    userClaims?.additionalPermissions?.includes("Add Driver") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Add Driver");
  const hasEditDriverPermission =
    userClaims?.additionalPermissions?.includes("Edit Driver") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Edit Driver");
  const hasArchiveDriverPermission =
    userClaims?.additionalPermissions?.includes("Archive Driver") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Archive Driver");
  const hasExportDriverPermission =
    userClaims?.additionalPermissions?.includes("Export Driver") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Export Driver");

  return (
    <>
      <div className="mt-2 h-full">
        <Tab.Group>
          <div className="flex w-full justify-end">
            {hasExportDriverPermission && (
              <button
                className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center py-4 px-4"
                onClick={handleExportButtonClick}
                disabled={isExporting}
              >
                <>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export
                </>
              </button>
            )}
            {hasAddPermission && (
              <div className="ml-8">
                <AddButton name="Add Driver" handleAddClick={handleAddDriver} />
              </div>
            )}
          </div>
          <Tab.Panels className="h-full">
            <Tab.Panel>
              <div className="h-full overflow-y-auto">
                <DriversTable
                  drivers={fetchedDrivers}
                  updateFetchedDrivers={updateFetchedDrivers}
                  handleEditClick={handleEditClick}
                  hasEditDriverPermission={hasEditDriverPermission}
                  hasArchiveDriverPermission={hasArchiveDriverPermission}
                />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {open && (
          <FormModal open={open} setOpen={setOpen}>
            <div className="p-5">
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">New Driver</div>
                <Button
                  className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                  handleClick={handleReset}
                >
                  <XMarkIcon className="h-6 w-6 text-red-400" />
                </Button>
              </div>
              <Formik
                initialValues={{
                  name: "",
                  phonenumber: "",
                  email_adress: "",
                  gender: "",
                  city: "",
                  vehicle_type: "",
                  model: "",
                  year: "",
                  profile: null,
                  identity_card: null,
                  good_conduct: null,
                  medical_report: null,
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  handleSubmit(values);
                }}
              >
                {({ values, setFieldValue, errors, touched }) => (
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
                            <div className="text-red-600 text-sm">
                              {errors.name}
                            </div>
                          ) : null}
                        </label>
                        <label className="block">
                          <label className="form-label"> PHONE NUMBER</label>
                          <Field
                            type="text"
                            name="phonenumber"
                            value={values.phonenumber}
                            className="form-input bg-grey w-48"
                          />
                          {errors.phonenumber && touched.phonenumber ? (
                            <div className="text-red-600 text-sm">
                              {errors.phonenumber}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label"> EMAIL ADDRESS</label>
                          <Field
                            type="email"
                            name="email_adress"
                            value={values.email_adress}
                            className="form-input bg-grey w-48"
                          />
                          {errors.email_adress && touched.email_adress ? (
                            <div className="text-red-600 text-sm">
                              {errors.email_adress}
                            </div>
                          ) : null}
                        </label>

                        <label className="block">
                          <label className="form-label">ADDRESS</label>
                          <Field
                            type="text"
                            name="city"
                            value={values.city}
                            className="form-input bg-grey w-48"
                          />
                          {errors.city && touched.city ? (
                            <div className="text-red-600 text-sm">
                              {errors.city}
                            </div>
                          ) : null}
                        </label>
                      </div>

                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">DRIVING LICENSE</label>
                          <Field name="profile">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("profile", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.profile && touched.profile ? (
                            <div className="text-red-600 text-sm">
                              {errors.profile}
                            </div>
                          ) : null}
                        </label>

                        <label className="block ml-6">
                          <label className="form-label">GOOD CONDUCT</label>
                          <Field name="good_conduct">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("good_conduct", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.good_conduct && touched.good_conduct ? (
                            <div className="text-red-600 text-sm">
                              {errors.good_conduct}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">ID</label>
                          <Field name="identity_card">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("identity_card", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.identity_card && touched.identity_card ? (
                            <div className="text-red-600 text-sm">
                              {errors.identity_card}
                            </div>
                          ) : null}
                        </label>

                        <label className="block ml-6">
                          <label className="form-label">MEDICAL REPORT</label>
                          <Field name="medical_report">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("medical_report", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.medical_report && touched.medical_report ? (
                            <div className="text-red-600 text-sm">
                              {errors.medical_report}
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

        {editModalOpen && selectedDriver && (
          <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
            <div>
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">
                  Edit Drivers Details
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
                            <div className="text-red-600 text-sm">
                              {errors.name}
                            </div>
                          ) : null}
                        </label>
                        <label className="block">
                          <label className="form-label"> PHONE NUMBER</label>
                          <Field
                            type="text"
                            name="phonenumber"
                            value={values.phonenumber}
                            className="form-input bg-grey w-48"
                          />
                          {errors.phonenumber && touched.phonenumber ? (
                            <div className="text-red-600 text-sm">
                              {errors.phonenumber}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label"> EMAIL ADDRESS</label>
                          <Field
                            type="email"
                            name="email_adress"
                            value={values.email_adress}
                            className="form-input bg-grey w-48"
                          />
                          {errors.email_adress && touched.email_adress ? (
                            <div className="text-red-600 text-sm">
                              {errors.email_adress}
                            </div>
                          ) : null}
                        </label>

                        <label className="block">
                          <label className="form-label">ADDRESS</label>
                          <Field
                            type="text"
                            name="city"
                            value={values.city}
                            className="form-input bg-grey w-48"
                          />
                          {errors.city && touched.city ? (
                            <div className="text-red-600 text-sm">
                              {errors.city}
                            </div>
                          ) : null}
                        </label>
                      </div>

                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">DRIVING LICENSE</label>
                          <Field name="profile">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("profile", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.profile && touched.profile ? (
                            <div className="text-red-600 text-sm">
                              {errors.profile}
                            </div>
                          ) : null}
                        </label>

                        <label className="block ml-6">
                          <label className="form-label">GOOD CONDUCT</label>
                          <Field name="good_conduct">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("good_conduct", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.good_conduct && touched.good_conduct ? (
                            <div className="text-red-600 text-sm">
                              {errors.good_conduct}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">ID</label>
                          <Field name="identity_card">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("identity_card", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.identity_card && touched.identity_card ? (
                            <div className="text-red-600 text-sm">
                              {errors.identity_card}
                            </div>
                          ) : null}
                        </label>

                        <label className="block ml-6">
                          <label className="form-label">MEDICAL REPORT</label>
                          <Field name="medical_report">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("medical_report", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.medical_report && touched.medical_report ? (
                            <div className="text-red-600 text-sm">
                              {errors.medical_report}
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
    </>
  );
}
