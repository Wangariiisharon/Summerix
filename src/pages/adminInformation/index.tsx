import 'firebase/firestore';
import AuthLayout from "@/components/Authentication/AuthLayout";
import Seo from "@/components/Seo";
import firebaseApp from "@/firebase/configs";
import { fbDb } from "@/firebase/configs";
import { Formik, Field, Form } from 'formik/dist/index';
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import Link from "next/link";
import { useState } from "react"; 
import bcrypt from 'bcryptjs';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';




export default function AdminInformation() {
    const router = useRouter();
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false); 
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }
    const eyeIcon = showPassword ? (
      <span className="fa fa-eye fa-xs" aria-hidden="true"></span>
  ) : (
      <span className="fa fa-eye-slash fa-xs" aria-hidden="true"></span>
  );
  


    const handleCheckboxChange = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
      setIsCheckboxChecked(event.target.checked);
    };



    const doAdmin = async (formValues: { firstname: string; lastname: string; email: string; phonenumber: string; password?: string; confirmpassword?: string; }) => {
      console.log("doAdmin > formValues:", formValues);
    
      const { firstname, lastname, email, phonenumber, password, confirmpassword } = formValues;
      const organisationId = router.query.organisationId as string;
    
      if (!organisationId) {
        console.error("Invalid organisationId");
        return;
      }
      if (!firstname || !lastname || !email || !phonenumber || !password || !confirmpassword) {
        toast.error('Please fill in all fields.');
        return;
      }
    
      if (password !== confirmpassword) {
        toast.error('Passwords do not match.');
        return;
      }
    
      try {
        // Create user in Firebase Authentication
        const auth = getAuth(firebaseApp);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
    
        // Now, you have the user object, and you can get the UID
        const userId = user.uid;
    
        // Add user data to Firestore
        const adminCollection = collection(fbDb, 'admins');
        const docRef = doc(adminCollection, organisationId);
    
        const data = {
          userId, // You can store the UID in your Firestore document
          firstname,
          lastname,
          email,
          phonenumber,
          status: true,
          superadmin: true,
        };
    
        await setDoc(docRef, data);
    
        router.push(`/Administration`);
      } catch (error) {
        console.error('ACCOUNT CREATION ERROR:', error);
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
          onSubmit={(values) => doAdmin(values)}
        >
          {({ errors, values }) => ( 

            <Form className=""> 
            <p className="font-inter font-bold text-base mt-4 ml-8">Admin Information</p>

              <div className="m-4 px-4 grid gap-5 shadow-sm">
                <label className="block">
                  <label className="form-label font-mulish font-semibold">First Name</label>
                  <Field
                    type="text"
                    name="firstname"
                    value={values.firstname}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label font-mulish font-semibold">Last Name</label>
                  <Field
                    type="text"
                    name="lastname"
                    value={values.lastname}
                    className="form-input"
                  />
                </label>

                <label className="block">
                  <label className="form-label font-mulish font-semibold">Email</label>
                  <Field
                    type="email"
                    name="email"
                    value={values.email}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label font-mulish font-semibold">Phone Number</label>
                  <Field
                    type="text"
                    name="phonenumber"
                    value={values.phonenumber}
                    className="form-input"
                  />
                </label>
                <label className="block">
                 <label className="form-label font-mulish font-semibold">Password</label>
                    <Field
                 type={showPassword ? 'text' : 'password'}
                 name="password"
                 value={values.password}
                 className="form-input"
                  />
               </label>

                <div className="flex items-center">
                 <label className="form-label font-mulish text-xs font-semibold">Show Password</label>
                  <span className="password-toggle ml-2" onClick={togglePasswordVisibility}>
                  {eyeIcon}
                    </span>
                  </div>
                <label className="block">
                  <label className="form-label font-mulish font-semibold">Confirm Password</label>
                  <Field
                    type="password"
                    name="confirmpassword"
                    value={values.confirmpassword}
                    className="form-input"
                  />
                </label>
              </div>
              <div className=" px-4 flex flex-row"> 
                <input className="ml-5" type="checkbox"checked={isCheckboxChecked} // Bind checkbox value to state
                  onChange={handleCheckboxChange}  />
                <p className="ml-4 text-xs">I agree to terms & conditions</p> 
                </div>
              <div className="my-5 flex justify-center">
                <button type="submit" className="btn btn-primary w-72 mr-7 px-5" disabled={!isCheckboxChecked} >
                    Submit
                </button>
              </div>

            </Form>
          )}
        </Formik>
      </AuthLayout>
    </main>
  );
}

