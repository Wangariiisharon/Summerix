import React, { useEffect } from "react";
import AuthLayout from "../../components/Authentication/AuthLayout";
import Seo from "../../components/Seo";
import { fbAuth, fbDb } from "../../firebase/configs";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Image from "next/image";

export default function LoginPage() {
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

        router.push("/Dashboard");
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

        router.push("/Dashboard");
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
      <Seo title="Login" />
      <AuthLayout>
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          onSubmit={(values) => doLogin(values)}
        >
          {({ errors, values, handleSubmit }) => (
            <Form className="mt-6" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <p className="font-bold text-base mt-4 ml-8">
                  Log in to your account
                </p>
                <div className="m-4 p-4  grid gap-5 shadow">
                  <label className="block">
                    <label className="form-label font-semibold">
                      Email address
                    </label>
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
                    <label className="form-label font-semibold">Password</label>
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
                    className="text-blue-700 hover:underline"
                    href="/ResetPassword"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="my-5 flex justify-center">
                  <button
                    type="submit"
                    className="w-full btn font-medium rounded-md btn-primary px-5"
                  >
                    Submit
                  </button>
                </div>

                <p className="mt-5 text-center">Or</p>

                <div className="my-5 font-medium">
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
                </div>
                <p className="mt-5 flex justify-center gap-1">
                  <span>Dont have an account?</span>
                  <Link
                    className="text-blue-700 hover:underline"
                    href="/signUp"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    </main>
  );
}
