"use client";

import { fbDb } from "@/firebase/configs";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SignUp() {
  const [processing, setProcessing] = useState(false);

  const doCreateAccount = async (formValues: {
    organisation: any;
    location: any;
  }) => {
    const { organisation, location } = formValues;

    if (!organisation || !location) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setProcessing(true);

      // Check if an organization with the same name already exists
      const organizationsCollection = collection(fbDb, "organizations");
      const querySnapshot = await getDocs(
        query(
          organizationsCollection,
          where("organisation", "==", organisation)
        )
      );

      if (!querySnapshot.empty) {
        toast.error("An organization with this name already exists.");
      } else {
        // If the organization doesn't exist, save it
        const docRef = await addDoc(organizationsCollection, formValues);
        console.log("Document written with ID:", docRef.id);
        toast.success("Organisation Successfully Added.");

        // router.push(
        //   `/adminInformation?organisationId=${encodeURIComponent(docRef.id)}`
        // );
      }
    } catch (error) {
      console.error("DO LOGIN ERROR:::", error);
      toast.error("Please enter the correct auth details.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="">
      <Formik
        initialValues={{
          organisation: "",
          location: "",
        }}
        onSubmit={(values) => doCreateAccount(values)}
      >
        {({ values, handleChange }) => (
          <Form className="mt-6">
            <h2 className="font-bold text-center">Create Account</h2>

            <div className="mt-5 p-4 grid gap-5 shadow-sm">
              <label className="block">
                <label className="form-label">Organisation Name</label>
                <Field
                  type="text"
                  name="organisation"
                  value={values.organisation}
                  onChange={handleChange}
                  className="form-input"
                />
              </label>
              <label className="block">
                <label className="form-label">Location</label>
                <Field
                  type="text"
                  name="location"
                  value={values.location}
                  onChange={handleChange}
                  className="form-input"
                />
              </label>
            </div>

            <div className="mt-5 w-full grid gap-5 justify-items-center">
              <button
                type="submit"
                disabled={processing}
                className="btn btn-primary w-full"
              >
                Next <i className="fa-solid fa-arrow-right"></i>
              </button>
              <Link
                href="/auth/sign-in"
                className="text-primary text-xs hover:underline"
              >
                Already have an account?
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
}
