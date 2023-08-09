import 'firebase/firestore';
import AuthLayout from "@/components/Authentication/AuthLayout";
import Seo from "@/components/Seo";
import firebaseApp from "@/firebase/configs";
import { fbDb } from "@/firebase/configs";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import Link from "next/link";
import { useState } from "react";



export default function AdminInformation() {
    const router = useRouter();
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false); 

    const handleCheckboxChange = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
      setIsCheckboxChecked(event.target.checked);
    };



    const doAdmin = async (formValues: { firstname: any; lastname: any; email: any; phonenumber: any; password?: string; confirmpassword?: string; }) => {
      console.log("doAdmin > formValues:", formValues);
  
      const { firstname, lastname, email, phonenumber } = formValues;
      const organisationId = router.query.organisationId as string;   
  
      if (!organisationId) {
        console.error("Invalid organisationId");
        return;
      }
      if (!formValues.firstname || !formValues.lastname|| !formValues.email|| !formValues.phonenumber || !formValues.password || !formValues.confirmpassword) {
        toast.error('Please fill in all fields.');
        return;
      }
      try {
        const adminCollection = collection(fbDb, 'admins');
        const docRef = doc(adminCollection, organisationId);
  
        const data = {
          firstname,
          lastname,
          email,
          phonenumber,
        };
  
        await setDoc(docRef, data);
  
        router.push(`/Administration`);
      } catch (error) {
        console.error('ACCOUNT CREATION ERROR:::', error);
        toast.error('Please enter the correct auth details.');
      }
    };
  
  return (
    <main className="">
      <Seo title="Login" />

      <AuthLayout>
        <Formik
          initialValues={{
            firstname: "",
            lastname: "",
            email: "",
            phonenumber: "",
            password: "",
            confirmpassword: ""
          }}
          onSubmit={(values: { firstname: any; lastname: any; email: any; phonenumber: any; password?: string | undefined; confirmpassword?: string | undefined; }) => doAdmin(values)}
        >
          {({ errors, values }) => (
            <Form className="mt-10">
              <div className="m-4 px-4 grid gap-5 shadow-sm">
                <label className="block">
                  <label className="form-label">First Name</label>
                  <Field
                    type="text"
                    name="firstname"
                    value={values.firstname}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label">Last Name</label>
                  <Field
                    type="text"
                    name="lastname"
                    value={values.lastname}
                    className="form-input"
                  />
                </label>

                <label className="block">
                  <label className="form-label">Email</label>
                  <Field
                    type="text"
                    name="email"
                    value={values.email}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label">Phone Number</label>
                  <Field
                    type="text"
                    name="phonenumber"
                    value={values.phonenumber}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label">Password</label>
                  <Field
                    type="password"
                    name="password"
                    value={values.password}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label">Confirm Password</label>
                  <Field
                    type="password"
                    name="confirmpassword"
                    value={values.confirmpassword}
                    className="form-input"
                  />
                </label>
              </div>
              <div className=" px-4 flex flex-row"> 
                <input className="ml-3" type="checkbox"checked={isCheckboxChecked} // Bind checkbox value to state
                  onChange={handleCheckboxChange}  />
                <p className="ml-4 text-xs">I agree to terms & conditions</p> 
                </div>
              <div className="my-5 flex justify-center">
                <button type="submit" className="btn btn-primary w-72 px-5" disabled={!isCheckboxChecked} >
                  <i className="fas fa-sign-in-alt mr-2"></i> Create Account
                </button>
              </div>

            </Form>
          )}
        </Formik>
      </AuthLayout>
    </main>
  );
}

