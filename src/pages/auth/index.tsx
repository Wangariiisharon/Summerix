import React, { useEffect, useState } from "react";
import AuthLayout from "../../components/Authentication/AuthLayout";
import Seo from "../../components/Seo";
// import firebaseApp from "../../firebase/configs"
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast';
import firebaseApp, { fbDb}  from "@/firebase/configs";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"; 
import bcrypt from 'bcryptjs';    
import { getMessaging, getToken, onMessage } from 'firebase/messaging';



export default function LoginPage() {
  const router = useRouter();  
  const [fcmToken, setFcmToken] = useState<string | null>(null);


  // useEffect(() => {
  //   const handleSignInWithEmailLink = async () => {
  //     const auth = getAuth(firebaseApp);
  
  //     // Check if the URL is a valid sign-in link
  //     if (isSignInWithEmailLink(auth, window.location.href)) {
  //       let email = window.localStorage.getItem('emailForSignIn');
  
  //       // Handle the case where email is null
  //       if (!email) {
  //         // Prompt the user to enter their email if it's not stored in local storage
  //         email = window.prompt('Please provide your email for confirmation');
  //       }
  
  //       // Check again if email is still null before proceeding
  //       if (email) {
  //         // Complete the sign-in process
  //         try {
  //           await signInWithEmailLink(auth, email, window.location.href);
  
  //           // Clear the email from storage (optional)
  //           window.localStorage.removeItem('emailForSignIn');
  //           console.log('Successfully signed in');
  
  //           // Redirect or perform other necessary actions after successful sign-in
  //           router.push('/Dashboard');
  //         } catch (error) {
  //           // Handle the sign-in error
  //           console.error('Sign-in with email link failed:', error);
  //           toast.error('Sign-in failed. Please try again.');
  //         }
  //       }
  //     }
  //   }; 


  
  //   // Call the function to handle sign-in with email link
  //   handleSignInWithEmailLink();
  // }, []);
  
  
  const doGoogleSignIn = async () => {

    const fbAuth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
  
    try {
      const results = await signInWithPopup(fbAuth, provider);
      console.log(results); 
      if (results.user){
        router.push('/Dashboard');
      } 

    } catch (error) {    
      console.error('DO GOOGLE SIGN-IN ERROR:', error);
      toast.error('Google Sign-In failed. Please try again.'); 

    }
  }; 

  const doLogin = async (formValues: { email: string; password: string; }) => {
    try {
      const { email, password } = formValues;
      console.log("FormValues", formValues);
  
      const auth = getAuth();
  
      // Use Firebase Authentication to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (user) {
        router.push('/Dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
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
          {({ errors, values,handleSubmit }) => ( 
            <Form className="mt-6" onSubmit={handleSubmit}> 
            <div className="flex flex-col"> 
            <p className="font-inter font-bold text-base mt-4 ml-8">Log in to your Account</p>
            <p className="font-mulish text-[#8692A6] text-sm mt-2 ml-8">Welcome back! Select method to log in</p>
              <div className="m-4 px-4  grid gap-5 shadow-sm">
                <label className="block">
                  <label className="form-label font-mulish font-semibold text-[#333333]">Email</label>
                  <Field 
                    required
                    type="email"
                    name="email" 
                    value={values.email}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label font-mulish font-semibold">Password</label>
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
                <p className="ml-4 text-xs font-inter">Remenber me?</p> 
                <Link className="ml-20 text-xs font-inter text-blue-700" href="/ResetPassword">Forgot Password?</Link>
                </div> 
              <div className="my-5 flex justify-center">
                  <button type="submit" className="btn font-inter font-medium rounded-md btn-primary w-72 px-5">
                    Submit
                  </button> 
                </div>

                <p className="flex justify-center mt-5">Or</p>
                <div className="my-5 flex justify-center">
                   <button type="button" className="btn-google w-72 px-5 font-inter font-medium" onClick={doGoogleSignIn}>
                   <span className="flex items-center">
                   {/* <i className="fa-brands fa-google mr-2"></i> */}
                  <img src="google.png" className="w-4 mr-9 ml-7" alt="Google Logo" />
                  Sign In With Google
                   </span>
                 </button>
                </div>
                <p  className="flex justify-center mt-7 underline text-xs font-mulish">Dont have an account?<Link className="text-blue-700" href="/signUp">Register</Link></p>
                </div>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    </main>
  );
}