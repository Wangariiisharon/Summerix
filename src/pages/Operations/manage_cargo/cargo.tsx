import { Tab } from "@headlessui/react";
import { Fragment, useEffect, useState, SetStateAction } from "react";
import { Button, EditBtn } from "@/components/Buttons";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import SearchBar from "../../../components/Forms/input";
import { fbDb } from "@/firebase/configs";
import {
  DocumentData,
  getDocs,
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getFirestore,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import toast from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import * as Yup from "yup";
import CargoTable from "./cargoTable";
const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

const Headers = ["CLASS ID", "NAME"];

export default function Cargo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedCargo, setfetchedCargo] = useState<DocumentData[]>([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showAddCargoModal, setShowAddCargoModal] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<DocumentData | null>(null);
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    name: "",
    cargoId: "",
    organisationId: "",
    archive: false,
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
  const handleAdd = () => {};

  const handleReset = () => {
    setOpen(false);
  };

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const filteredCargo = fetchedCargo.filter((cargo) => {
    const fullName = `${cargo.name}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const handleEditClick = (client: DocumentData) => {
    setSelectedCargo(client);
    setEditFormInitialValues({
      name: client.name,
      cargoId: client.cargoId,
      organisationId: client.organisationId,
      archive: client.archive,
      addedBy: client.addedBy,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedCargo(null);
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (values: {
    name: any;
    cargoId: any;
    organisationId: any;
    archive: any;
  }) => {
    if (!selectedCargo) {
      console.error("No selected Cargo to update");
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
      const vehicleRef = doc(fbDb, "cargos", selectedCargo.id);
      await setDoc(vehicleRef, {
        name: values.name,
        cargoId: values.cargoId,
        organisationId: values.organisationId,
        archive: values.archive,
        addedBy: currentUser?.email,
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedCargo.map((cargo) =>
        cargo.id === selectedCargo.id
          ? {
              ...cargo,
              name: values.name,
              cargoId: values.cargoId,
              organisationId: values.organisationId,
              archive: values.archive,
            }
          : cargo
      );
      toast.success("Cargo updated successfully");
      setfetchedCargo(updatedVehicles);
      setSelectedCargo(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Vehicle:", error);
    }
  };

  useEffect(() => {
    const fetchedCargos = async () => {
      const db = getFirestore();

      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(db, "cargos"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const clientsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedCargo(clientsData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Classes:", error);
      }
    };
    fetchedCargos();
  }, [organisationId]);

  async function generateCargotId(organisationId: string) {
    const counterRef = doc(fbDb, "organisationCargoCounters", organisationId);

    try {
      const cargoId = await runTransaction(fbDb, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newCargoCount = 1;

        if (counterDoc.exists()) {
          newCargoCount = counterDoc.data().cargoCounter + 1;
          transaction.update(counterRef, {
            cargoCounter: newCargoCount,
          });
        } else {
          transaction.set(counterRef, {
            cargoCounter: newCargoCount,
          });
        }

        return `C${newCargoCount.toString().padStart(3, "0")}`;
      });

      return cargoId;
    } catch (error) {
      console.error("Error generating cargo ID:", error);
    }
  }
  const handleAddCargo = async (values: { name: any }) => {
    console.log("Submitted Values:", values);
    setOpen(true);

    try {
      if (!values) {
        console.error("Form values are undefined");
        return;
      }

      if (!values.name) {
        console.error("Required form fields are missing");
        return;
      }

      const existingCargoQuery = query(
        collection(fbDb, "cargos"),
        where("name", "==", values.name),
        where("organisationId", "==", organisationId)
      );

      const existingCargoSnapshot = await getDocs(existingCargoQuery);

      if (!existingCargoSnapshot.empty) {
        console.error(
          "Cargo with this name already exists in the same organisation"
        );
        toast.error(`A Cargo with the name '${values.name}' already exists`);
        return;
      }

      if (organisationId === null) {
        console.error("organisationId is null");
        return;
      }
      const generatedCargoId = await generateCargotId(organisationId);
      const cargoData = {
        name: values.name,
        cargoId: generatedCargoId,
        archive: false,
        organisationId: organisationId,
        addedBy: currentUser?.email,
      };

      const docRef = await addDoc(collection(fbDb, "cargos"), cargoData);
      console.log("Cargo added with ID: ", docRef.id);
      toast.success("Cargo Successfully Added.");

      setOpen(false);
      setShowAddCargoModal(false);
    } catch (error) {
      console.error("Error adding Class:", error);
    }
  };

  const updateFetchedCargos = (
    updatedCargos: SetStateAction<DocumentData[]>
  ) => {
    setfetchedCargo(updatedCargos);
  };

  const hasAddPermission =
    userClaims?.additionalPermissions?.includes("Add Class") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Add Class");
  const hasEditClassPermission =
    userClaims?.additionalPermissions?.includes("Edit Class") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Edit Class");
  const hasArchiveClassPermission =
    userClaims?.additionalPermissions?.includes("Archive Class") ||
    userClaims?.admin ||
    departmentData?.permissions?.includes("Archive Class");

  return (
    <>
      <div className="mt-2 h-full">
        <Tab.Group>
          <div className="flex w-full justify-end">
            <div className="bg-white">
              <div className="flex Justify-end">
                {hasAddPermission && (
                  <Button
                    className="rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2"
                    handleClick={handleAddCargo}
                  >
                    <>
                      <PlusIcon className="h-6 w-6 mr-2" />
                      Add Cargo
                    </>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Tab.Panel>
            <div className="h-full overflow-y-auto">
              <CargoTable
                cargos={fetchedCargo}
                filteredCargos={filteredCargo}
                handleEditClick={handleEditClick}
                updateFetchedCargos={updateFetchedCargos}
                hasEditClassPermission={hasEditClassPermission}
                hasArchiveClassPermission={hasArchiveClassPermission}
              />
            </div>
          </Tab.Panel>
        </Tab.Group>

        {open && (
          <FormModal open={open} setOpen={setOpen}>
            <div className="p-5">
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">NEW CARGO</div>
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
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => handleAddCargo(values)}

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

        {editModalOpen && selectedCargo && (
          <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
            <div>
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">EDIT CARGO DETAILS</div>
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
                        <label className="block">
                          <label className="form-label">EDITED BY</label>
                          <Field
                            type="text"
                            disabled
                            name="addedBy"
                            value={values.addedBy}
                            className="form-input bg-grey w-48"
                          />
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
