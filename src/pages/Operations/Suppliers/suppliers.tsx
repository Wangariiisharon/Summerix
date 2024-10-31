import React from "react";
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
  runTransaction,
} from "firebase/firestore";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import toast from "react-hot-toast";
import * as Yup from "yup";
import SuppliersTable from "./suppliersTable";

import { useAuthContext } from "@/components/Authentication/AuthProvider";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const Headers = ["SUPPLIER ID", "SUPPLIER", "TYPE"];

const validationSchema = Yup.object({
  supplier: Yup.string().required("Supplier is required"),
  type: Yup.string().required("Type is required"),
});
export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedSuppliers, setfetchedSuppliers] = useState<DocumentData[]>([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<DocumentData | null>(
    null
  );

  const [editFormInitialValues, setEditFormInitialValues] = useState({
    supplier: "",
    type: "",
    supplierId: "",
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

  const handleReset = () => {
    setOpen(false);
    setShowAddSupplierModal(false);
  };

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const filteredClients = fetchedSuppliers.filter((supplier) => {
    const fullName = `${supplier.supplier}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const handleEditClick = (supplier: DocumentData) => {
    setSelectedSupplier(supplier);
    setEditFormInitialValues({
      supplier: supplier.supplier,
      type: supplier.type,
      supplierId: supplier.supplierId,
      organisationId: supplier.organisationId,
      archive: supplier.archive,
      addedBy: supplier.addedBy,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedSupplier(null);
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (values: {
    supplier: any;
    type: any;
    supplierId: any;
    organisationId: any;
    archive: any;
    addedBy: any;
  }) => {
    if (!selectedSupplier) {
      console.error("No selected supplier to update");
      return;
    }

    console.log("Edited Values:", values);

    try {
      if (!values.supplier) {
        console.error("Required form fields are missing");
        toast.error("please fill the Supplier field");
        return;
      }
      if (!values.type) {
        console.error("Required form fields are missing");
        toast.error("please fill the  Type  field");
        return;
      }

      // Update the vehicle data in the database using the selectedVehicle.id
      const supplierRef = doc(fbDb, "suppliers", selectedSupplier.id);
      await setDoc(supplierRef, {
        supplier: values.supplier,
        type: values.type,
        supplierId: values.supplierId,
        organisationId: values.organisationId,
        archive: values.archive,
        addedBy: currentUser?.email,
      });

      setSelectedSupplier(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating Supplier:", error);
    }
  };

  useEffect(() => {
    const fetchedSuppliers = async () => {
      const db = getFirestore();

      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(db, "suppliers"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const departmentsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedSuppliers(departmentsData);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Suppliers:", error);
      }
    };
    fetchedSuppliers();
  }, [organisationId]);

  async function generateSuppliersId(organisationId: string) {
    const counterRef = doc(
      fbDb,
      "organisationSuppliersCounters",
      organisationId
    );

    try {
      const supplierId = await runTransaction(fbDb, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newSupplierCount = 1;

        if (counterDoc.exists()) {
          newSupplierCount = counterDoc.data().supplierCounter + 1;
          transaction.update(counterRef, { supplierCounter: newSupplierCount });
        } else {
          transaction.set(counterRef, { supplierCounter: newSupplierCount });
        }

        return `S${newSupplierCount.toString().padStart(3, "0")}`;
      });

      return supplierId;
    } catch (error) {
      console.error("Error generating Supplier ID:", error);
      // return "T001"; // Return default value in case of an error
    }
  }
  const updateFetchedSuppliers = (
    updatedSuppliers: SetStateAction<DocumentData[]>
  ) => {
    setfetchedSuppliers(updatedSuppliers);
  };

  const handleAddSupplier = async (values: { supplier: any; type: any }) => {
    console.log("Submitted Values:", values);
    setOpen(true);
    setShowAddSupplierModal(true);

    try {
      const existingDepartmentQuery = query(
        collection(fbDb, "suppliers"),
        where("supplier", "==", values.supplier),
        where("organisationId", "==", organisationId)
      );

      const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);

      if (!existingDepartmentSnapshot.empty) {
        console.error(
          "Supplier with this already exists in the same organisation"
        );
        toast.error(`Supplier '${values.supplier}' already exists`);
        return;
      }

      if (organisationId === null) {
        console.error("organisationId is null");
        return;
      }
      const generatedSupplierId = await generateSuppliersId(organisationId);

      const suppliersData = {
        supplier: values.supplier,
        type: values.type,
        supplierId: generatedSupplierId,
        organisationId: organisationId,
        archive: false,
        addedBy: currentUser?.email,
      };

      const docRef = await addDoc(collection(fbDb, "suppliers"), suppliersData);
      console.log("Supplier added with ID: ", docRef.id);

      setOpen(false);
      setShowAddSupplierModal(false);
    } catch (error) {
      console.error("Error adding Supplier:", error);
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
                  handleClick={handleAddSupplier}
                >
                  <>
                    <PlusIcon className="h-6 w-6 mr-2" />
                    Add Supplier
                  </>
                </Button>
              </div>
            </div>
          </div>

          <Tab.Panel>
            <div className="h-full overflow-y-auto">
              <SuppliersTable
                suppliers={fetchedSuppliers}
                filteredClients={filteredClients}
                handleEditClick={handleEditClick}
                updateFetchedSuppliers={updateFetchedSuppliers}
              />
            </div>
          </Tab.Panel>
        </Tab.Group>

        {showAddSupplierModal && (
          <FormModal
            open={showAddSupplierModal}
            setOpen={setShowAddSupplierModal}
          >
            <div className="p-8">
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">ADD NEW SUPPLIER</div>
                <Button
                  className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                  handleClick={handleReset}
                >
                  <XMarkIcon className="h-6 w-6 text-red-400" />
                </Button>
              </div>

              <Formik
                initialValues={{
                  supplier: "",
                  type: "",
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => handleAddSupplier(values)}
              >
                {({ values, errors, touched }) => (
                  <Form>
                    <div className="">
                      <div className="flex w-full justify-between">
                        <label className="block">
                          <label className="form-label">SUPPLIER</label>
                          <Field
                            type="text"
                            name="supplier"
                            value={values.supplier}
                            className="form-input bg-grey w-48"
                          />
                          {errors.supplier && touched.supplier ? (
                            <div className="text-red-600 text-sm">
                              {errors.supplier}
                            </div>
                          ) : null}
                        </label>

                        <label className="block">
                          <label className="form-label">TYPE</label>
                          <Field
                            type="text"
                            name="type"
                            value={values.type}
                            className="form-input bg-grey w-48"
                          />
                          {errors.type && touched.type ? (
                            <div className="text-red-600 text-sm">
                              {errors.type}
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

        {editModalOpen && selectedSupplier && (
          <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
            <div>
              <div className="flex w-full h-full justify-between items-center mb-12">
                <div className="text-xl font-semibold ">
                  Edit Supplier Details
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
                          <label className="form-label">SUPPLIER</label>
                          <Field
                            type="text"
                            name="supplier"
                            value={values.supplier}
                            className="form-input bg-grey w-48"
                          />
                          {errors.supplier && touched.supplier ? (
                            <div className="text-red-600 text-sm">
                              {errors.supplier}
                            </div>
                          ) : null}
                        </label>

                        <label className="block">
                          <label className="form-label">TYPE</label>
                          <Field
                            type="text"
                            name="type"
                            value={values.type}
                            className="form-input bg-grey w-48"
                          />
                          {errors.type && touched.type ? (
                            <div className="text-red-600 text-sm">
                              {errors.type}
                            </div>
                          ) : null}
                        </label>
                      </div>
                      <label className="block mt-8">
                        <label className="form-label">EDITED BY</label>
                        <Field
                          type="text"
                          disabled
                          name="addedBy"
                          value={values.addedBy}
                          className="form-input bg-grey w-48"
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
    </>
  );
}
