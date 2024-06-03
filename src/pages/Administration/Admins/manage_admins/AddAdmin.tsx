import firebase from "firebase/app";
import "firebase/firestore";
import { Tab } from "@headlessui/react";
import { SetStateAction, useEffect, useState } from "react";
import { FormModal, NewFormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import firebaseApp, { fbDb } from "@/firebase/configs";

import {
  User,
  createUserWithEmailAndPassword,
  getAuth,
  sendSignInLinkToEmail,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  getDocs,
  where,
  DocumentData,
  getDoc,
  onSnapshot,
  DocumentReference,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import axios from "axios";
import "firebase/firestore";
import * as Yup from "yup";
import React from "react";

interface DepartmentData {
  name: string;
}
interface AdminData {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  department: DocumentReference<DocumentData> | string;
  status: boolean;
  super_admin: boolean;
  archive: boolean;
}
interface Country {
  cca3: string;
  name: {
    common: string;
  };
}
interface AddAdminProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export default function AddAdmin({ open, setOpen }: AddAdminProps) {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  let { currentUser, organisationId, isSuperAdmin } = useAuthContext();
  const [departments, setDepartments] = useState<DocumentData[]>([]);

  const validationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    email: Yup.string().required("Email details are required"),
    phonenumber: Yup.string().required("Phone number address is required"),
    department: Yup.string().required("Department is required"),
    country: Yup.string().required("Country is required"),
    role: Yup.string().required("Role is required"),
  });
  async function generateAdminId(organisationId: string | null) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fbDb, "admins"),
          where("organisationId", "==", organisationId)
        )
      );
      const adminCount = querySnapshot.size;

      // Customize this logic based on your requirements
      return `U${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching admins count:", error);
      // Handle error or return a default value
      return "U001";
    }
  }
  const auth = getAuth(firebaseApp);
  // const user = currentUser(auth);
  const user = auth.currentUser;
  const inviterUid = user ? user.uid : null;
  const handleSubmit = async (values: {
    firstname: any;
    lastname: any;
    email: any;
    phonenumber: any;
    country: any;
    role: any;
    invitationSent: boolean;
    department: string;
  }) => {
    console.log("Submitted Values:", values);

    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        "Random"
      );
      const authUid = userCredential.user.uid;

      // Check if user with the given email already exists
      const existingAdminQuery = query(
        collection(fbDb, "admins"),
        where("email", "==", values.email),
        where("organisationId", "==", organisationId)
      );

      const existingAdminSnapshot = await getDocs(existingAdminQuery);

      if (!existingAdminSnapshot.empty) {
        console.error(
          "User with this email already exists in the organization"
        );
        toast.error(
          `A User with the Email '${values.email}' already exists in the organization`
        );
        return;
      }
      // Assuming 'inviters' is the collection where inviter data is stored
      const inviterQuery = query(
        collection(fbDb, "admins"),
        where("userId", "==", inviterUid)
      );
      const inviterSnapshot = await getDocs(inviterQuery);

      console.log("Inviter Snapshot:", inviterSnapshot);

      if (!inviterSnapshot.empty) {
        // The inviter's data is found
        const inviterData = inviterSnapshot.docs[0].data();

        // Access the organisationId from inviterData
        organisationId = inviterData.organisationId;
        // Now you can use organisationId as needed
        console.log("Organisation ID:", organisationId);
      } else {
        // Inviter not found
        console.error("Inviter not found");
      }
      const generatedAdminId = await generateAdminId(organisationId);
      const adminData = {
        adminId: generatedAdminId,
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phonenumber: values.phonenumber,
        status: true,
        country: values.country,
        role: values.role,
        department: values.department, // Use the selected department reference directly
        inviterUid: inviterUid,
        organisationId: organisationId,
        userId: authUid,
        archive: false,
      };

      const docRef = await addDoc(collection(fbDb, "admins"), adminData);
      console.log("Admin added with ID: ", docRef.id);
      toast.success("Admin Successfully Added.");
      const newAdmin = {
        id: docRef.id,
        ...adminData,
      };

      setFetchedAdmins((prevAdmins) => [newAdmin, ...prevAdmins]);

      if (!values.invitationSent) {
        // Authentication
        const auth = getAuth(firebaseApp);

        // Send invitation email
        const actionCodeSettings = {
          url: `https://truck-it-bf0b2.web.app/auth?adminId=${docRef.id}`,
          handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);

        // Mark the invitation as sent in Firestore
        await updateDoc(docRef, {
          invitationSent: true,
        });

        console.log("Invitation email sent successfully");
      }

      // Close your form or perform any other necessary actions
      setOpen(false);
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Error adding admin. Please try again.");
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentQuery = query(
          collection(fbDb, "departments"),
          where("organisationId", "==", organisationId), // Filter by organisationId
          where("archive", "==", false)
        );
        const departmentSnapshot = await getDocs(departmentQuery);

        if (departmentSnapshot.empty) {
          console.log("No departments found for the given organisation.");
          setDepartments([]);
          return;
        }

        const departmentData = departmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name, // Assuming department name is stored in the 'name' field
        }));

        setDepartments(departmentData);
        console.log("Departments:", departmentData);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countriesApi");
        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }
        const data = await response.json();
        setCountries(data);
        console.log("Countries:", data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setLoading(false);
      }
    };

    const fetchedAdmins = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(fbDb, "admins"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const adminsData = await Promise.all(
              querySnapshot.docs.map(async (doc) => {
                const adminData = doc.data() as AdminData;
                let departmentName = "Unknown Department";

                if (adminData.department instanceof DocumentReference) {
                  const deptDoc = await getDoc(adminData.department);
                  if (deptDoc.exists()) {
                    const deptData = deptDoc.data() as DepartmentData;
                    departmentName = deptData.name;
                  }
                } else {
                  departmentName = adminData.department;
                }

                return {
                  ...adminData,
                  department: departmentName,
                };
              })
            );
            setFetchedAdmins(adminsData);
          });

          return () => unsubscribe();
        } else {
          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching Admins:", error);
      }
    };

    fetchedAdmins();
    fetchDepartments();
    fetchCountries();
  }, [organisationId]);

  const handleAddAdmin = () => {
    setOpen(true);
  };

  return (
    <>
      <div>
        <NewFormModal open={open} setOpen={setOpen} heading="Add Memeber">
          <div className="p-5">
            <Formik
              initialValues={{
                firstname: "",
                lastname: "",
                email: "",
                phonenumber: "",
                department: "",
                country: "",
                role: "",
                invitationSent: false,
              }}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                handleSubmit(values);
                console.log(values);
              }}
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form>
                  <div className="space-y-6">
                    <div className="flex justify-between space-x-4">
                      <label className="block w-1/2">
                        <span className="form-label">First Name</span>
                        <Field
                          type="text"
                          name="firstname"
                          value={values.firstname}
                          className="form-input mt-1 block w-full bg-gray-100"
                        />
                        {errors.firstname && touched.firstname ? (
                          <div className="text-red-600 text-sm mt-1">
                            {errors.firstname}
                          </div>
                        ) : null}
                      </label>
                      <label className="block w-1/2">
                        <span className="form-label">Last Name</span>
                        <Field
                          type="text"
                          name="lastname"
                          value={values.lastname}
                          className="form-input mt-1 block w-full bg-gray-100"
                        />
                        {errors.lastname && touched.lastname ? (
                          <div className="text-red-600 text-sm mt-1">
                            {errors.lastname}
                          </div>
                        ) : null}
                      </label>
                    </div>
                    <label className="block">
                      <span className="form-label">Email</span>
                      <Field
                        type="email"
                        name="email"
                        value={values.email}
                        className="form-input mt-1 block w-full bg-gray-100"
                      />
                      {errors.email && touched.email ? (
                        <div className="text-red-600 text-sm mt-1">
                          {errors.email}
                        </div>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="form-label">Role</span>
                      <Field
                        as="select"
                        name="role"
                        value={values.role || ""}
                        className="form-input mt-1 block w-full bg-gray-100"
                        onChange={(event: any) =>
                          setFieldValue("role", event.target.value)
                        }
                      >
                        <option value="">Select Role</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                      </Field>
                      {errors.role && touched.role ? (
                        <div className="text-red-600 text-sm mt-1">
                          {errors.role}
                        </div>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="form-label">Country</span>
                      <Field
                        as="select"
                        name="country"
                        value={values.country || ""}
                        className="form-input mt-1 block w-full bg-gray-100"
                        onChange={(event: any) =>
                          setFieldValue("country", event.target.value)
                        }
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option
                            key={country.name.common}
                            value={country.name.common}
                          >
                            {country.name.common}
                          </option>
                        ))}
                      </Field>
                      {errors.country && touched.country ? (
                        <div className="text-red-600 text-sm mt-1">
                          {errors.country}
                        </div>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="form-label">Assign To Department</span>
                      <Field
                        as="select"
                        name="department"
                        value={values.department || ""}
                        className="form-input mt-1 block w-full bg-gray-100"
                        onChange={(event: any) =>
                          setFieldValue("department", event.target.value)
                        }
                      >
                        <option value="">Select Department</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.name}>
                            {department.name}
                          </option>
                        ))}
                      </Field>
                      {errors.department && touched.department ? (
                        <div className="text-red-600 text-sm mt-1">
                          {errors.department}
                        </div>
                      ) : null}
                    </label>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </NewFormModal>
      </div>
    </>
  );
}
