import firebase from "firebase/app";
import "firebase/firestore";
import { useEffect, useState } from "react";
import { FormModal, NewFormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik/dist/index";
import firebaseApp, { fbDb } from "@/firebase/configs";
import country from "country-list-js";

import {
  createUserWithEmailAndPassword,
  getAuth,
  sendSignInLinkToEmail,
} from "firebase/auth";
import {
  collection,
  query,
  getDocs,
  where,
  addDoc,
  updateDoc,
  DocumentReference,
  onSnapshot,
  getDoc,
  DocumentData,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import * as Yup from "yup";
import React from "react";

interface DepartmentData {
  name: string;
}

// interface AdminData {
//   id: string;
//   firstname: string;
//   lastname: string;
//   email: string;
//   department: DocumentReference<DocumentData> | string;
//   status: boolean;
//   super_admin: boolean;
//   archive: boolean;
// }
interface AdminData {
  // id: string;
  adminId: string;
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  department: DocumentReference<DocumentData> | string;
  status: boolean;
  archive: boolean;
  country: string;
}

interface AddAdminProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

interface FormValues {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  department: string;
  country: string;
  role: string;
  invitationSent: boolean;
}

export default function AddAdmin({
  isModalOpen,
  setIsModalOpen,
}: AddAdminProps) {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const [error, setError] = useState<null | string>(null);
  const { currentUser, organisationId, isSuperAdmin } = useAuthContext();
  const [departments, setDepartments] = useState<DocumentData[]>([]);
  const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const validationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    email: Yup.string().required("Email is required"),
    phonenumber: Yup.string().required("Phone number is required"),
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
      return `U${(adminCount + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error fetching admins count:", error);
      return "U001";
    }
  }

  const handleSubmit = async (values: FormValues) => {
    console.log("handleSubmit called with values:", values);

    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        "Random"
      );
      const authUid = userCredential.user.uid;

      const existingAdminQuery = query(
        collection(fbDb, "admins"),
        where("email", "==", values.email),
        where("organisationId", "==", organisationId)
      );

      const existingAdminSnapshot = await getDocs(existingAdminQuery);

      if (!existingAdminSnapshot.empty) {
        toast.error(
          `A User with the Email '${values.email}' already exists in the organization`
        );
        return;
      }

      const inviterUid = auth.currentUser ? auth.currentUser.uid : null;
      const inviterQuery = query(
        collection(fbDb, "admins"),
        where("userId", "==", inviterUid)
      );
      const inviterSnapshot = await getDocs(inviterQuery);

      if (!inviterSnapshot.empty) {
        const inviterData = inviterSnapshot.docs[0].data();
      } else {
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
        department: values.department,
        inviterUid: inviterUid,
        organisationId: organisationId,
        userId: authUid,
        archive: false,
      };

      const docRef = await addDoc(collection(fbDb, "admins"), adminData);
      toast.success("Admin Successfully Added.");
      setFetchedAdmins((prevAdmins) => [
        { id: docRef.id, ...adminData },
        ...prevAdmins,
      ]);

      if (!values.invitationSent) {
        const actionCodeSettings = {
          url: `https://truck-it-bf0b2.web.app/auth?adminId=${docRef.id}`,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);
        await updateDoc(docRef, { invitationSent: true });
      }

      setIsModalOpen(false);
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
          where("organisationId", "==", organisationId),
          where("archive", "==", false)
        );
        const departmentSnapshot = await getDocs(departmentQuery);

        if (departmentSnapshot.empty) {
          setDepartments([]);
          return;
        }

        const departmentData = departmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));

        setDepartments(departmentData);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    const fetchCountries = () => {
      try {
        const country_names = country.names();
        setCountries(country_names);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setLoading(false);
      }
    };

    const fetchAdmins = async () => {
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

    fetchAdmins();
    fetchDepartments();
    fetchCountries();
  }, [organisationId]);

  return (
    <NewFormModal
      open={isModalOpen}
      setOpen={setIsModalOpen}
      heading="Add Member"
    >
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
          onSubmit={(values, { setSubmitting }) => {
            console.log("Form Submitted with values:", values);
            handleSubmit(values).finally(() => setSubmitting(false));
          }}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
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
                    {countries.map((country, index) => (
                      <option key={index} value={country}>
                        {country}
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
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-400 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-[#4FD1C5] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  + Add member
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </NewFormModal>
  );
}
