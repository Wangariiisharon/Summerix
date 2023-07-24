import AuthLayout from "@/components/Authentication/AuthLayout";
import Seo from "@/components/Seo";
import firebaseApp from "@/firebase/configs";
import { fbDb } from "@/firebase/configs";
import { getAuth } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';

export default function CreateAccount() {
  const router = useRouter();

  const doCreateAccount = async (formValues: { organisation: string; location: string; }) => {
    console.log("doCreateAccount > formValues:", formValues);
    
    const fbAuth = getAuth(firebaseApp); 

    try {
      const organizationsCollection = collection(fbDb, 'organizations');
      const docRef = await addDoc(organizationsCollection, formValues);
  
      console.log('Document written with ID: ', docRef.id);
  
      router.push(`/adminInformation?organisationId=${encodeURIComponent(docRef.id)}`);
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
                <button type="submit" className="btn btn-primary px-5">
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
