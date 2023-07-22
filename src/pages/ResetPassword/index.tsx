import AuthLayout from "@/components/Authentication/AuthLayout";
import Seo from "@/components/Seo";
import firebaseApp from "@/firebase/configs"
import { getAuth } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast';

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

      <AuthLayout>
        <Formik
          initialValues={{
            email: ""
          }}
          onSubmit={(values) => doResetPassword(values)}
        >
          {({ errors, values }) => (
            <Form className="mt-10">
              <div className="m-4 px-4 grid gap-5 shadow-sm">
                <label className="block">
                  <label className="form-label">Email</label>
                  <Field
                    type="text"
                    name="email"
                    value={values.email}
                    className="form-input"
                  />
                </label>
              </div>
              <div className="my-5 flex justify-center">
                  <button type="submit" className="btn btn-primary px-5">
                    <i className="fas fa-sign-in-alt mr-2"></i> Reset
                  </button>
                </div>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    </main>
  );
}
