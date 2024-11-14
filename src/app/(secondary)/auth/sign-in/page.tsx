"use client";

import { fbAuth, fbDb } from "@/firebase/configs";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Field, Form, Formik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function SignIn() {
  const router = useRouter();

  useEffect(() => {
    const handleSignInWithEmailLink = async () => {
      if (isSignInWithEmailLink(fbAuth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          email = window.prompt("Please provide your email for confirmation");
        }

        if (email) {
          try {
            const result = await signInWithEmailLink(
              fbAuth,
              email,
              window.location.href
            );
            const user = result.user;

            if (user) {
              const uid = user.uid;
              console.debug("Successfully signed in with UID:", uid);

              // Update the admin document with the user's UID
              const adminId = new URLSearchParams(window.location.search).get(
                "adminId"
              );
              if (adminId) {
                const adminDocRef = doc(fbDb, "admins", adminId);
                await updateDoc(adminDocRef, { userId: uid });
                console.log("Admin document updated with userId:", uid);
              }

              window.localStorage.removeItem("emailForSignIn");
              router.push("/Dashboard");
            }
          } catch (error) {
            console.error("Sign-in with email link failed:", error);
            toast.error("Sign-in failed. Please try again.");
          }
        }
      }
    };

    handleSignInWithEmailLink();
  }, [router]);

  const doGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const results = await signInWithPopup(fbAuth, provider);
      console.debug("doGoogleSignIn > results:", results);

      if (results.user) {
        const user = results.user;
        const uid = user.uid;
        const email = user.email;

        if (email) {
          // Find the corresponding admin document using the user's email
          const adminQuery = query(
            collection(fbDb, "admins"),
            where("email", "==", email)
          );
          const adminSnapshot = await getDocs(adminQuery);
          if (!adminSnapshot.empty) {
            const adminDoc = adminSnapshot.docs[0];
            const adminDocRef = adminDoc.ref;

            // Update the userId field in the admin document
            await updateDoc(adminDocRef, { userId: uid });
            console.log("Admin document updated with userId:", uid);
          } else {
            console.error("Admin document not found for the given email.");
          }
        }

        router.push("/home");
      }
    } catch (error) {
      console.error("DO GOOGLE SIGN-IN ERROR:", error);
      toast.error("Google Sign-In failed. Please try again.");
    }
  };

  const doLogin = async (formValues: { email: string; password: string }) => {
    console.debug("doLogin > formValues:", formValues);

    try {
      const { email, password } = formValues;

      // Use Firebase Authentication to sign in
      const userCredential = await signInWithEmailAndPassword(
        fbAuth,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        const uid = user.uid;

        // Find the corresponding admin document using the user's email
        const adminQuery = query(
          collection(fbDb, "admins"),
          where("email", "==", email)
        );
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          const adminDoc = adminSnapshot.docs[0];
          const adminDocRef = adminDoc.ref;

          // Update the userId field in the admin document
          await updateDoc(adminDocRef, { userId: uid });
          console.log("Admin document updated with userId:", uid);
        } else {
          console.error("Admin document not found for the given email.");
        }

        router.push("/home");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <main className="">
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        onSubmit={(values) => doLogin(values)}
      >
        {({ values, handleSubmit }) => (
          <Form className="mt-6" onSubmit={handleSubmit}>
            <h2 className="font-bold text-center">Log in to your account</h2>

            <div className="my-5 p-4 grid gap-5 shadow-sm">
              <label className="block">
                <label className="form-label">Email address</label>
                <Field
                  type="email"
                  name="email"
                  value={values.email}
                  className="form-input"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="block">
                <label className="form-label">Password</label>
                <Field
                  type="password"
                  name="password"
                  value={values.password}
                  className="form-input"
                  autoComplete="current-password"
                  required
                />
              </label>
            </div>

            <div className="w-full px-4 flex justify-between text-xs">
              <div className="flex items-center gap-2 opacity-70">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="form-checkbox"
                />
                <label htmlFor="remember-me" className="">
                  Remember me
                </label>
              </div>
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
                className="w-full btn font-medium rounded-md btn-primary px-5"
              >
                Submit
              </button>
              <p className="text-center">Or</p>
              <button
                type="button"
                className="w-full btn-google items-center"
                onClick={doGoogleSignIn}
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
                <span>Dont have an account?</span>
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
