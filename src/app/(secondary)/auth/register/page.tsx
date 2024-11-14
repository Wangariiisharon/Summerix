"use client";

import * as Yup from "yup";
import { fbAuth, fbDb } from "@/firebase/configs";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { getClientByEmail } from "@/services/client";
import Constants from "@/Constants";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignUpSchema = () => {
  return Yup.object().shape({
    firstName: Yup.string().trim().required("First name is required."),
    lastName: Yup.string().trim().required("Last name is required."),
    email: Yup.string()
      .trim()
      .required("Email is required.")
      .email("Enter a valid email address.")
      .test({
        exclusive: true,
        name: "client-email",
        message: "Email is already in use.",
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getClientByEmail(value);
          if (!snapshot.empty) {
            const id = this.parent.docId;
            const doc = snapshot.docs[0];
            return doc.id?.trim() === id?.trim();
          }

          return snapshot.empty;
        },
      }),
    password: Yup.string().required("Password is required."),
    password2: Yup.string()
      .required("Confirm password is required.")
      .oneOf([Yup.ref("password")], "Passwords do not match."),
  });
};

export default function RegisterPage() {
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const doSignUpWithEmailAndPassword = async (formValues: any) => {
    console.debug("doSignUpWithEmailAndPassword > formValues:", formValues);

    try {
      setProcessing(true);

      const userCredential = await createUserWithEmailAndPassword(
        fbAuth,
        formValues.email,
        formValues.password!
      );

      if (userCredential && userCredential.user) {
        formValues.displayName = `${formValues.firstName.trim()} ${formValues.lastName.trim()}`;

        const docRef = doc(fbDb, Constants.fbClients, userCredential.user.uid);
        await setDoc(
          docRef,
          {
            email: formValues.email.trim(),
            firstName: formValues.firstName.trim(),
            lastName: formValues.lastName.trim(),
            displayName: formValues.displayName.trim(),

            dateCreated: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );
        toast.success("Account created successfully.");
        router.push("/");
      }
    } catch (error) {
      console.error("doSignUpWithEmailAndPassword error:", error);
      toast.error("Create account failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="">
      <Formik
        enableReinitialize={true}
        initialValues={{
          email: "",
          password: "",
          password2: "",
          firstName: "",
          lastName: "",
          displayName: "",
        }}
        validationSchema={SignUpSchema()}
        onSubmit={(values) => doSignUpWithEmailAndPassword(values)}
      >
        {({ errors, isValid }) => (
          <Form className="mt-6">
            <h2 className="font-bold text-center">New account setup</h2>

            <div className="mt-5 p-4 grid gap-5 shadow-sm">
              <label className="block">
                <label className="form-label">First Name</label>
                <Field
                  type="text"
                  name="firstName"
                  placeholder="Your first name"
                  className="form-input"
                />
                <ErrorMessage
                  name="firstName"
                  component="span"
                  className="form-error"
                />
              </label>
              <label className="block">
                <label className="form-label">Last Name</label>
                <Field
                  type="text"
                  name="lastName"
                  placeholder="Your last name"
                  className="form-input"
                />
                <ErrorMessage
                  name="lastName"
                  component="span"
                  className="form-error"
                />
              </label>
              <label className="block">
                <label className="form-label">Email Address</label>
                <Field
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  className="form-input"
                />
                <ErrorMessage
                  name="email"
                  component="span"
                  className="form-error"
                />
              </label>
              <label className="block">
                <label className="form-label">Password</label>
                <Field
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="form-input"
                />
                <ErrorMessage
                  name="password"
                  component="span"
                  className="form-error"
                />
              </label>
              <label className="block">
                <label className="form-label">Confirm Password</label>
                <Field
                  type="password"
                  name="password2"
                  placeholder="Confirm your password"
                  className="form-input"
                />
                <ErrorMessage
                  name="password2"
                  component="span"
                  className="form-error"
                />
              </label>
            </div>

            <div className="mt-5 w-full grid gap-5 justify-items-center">
              <button
                type="submit"
                disabled={!isValid || processing}
                className="btn btn-primary w-full"
              >
                Sign Up <i className="fa-solid fa-arrow-right"></i>
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
