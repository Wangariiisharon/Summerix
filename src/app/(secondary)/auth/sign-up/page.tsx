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
        {({ errors, values, handleChange }) => (
          <Form className="">
            <div className="flex flex-col">
              <div className="m-4 px-4 grid gap-5 shadow-sm">
                <p className="font-inter font-bold text-base mt-4">
                  Create Account
                </p>
                <h1 className="text-sm font-mulish text-[#8692A6]">
                  Lets get you all set up
                </h1>
                <label className="block">
                  <label className="form-label font-mulish font-semibold">
                    Organisation Name
                  </label>
                  <Field
                    type="text"
                    name="organisation"
                    value={values.organisation}
                    onChange={handleChange}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label font-mulish font-semibold">
                    Location
                  </label>
                  <Field
                    type="text"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    className="form-input"
                  />
                </label>
              </div>
              <div className="my-5 mr-7 flex justify-center">
                <button
                  type="submit"
                  disabled={processing}
                  className="btn font-inter font-medium rounded-md btn-primary w-72 px-5"
                >
                  Next<i className="fa-solid fa-arrow-right ml-10"></i>
                </button>
              </div>
              <Link
                className="mt-15 ml-10 text-[#757575] underline text-xs "
                href="/auth/sign-in"
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
