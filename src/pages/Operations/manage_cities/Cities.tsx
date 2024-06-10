import { Tab } from "@headlessui/react";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { Button, EditBtn } from "@/components/Buttons";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import SearchBar from "../../../components/Forms/input";
import firebaseApp, { fbDb } from "@/firebase/configs";
import {
  DocumentData,
  getDocs,
  collection,
  addDoc,
  query,
  where,
  getFirestore,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import toast from "react-hot-toast";
import * as Yup from "yup";

import { useAuthContext } from "@/components/Authentication/AuthProvider";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const Headers = ["CLIENT ID", "NAME"];

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  address: Yup.string().required("Address is required"),
  contact_details: Yup.string().required("Contact details are required"),
  representative_address: Yup.string().required(
    "Representative address is required"
  ),
  client_details: Yup.mixed().required("Client details are required"),
});

const EditvalidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  address: Yup.string().required("Address is required"),
  contact_details: Yup.string().required("Contact details are required"),
  representative_address: Yup.string().required(
    "Representative address is required"
  ),
  client_details: Yup.mixed().required("Client details are required"),
});

export default function Cities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedClients, setfetchedClients] = useState<DocumentData[]>([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<DocumentData | null>(
    null
  );

  const [editFormInitialValues, setEditFormInitialValues] = useState({
    name: "",
    address: "",
    contact_details: "",
    representative_address: "",
    client_details: null,
    clientId: "",
    organisationId: "",
    archive: false,
  });
  const { organisationId } = useAuthContext();

  const handleAdd = () => {};

  const handleReset = () => {
    setOpen(false);
  };

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const filteredClients = fetchedClients.filter((client) => {
    const fullName = `${client.name}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const handleEditClick = (client: DocumentData) => {
    setSelectedClient(client);
    setEditFormInitialValues({
      name: client.name,
      address: client.address,
      contact_details: client.contact_details,
      representative_address: client.representative_address,
      client_details: client.client_details,
      clientId: client.clientId,
      organisationId: client.organisationId,
      archive: client.name,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedClient(null);
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (values: {
    name: any;
    address: any;
    contact_details: any;
    representative_address: any;
    client_details: any;
    clientId: any;
    organisationId: any;
    archive: any;
  }) => {
    if (!selectedClient) {
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
      if (!values.address) {
        console.error("Required form fields are missing");
        toast.error("please fill the  Address  field");
        return;
      }
      if (!values.contact_details) {
        console.error("Required form fields are missing");
        toast.error("please fill the Contact details field");
        return;
      }
      if (!values.representative_address) {
        console.error("Required form fields are missing");
        toast.error("please fill the Representative Address field");
        return;
      }
      if (!values.client_details) {
        console.error("Required form fields are missing");
        toast.error("please fill the Client field");
        return;
      }

      // Update the vehicle data in the database using the selectedVehicle.id
      const vehicleRef = doc(fbDb, "clients", selectedClient.id);
      await setDoc(vehicleRef, {
        name: values.name,
        address: values.address,
        contact_details: values.contact_details,
        representative_address: values.representative_address,
        client_details: values.client_details,
        clientId: values.clientId,
        organisationId: values.organisationId,
        archive: values.archive,
      });

      // Update the local fetchedVehicles state
      const updatedVehicles = fetchedClients.map((client) =>
        client.id === selectedClient.id
          ? {
              ...client,
              name: values.name,
              address: values.address,
              contact_details: values.contact_details,
              representative_address: values.representative_address,
              client_details: values.client_details,
              clientId: values.clientId,
              organisationId: values.organisationId,
              archive: values.archive,
            }
          : client
      );

      setfetchedClients(updatedVehicles);

      setSelectedClient(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Vehicle:", error);
    }
  };

  useEffect(() => {
    const fetchedClients = async () => {
      const db = getFirestore();

      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(db, "clients"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const departmentsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedClients(departmentsData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Clients:", error);
      }
    };
    fetchedClients();
  }, [organisationId]);

  async function generateCitiesId(organisationId: string) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fbDb, "clients"),
          where("organisationId", "==", organisationId)
        )
      );
      const adminCount = querySnapshot.size;

      // Customize this logic based on your requirements
      return `CL${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching Client count:", error);
      // Handle error or return a default value
      return "CL001";
    }
  }

  const updateFetchedClients = (
    updatedClients: SetStateAction<DocumentData[]>
  ) => {
    setfetchedClients(updatedClients);
  };

  const handleAddClient = async (values: {
    name: any;
    address: any;
    contact_details: any;
    representative_address: any;
    client_details: any;
  }) => {
    console.log("Submitted Values:", values);
    setOpen(true);
    setShowAddClientModal(true);

    try {
      if (!values) {
        console.error("Form values are undefined");
        return;
      }

      if (
        !values.name ||
        !values.address ||
        !values.contact_details ||
        !values.representative_address ||
        !values.client_details
      ) {
        console.error("Required form fields are missing");
        return;
      }

      let clientDetailsImageUrl = "";
      if (values.client_details) {
        const storage = getStorage(firebaseApp);
        const storageRef = ref(
          storage,
          `client_details/${values.client_details.name}`
        );

        await uploadBytes(storageRef, values.client_details);
        clientDetailsImageUrl = await getDownloadURL(storageRef);
        console.log("Client Details URL:", clientDetailsImageUrl);
      }

      const existingDepartmentQuery = query(
        collection(fbDb, "clients"),
        where("name", "==", values.name),
        where("organisationId", "==", organisationId)
      );

      const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);

      if (!existingDepartmentSnapshot.empty) {
        console.error(
          "Client with this name already exists in the same organisation"
        );
        toast.error(`A Client with the name '${values.name}' already exists`);
        return;
      }

      if (organisationId === null) {
        console.error("organisationId is null");
        // Handle the null case, maybe show an error or return
        return;
      }
      const generatedCitiesId = await generateCitiesId(organisationId);

      const clientsData = {
        name: values.name,
        address: values.address,
        contact_details: values.contact_details,
        representative_address: values.representative_address,
        client_details: clientDetailsImageUrl,
        clientId: generatedCitiesId,
        organisationId: organisationId,
        archive: false,
      };

      const docRef = await addDoc(collection(fbDb, "clients"), clientsData);
      console.log("Client added with ID: ", docRef.id);

      const newClient = {
        id: docRef.id,
        ...clientsData,
      };

      // Prepend the new driver to the fetchedDrivers state
      setfetchedClients((prevJobcards) => [newClient, ...prevJobcards]);

      setOpen(false);
      setShowAddClientModal(false);
    } catch (error) {
      console.error("Error adding Client:", error);
    }
  };

  return (
    <>
      <div className="mt-2 h-full">
        <Tab.Group>
          <div className="flex w-full justify-end">
            <div className="bg-white">
              <div className="flex Justify-end">
                <Button
                  className="rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2"
                  handleClick={handleAddClient}
                >
                  <>
                    <PlusIcon className="h-6 w-6 mr-2" />
                    Add Client
                  </>
                </Button>
              </div>
            </div>
          </div>

          <Tab.Panel>
            <div className="h-full overflow-y-auto">
              <CitiesTable
                clients={fetchedClients}
                filteredClients={filteredClients}
                handleEditClick={handleEditClick}
                updateFetchedClients={updateFetchedClients}
              />
            </div>
          </Tab.Panel>
        </Tab.Group>

        {showAddClientModal && (
          <FormModal open={showAddClientModal} setOpen={setShowAddClientModal}>
            <div className="p-8">
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">ADD NEW CLIENT</div>
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
                  address: "",
                  contact_details: "",
                  representative_address: "",
                  client_details: null,
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => handleAddClient(values)}
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
                          <label className="form-label">ADDRESS</label>
                          <Field
                            type="text"
                            name="address"
                            value={values.address}
                            className="form-input bg-grey w-48"
                          />
                          {errors.address && touched.address ? (
                            <div className="text-red-600 text-sm">
                              {errors.address}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">CONTACT DETAILS</label>
                          <Field
                            type="text"
                            name="contact_details"
                            value={values.contact_details}
                            className="form-input bg-grey w-48"
                          />
                          {errors.contact_details && touched.contact_details ? (
                            <div className="text-red-600 text-sm">
                              {errors.contact_details}
                            </div>
                          ) : null}
                        </label>

                        <label className="block">
                          <label className="form-label">
                            REPRESENTATIVE ADDRESS
                          </label>
                          <Field
                            type="text"
                            name="representative_address"
                            value={values.representative_address}
                            className="form-input bg-grey w-48"
                          />
                          {errors.representative_address &&
                          touched.representative_address ? (
                            <div className="text-red-600">
                              {errors.representative_address}
                            </div>
                          ) : null}
                        </label>
                      </div>

                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">CLIENT DETAILS</label>
                          <Field name="client_details">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("client_details", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.client_details && touched.client_details ? (
                            <div className="text-red-600 text-sm">
                              {errors.client_details}
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

        {/* Edit client modal */}
        {editModalOpen && selectedClient && (
          <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
            <div>
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">
                  Edit Client Details
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
                          <label className="form-label">ADDRESS</label>
                          <Field
                            type="text"
                            name="address"
                            value={values.address}
                            className="form-input bg-grey w-48"
                          />
                          {errors.address && touched.address ? (
                            <div className="text-red-600 text-sm">
                              {errors.address}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">CONTACT DETAILS</label>
                          <Field
                            type="text"
                            name="contact_details"
                            value={values.contact_details}
                            className="form-input bg-grey w-48"
                          />
                          {errors.contact_details && touched.contact_details ? (
                            <div className="text-red-600 text-sm">
                              {errors.contact_details}
                            </div>
                          ) : null}
                        </label>

                        <label className="block">
                          <label className="form-label">
                            REPRESENTATIVE ADDRESS
                          </label>
                          <Field
                            type="text"
                            name="representative_address"
                            value={values.representative_address}
                            className="form-input bg-grey w-48"
                          />
                          {errors.representative_address &&
                          touched.representative_address ? (
                            <div className="text-red-600 text-sm">
                              {errors.representative_address}
                            </div>
                          ) : null}
                        </label>
                      </div>

                      <div className="flex w-full justify-between mt-8">
                        <label className="block">
                          <label className="form-label">CLIENT DETAILS</label>
                          <Field name="client_details">
                            {({ field, form }: any) => (
                              <input
                                type="file"
                                onChange={(event) => {
                                  const file = event.currentTarget?.files?.[0];
                                  if (file) {
                                    form.setFieldValue("client_details", file);
                                  }
                                }}
                              />
                            )}
                          </Field>
                          {errors.client_details && touched.client_details ? (
                            <div className="text-red-600 text-sm">
                              {errors.client_details}
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

interface ClientsTableProps {
  clients: DocumentData[];
  filteredClients: DocumentData[];
  updateFetchedClients: (updatedClients: DocumentData[]) => void;
  handleEditClick: any;
}

function CitiesTable({
  clients,
  updateFetchedClients,
  handleEditClick,
}: ClientsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const filteredClients = clients.filter((client) => {
    const fullName = `${client.name}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a.archive && !b.archive) {
      return 1; // a should come after b (archived vehicles come after non-archived)
    } else if (!a.archive && b.archive) {
      return -1; // a should come before b
    } else {
      return 0; // no change in order
    }
  });

  // const visibleClients = sortedClients.slice(startIndex, endIndex);
  const visibleClients = sortedClients.slice(startIndex, endIndex);
  // .filter((client) => !client.archive);
  const updateVehicleStatusInDatabase = async (
    clientId: string,
    newStatus: boolean
  ) => {
    try {
      const vehicleRef = doc(fbDb, "clients", clientId);
      await setDoc(vehicleRef, { archive: newStatus }, { merge: true });
      console.log("Vehicle status updated in the database:", clientId);

      const updatedVehicles = clients.map((client) =>
        client.id === clientId ? { ...client, archive: newStatus } : client
      );
      updateFetchedClients(updatedVehicles);
    } catch (error) {
      console.error("Error updating Vehicle status in database:", error);
    }
  };

  // const Headers = ["VEHICLE ID", "VEHICLE TYPE", "LICENSE PLATE"]

  return (
    <>
      <p className="text-base ml-10 font-bold">Clients</p>
      <div className="flex  text-base mt-2 ml-8 w-72 searchBarContainer">
        <SearchBar
          placeholder="Search For Clients"
          value={searchQuery}
          onChange={handleSearchChange}
          className="ml-5"
        />
      </div>

      <div className="ml-5 px-4 sm:px-6 lg:px-8">
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
                      CLIENT ID
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      NAME
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#FAFAFB]">
                  {visibleClients.map((clients, index) => {
                    // const clientId = `C${(index + 1)
                    //   .toString()
                    //   .padStart(3, "0")}`;
                    // console.log("Client ID", clientId);

                    return (
                      <Fragment key={index}>
                        <tr className="hover:bg-gray-100">
                          <td className="whitespace-nowrap font-nunito font-regular pt-1 pl-4 pr-3 text-d-blue text-base sm:pl-0">
                            {clients.clientId}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {clients.name}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 relative flex flex-row">
                            <div onClick={() => handleEditClick(clients)}>
                              <EditBtn />
                            </div>
                            <div>
                              <button
                                className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2 ml-4"
                                onClick={() =>
                                  updateVehicleStatusInDatabase(
                                    clients.id,
                                    !clients.archive
                                  )
                                }
                              >
                                {clients.archive ? "Unarchive" : "Archive"}
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
            </div>
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
          disabled={endIndex >= filteredClients.length}
        >
          Next
        </button>
      </div>
    </>
  );
}
