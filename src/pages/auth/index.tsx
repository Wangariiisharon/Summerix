import AuthLayout from "@/components/Authentication/AuthLayout";
import Seo from "@/components/Seo";
import firebaseApp from "@/firebase/configs"
import { getAuth } from "firebase/auth";

// import { fbAuth } from "@/firebase/configs";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();

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
      if (results.user) router.push('/');
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
              <div className="my-5 flex justify-center">
                  <button type="submit" className="btn btn-primary px-5">
                    <i className="fas fa-sign-in-alt mr-2"></i> Login
                  </button>
                </div>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    </main>
  );
}
