import 'firebase/firestore';
import AuthLayout from "@/components/Authentication/AuthLayout";
import Seo from "@/components/Seo";
import firebaseApp, { fbDb } from '@/firebase/configs';

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';
import Link from "next/link";

export default function CreateAccount() {
  const router = useRouter();

  const doCreateAccount = async (formValues: {
    organisation: string;
    location: string;
  }) => {
    console.log("doCreateAccount > formValues:", formValues);
    const fbAuth = getAuth(firebaseApp);
    if (!formValues.organisation || !formValues.location) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      const organizationsCollection = collection(fbDb, 'organizations');
      const docRef = await addDoc(organizationsCollection, formValues);

      console.log('Document written with ID: ', docRef.id);

      router.push(
        `/adminInformation?organisationId=${encodeURIComponent(docRef.id)}`
      );
    } catch (error) {
      console.error('DO LOGIN ERROR:::', error);
      toast.error('Please enter the correct auth details.');
    }
  };

  return (
    <main className="">
      <Seo title="Login" />

      <AuthLayout>
        <Formik
          initialValues={{
            organisation: "",
            location: "",
          }}
          onSubmit={(values) => doCreateAccount(values)}
        >
          {({ errors, values, handleChange }) => ( 
            
            <Form className=""> 
            <div className='flex flex-col'>
              <div className="m-4 px-4 grid gap-5 shadow-sm"> 
              <p className="font-inter font-bold text-base mt-4">Create Account</p>
                <h1 className="text-sm font-mulish text-[#8692A6]">Lets get you all set up</h1>
                <label className="block">
                  <label className="form-label font-mulish font-semibold">Organisation Name</label>
                  <Field
                    type="text"
                    name="organisation"
                    value={values.organisation}
                    onChange={handleChange}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label font-mulish font-semibold">Location</label>
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
                <button type="submit" className="btn font-inter font-medium rounded-md btn-primary w-72 px-5">
                  Next<i className="fa-solid fa-arrow-right ml-10"></i>
                </button>
              </div>
              <Link className="mt-15 ml-10 text-[#757575] underline text-xs " href="/signin">
                Already have an account?
              </Link> 
              </div>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    </main>
  );
}
