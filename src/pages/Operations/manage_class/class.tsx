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
} from "firebase/firestore";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import toast from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import * as Yup from "yup";
import { CitiesTable } from "./classTable";
const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

const Headers = ["CLASS ID", "NAME"];

export default function Class() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedClasses, setfetchedClasses] = useState<DocumentData[]>([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<DocumentData | null>(null);
  const [editFormInitialValues, setEditFormInitialValues] = useState({
    name: "",
    classId: "",
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
  const handleAdd = () => {};

  const handleReset = () => {
    setOpen(false);
  };

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const filteredClients = fetchedClasses.filter((client) => {
    const fullName = `${client.name}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const handleEditClick = (client: DocumentData) => {
    setSelectedClass(client);
    setEditFormInitialValues({
      name: client.name,
      classId: client.classId,
      organisationId: client.organisationId,
      archive: client.archive,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedClass(null);
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (values: {
    name: any;
    classId: any;
    organisationId: any;
    archive: any;
  }) => {
    if (!selectedClass) {
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
      const vehicleRef = doc(fbDb, "classes", selectedClass.id);
      await setDoc(vehicleRef, {
        name: values.name,
        classId: values.classId,
        organisationId: values.organisationId,
        archive: values.archive,
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedClasses.map((client) =>
        client.id === selectedClass.id
          ? {
              ...client,
              name: values.name,
              classId: values.classId,
              organisationId: values.organisationId,
              archive: values.archive,
            }
          : client
      );

      setfetchedClasses(updatedVehicles);

      setSelectedClass(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Vehicle:", error);
    }
  };

  useEffect(() => {
    const fetchedClasses = async () => {
      const db = getFirestore();

      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(db, "classes"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const clientsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedClasses(clientsData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Classes:", error);
      }
    };
    fetchedClasses();
  }, [organisationId]);

  async function generateAdminId(organisationId: string) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fbDb, "classes"),
          where("organisationId", "==", organisationId)
        )
      );
      const adminCount = querySnapshot.size;

      // Customize this logic based on your requirements
      return `CS ${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching Classes count:", error);
      // Handle error or return a default value
      return "CS001";
    }
  }
  const handleAddClient = async (values: { name: any }) => {
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

      const existingDepartmentQuery = query(
        collection(fbDb, "classes"),
        where("name", "==", values.name),
        where("organisationId", "==", organisationId)
      );

      const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);

      if (!existingDepartmentSnapshot.empty) {
        console.error(
          "Class with this name already exists in the same organisation"
        );
        toast.error(`A Class with the name '${values.name}' already exists`);
        return;
      }

      if (organisationId === null) {
        console.error("organisationId is null");
        // Handle the null case, maybe show an error or return
        return;
      }
      const generatedClassId = await generateAdminId(organisationId);

      const clientsData = {
        name: values.name,
        classId: generatedClassId,
        archive: false,
        organisationId: organisationId,
      };

      const docRef = await addDoc(collection(fbDb, "classes"), clientsData);
      console.log("Class added with ID: ", docRef.id);
      toast.success("Class Successfully Added.");

      const newClass = {
        id: docRef.id,
        ...clientsData,
      };

      // Prepend the new driver to the fetchedDrivers state
      setfetchedClasses((prevClasses) => [newClass, ...prevClasses]);

      setOpen(false);
      setShowAddClassModal(false);
    } catch (error) {
      console.error("Error adding Class:", error);
    }
  };

  const updateFetchedClients = (
    updatedClasses: SetStateAction<DocumentData[]>
  ) => {
    setfetchedClasses(updatedClasses);
  };

  const hasAddPermission =
    userClaims?.additionalPermissions?.includes("Add Class") ||
    userClaims?.admin;
  const hasEditClassPermission =
    userClaims?.additionalPermissions?.includes("Edit Class") ||
    userClaims?.admin;
  const hasArchiveClassPermission =
    userClaims?.additionalPermissions?.includes("Archive Class") ||
    userClaims?.admin;

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
                    handleClick={handleAddClient}
                  >
                    <>
                      <PlusIcon className="h-6 w-6 mr-2" />
                      Add Class
                    </>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Tab.Panel>
            <div className="h-full overflow-y-auto">
              <CitiesTable
                clients={fetchedClasses}
                filteredClients={filteredClients}
                handleEditClick={handleEditClick}
                updateFetchedClients={updateFetchedClients}
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
                <div className="text-xl font-semibold ">NEW CLASS</div>
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
                onSubmit={(values) => handleAddClient(values)}

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

        {editModalOpen && selectedClass && (
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
      </div>
    </>
  );
}
