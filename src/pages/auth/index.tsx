import React, { useEffect, useState } from "react";
import AuthLayout from "../../components/Authentication/AuthLayout";
import Seo from "../../components/Seo";
import firebaseApp, { fbDb } from "../../firebase/configs";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
} from "firebase/auth";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import admin from "@/firebase/admin";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const uid = user.uid;

        console.log("User ID Token:", token);

        try {
          const res = await fetch(`/api/user?uid=${uid}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("API Response:", res);

          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await res.json();
          setUserData(data);
          console.log("UserData signiin:", data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("This user has no userClaims");
      }
    });

    // const handleSignInWithEmailLink = async () => {
    //   const auth = getAuth(firebaseApp);

    //   if (isSignInWithEmailLink(auth, window.location.href)) {
    //     let email = window.localStorage.getItem("emailForSignIn");

    //     if (!email) {
    //       email = window.prompt("Please provide your email for confirmation");
    //     }

    //     if (email) {
    //       try {
    //         await signInWithEmailLink(auth, email, window.location.href);

    //         window.localStorage.removeItem("emailForSignIn");
    //         console.log("Successfully signed in");

    //         router.push("/Dashboard");
    //       } catch (error) {
    //         console.error("Sign-in with email link failed:", error);
    //         toast.error("Sign-in failed. Please try again.");
    //       }
    //     }
    //   }
    // };
    const handleSignInWithEmailLink = async () => {
      const auth = getAuth(firebaseApp);

      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");

        if (!email) {
          email = window.prompt("Please provide your email for confirmation");
        }

        if (email) {
          try {
            const result = await signInWithEmailLink(
              auth,
              email,
              window.location.href
            );
            const user = result.user;

            if (user) {
              const uid = user.uid;
              console.log("Successfully signed in with UID:", uid);

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

  // const doGoogleSignIn = async () => {
  //   const fbAuth = getAuth(firebaseApp);
  //   const provider = new GoogleAuthProvider();

  //   try {
  //     const results = await signInWithPopup(fbAuth, provider);
  //     console.log("doGoogleSignIn > results:", results);
  //     if (results.user) {
  //       router.push("/Dashboard");
  //     }
  //   } catch (error) {
  //     console.error("DO GOOGLE SIGN-IN ERROR:", error);
  //     toast.error("Google Sign-In failed. Please try again.");
  //   }
  // };
  const doGoogleSignIn = async () => {
    const fbAuth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();

    try {
      const results = await signInWithPopup(fbAuth, provider);
      console.log("doGoogleSignIn > results:", results);
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
    console.log("doLogin > formValues:", formValues);

    try {
      const { email, password } = formValues;
      const auth = getAuth();

      // Use Firebase Authentication to sign in
      const userCredential = await signInWithEmailAndPassword(
        auth,
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

  const auth = getAuth();

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
                <p className="font-inter font-bold text-base mt-4 ml-8">
                  Log in to your Account
                </p>
                {/* <p className="font-mulish text-[#8692A6] text-sm mt-2 ml-8">
                  Welcome back! Select method to log in
                </p> */}
                <div className="m-4 px-4  grid gap-5 shadow-sm">
                  <label className="block">
                    <label className="form-label font-mulish font-semibold text-[#333333]">
                      Email
                    </label>
                    <Field
                      required
                      type="email"
                      name="email"
                      value={values.email}
                      className="form-input"
                    />
                  </label>
                  <label className="block">
                    <label className="form-label font-mulish font-semibold">
                      Password
                    </label>
                    <Field
                      required
                      type="password"
                      name="password"
                      value={values.password}
                      className="form-input"
                    />
                  </label>
                </div>
                <div className=" px-4 w-full mt-4  flex flex-row">
                  <input className="ml-6" type="checkbox" />
                  <p className="ml-4 text-xs font-inter">Remember me</p>
                  <Link
                    className="ml-20 text-xs font-inter text-blue-700"
                    href="/ResetPassword"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="my-5 flex justify-center">
                  <button
                    type="submit"
                    className="btn font-inter font-medium rounded-md btn-primary w-72 px-5"
                  >
                    Submit
                  </button>
                </div>

                <p className="flex justify-center mt-5">Or</p>
                <div className="my-5 flex justify-center">
                  <button
                    type="button"
                    className="btn-google w-72 px-5 font-inter font-medium"
                    onClick={doGoogleSignIn}
                  >
                    <span className="flex items-center">
                      {/* <i className="fa-brands fa-google mr-2"></i> */}
                      <img
                        src="google.png"
                        className="w-4 mr-9 ml-7"
                        alt="Google Logo"
                      />
                      Sign In With Google
                    </span>
                  </button>
                </div>
                <p className="flex justify-center mt-7 underline text-xs font-mulish">
                  Dont have an account?
                  <Link className="text-blue-700" href="/signUp">
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
