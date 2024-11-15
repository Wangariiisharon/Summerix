"use client";

import { useAuthContext } from "@/app/auth-provider";
import Constants from "@/Constants";
import { fbAuth, fbDb } from "@/firebase/configs";
import { doLoginApiCall } from "@/services/auth";
import {
  type AuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Field, Form, Formik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import * as Yup from "yup";

const EmailAuthSchema = () => {
  return Yup.object().shape({
    email: Yup.string().required("Email address is required."),
    password: Yup.string().required("Password is required."),
  });
};

export default function SignIn() {
  const { appCheck } = useAuthContext();
  const router = useRouter();

  const onSignInCallback = async (credential: UserCredential) => {
    console.debug("onSignInCallback > credential:", credential);

    if (credential && credential.user) {
      const idToken = await credential.user.getIdToken();
      await doLoginApiCall(idToken, appCheck);

      const docRef = doc(fbDb, Constants.fbClients, credential.user.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        await setDoc(
          docRef,
          {
            lastLoginDate: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          },
          { merge: true },
        );
        router.push("/dashboard");
      } else {
        router.push("/account");
      }
    }
  };

  const doSignInWithEmailAndPassword = async (formValues: any) => {
    console.debug("doSignInWithEmailAndPassword > formValues:", formValues);

    try {
      const credential = await signInWithEmailAndPassword(
        fbAuth,
        formValues.email,
        formValues.password,
      );
      await onSignInCallback(credential);
    } catch (error: any) {
      console.error("doSignInWithEmailAndPassword error:", error);
      if (error.code === "auth/invalid-credential") {
        toast.error("Please enter valid email & password.");
      } else {
        toast.error("Auth signin failed. Please try again.");
      }
    }
  };

  const doSignInWithPopup = async (provider: AuthProvider) => {
    try {
      const credential = await signInWithPopup(fbAuth, provider);
      await onSignInCallback(credential);
    } catch (error) {
      console.error("doSignInWithPopup error:", error);
      toast.error("Auth signin failed. Please try again.");
    }
  };

  return (
    <main className="">
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={EmailAuthSchema()}
        onSubmit={(values) => doSignInWithEmailAndPassword(values)}
      >
        {({ isValid }) => (
          <Form className="mt-6">
            <h2 className="font-bold text-center">Log in to your account</h2>

            <div className="my-5 p-4 grid gap-5 shadow-sm">
              <label className="block">
                <label className="form-label">Email address</label>
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  className="form-input"
                />
              </label>
              <label className="block">
                <label className="form-label">Password</label>
                <Field
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="form-input"
                />
              </label>
            </div>

            <div className="w-full px-4 flex justify-end text-xs">
              <Link
                className="text-primary hover:underline"
                href="/auth/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="mt-5 grid gap-5">
              <button
                type="submit"
                className="w-full btn btn-primary px-5"
                disabled={!isValid}
              >
                Continue
              </button>
              <p className="text-center">Or</p>
              <button
                type="button"
                className="w-full btn-google items-center"
                onClick={async () => {
                  const provider = new GoogleAuthProvider();
                  await doSignInWithPopup(provider);
                }}
              >
                <div className="w-full p-1 flex items-center justify-center gap-2">
                  <Image
                    src="/google.png"
                    className="h-5 w-5"
                    alt="Google signin logo"
                    height={100}
                    width={100}
                  />
                  <span>Sign In With Google</span>
                </div>
              </button>

              <p className="flex justify-center gap-1 text-sm">
                <span>Don`t have an account?</span>
                <Link
                  href="/auth/register"
                  className="text-primary hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
}
