import AuthLayout from "@/components/Authentication/AuthLayout";
import Seo from "@/components/Seo";
import firebaseApp from "@/firebase/configs"
import { getAuth } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast';
import Image from "next/image";

export default function ResetPassword() {
    const router = useRouter();
  
    const doResetPassword = async (values: { email: any; }) => {  
      const { email } = values;
      const auth = getAuth();
  
      try {
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email sent successfully.'); 
        router.push('/Dashboard')
      } catch (error) {
        console.error('RESET PASSWORD ERROR:', error);
        toast.error('Error sending password reset email.');
      }
    };

  return (
    <main className="">
      <Seo title="Reset Password" />

      {/* <AuthLayout> */}
        <Formik
          initialValues={{
            email: ""
          }}
          onSubmit={(values) => doResetPassword(values)}
        >
          {({ errors, values }) => ( 
            <>
            <div className="absolute top-0 right-0">   
            <Image
              className="object-right-top"
              src="/leftbottom.png"
              alt="Truck Logo"
              width={80}
              height={25} />
          </div> 
          <header className="flex justify-center mt-20 ml-3 m-auto gap-2">
          <Image
            src="/logo.png"
            alt="company logo image"
            width={120}
            height={32}   
          />
        </header> 

        <h2 className="flex justify-center font-bold mt-8">Forgot Password</h2>
        <h3 className= "flex justify-center font-sans mt-2"> Please enter an email address.You will recieve <br></br>link to reset password</h3>
          <Form className="mt-10">
              <div className="flex justify-center px-4 grid gap-5">   
                <label className="block">     
                  <label className="form-label">Email Address</label>
                  <Field      
                    type="text"   
                    name="email"
                    value={values.email}
                    className="mx-auto p-2 rounded-md outline-none border border-gray-300 focus:border-blue-600 text-xs text-gray-900 focus:bg-white disabled:opacity-50 invalid:border-red-500 invalid:text-red-600
                    focus:invalid:border-red-500 focus:invalid:ring-red-500 w-72"/>
                </label> 
              </div>
              <div className="my-5 flex justify-center">
                <button type="submit" className="btn btn-primary px-5 w-72">
                  <i className="fas fa-sign-in-alt mr-2"></i> Reset Password
                </button>   
              </div>
              <div className="absolute bottom-0 left-0">
                <Image
                  className="object-left-bottom	"
                  src="/rightop.png"
                  alt="Truck Logo"
                  width={80}
                  height={25} />
              </div> 
            
            </Form>
            </> 
            
            
          )}
        </Formik> 

      {/* </AuthLayout> */}
    </main>
  );
}
