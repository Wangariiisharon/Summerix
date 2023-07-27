import AuthLayout from "@/components/Authentication/AuthLayout";
import Seo from "@/components/Seo";
import firebaseApp from "@/firebase/configs"
import { getAuth } from "firebase/auth";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();

  const doGoogleSignIn = async () => {
    const fbAuth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
  
    try {
      const results = await signInWithPopup(fbAuth, provider);
      if (results.user){
        router.push('/Dashboard');
      } 
      // if (results.user) {
      //   if (window.opener) {
      //     window.close();
      //   } else {
      //     router.push('/Dashboard');
      //   }
      // }
    } catch (error) {    
      console.error('DO GOOGLE SIGN-IN ERROR:', error);
      toast.error('Google Sign-In failed. Please try again.');
    }
  }; 

  const doLogin = async (formValues: any) => {  
    console.log("doLogin > formValues:", formValues);
    const fbAuth = getAuth(firebaseApp);

    try {
      const results = await signInWithEmailAndPassword(
        fbAuth,
        formValues.email,
        formValues.password
      );
      // console.log("doLogin > results:", results);
      if (results.user){
        console.log("User logged in successfully:", results.user.email);
        router.push('/Dashboard')
        
      }
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
            email: "",
            password: "",
          }}
          onSubmit={(values) => doLogin(values)}
        >
          {({ errors, values }) => (
            <Form className="mt-10">
              <div className="m-4 px-4  grid gap-5 shadow-sm">
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
                  <label className="form-label">Password</label>
                  <Field
                    type="password"
                    name="password"
                    value={values.password}
                    className="form-input"
                  />
                </label>
              </div>
              <div className=" px-4  mt-4 flex flex-row"> 
                <input className="ml-3" type="checkbox" />
                <p className="ml-4 text-xs">Remenber me?</p> 
                <Link className="ml-20 text-xs text-blue-700" href="/ResetPassword">Forgot Password?</Link>
                </div>  
              <div className="my-5 flex justify-center">
                  <button type="submit" className="btn rounded-md btn-primary w-72 px-5">
                    <i className="fas fa-sign-in-alt mr-2"></i> Login
                  </button> 
                </div>

                <p className="flex justify-center mt-5">Or</p>
                <div className="my-5 flex justify-center">
                  <button type="submit" className="btn-google w-72 px-5" onClick={doGoogleSignIn}>
                  <i className="fa-brands fa-google mr-2"></i>
                  Sign In With Google
                  </button>    
                </div>
                <p  className="flex justify-center mt-7 text-xs">Dont have an account?<Link className="text-blue-700" href="/signUp">Register</Link></p>
              
            </Form>
          )}
        </Formik>
      </AuthLayout>
    </main>
  );
}