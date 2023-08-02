<<<<<<< HEAD
import AuthLayout from "@/components/Authentication/AuthLayout";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import Seo from "@/components/Seo";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const {isAuthenticated , currentUser } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, []);

  return (
    <main className="">
      <Seo title="Home" />

      <p>Current User</p>
      <pre>{JSON.stringify(currentUser, null, 2)}</pre>
    </main>
  );
=======
import SiteLayout from "@/Layout/SiteLayout";

export default function Home() {
    return (
        <>

        </>
    )
>>>>>>> origin/develop
}
