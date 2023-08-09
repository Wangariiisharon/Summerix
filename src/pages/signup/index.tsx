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
            <Form className="mt-10">
              <div className="m-4 px-4 grid gap-5 shadow-sm">
                <h1 className="text-base">Lets get you all set up</h1>
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
              <div className="my-5 flex justify-center">
                <button type="submit" className="btn w-72 btn-primary px-5">
                  Next<i className="fa-solid fa-arrow-right p-2"></i>
                </button>
              </div>
              <Link className="mt-15 ml-10 text-xs text-blue-600" href="/signin">
                Already have an account?
              </Link>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    </main>
  );
}
