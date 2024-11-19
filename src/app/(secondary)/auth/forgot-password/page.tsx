'use client';

import { fbAuth } from '@/firebase/configs';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SignUp() {
  const [processing, setProcessing] = useState(false);

  const doResetPassword = async (values: { email: string }) => {
    const { email } = values;

    try {
      setProcessing(true);
      await sendPasswordResetEmail(fbAuth, email);
      toast.success('Password reset email sent successfully.');
    } catch (error) {
      console.error('RESET PASSWORD ERROR:', error);
      toast.error('Error sending password reset email.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="">
      <Formik
        enableReinitialize={true}
        initialValues={{
          email: '',
        }}
        onSubmit={(values: { email: string }) => doResetPassword(values)}
      >
        {({ isValid }) => (
          <Form className="mt-6">
            <h2 className="text-center font-bold">Forgot Password</h2>

            <div className="mt-5 grid gap-5 p-4 shadow-sm">
              <label className="block">
                <label className="form-label">Email Address</label>
                <Field type="email" name="email" className="form-input" />
                <ErrorMessage name="email" component="span" className="form-error" />
                <p className="mt-1 text-xs italic text-gray-500">
                  Please enter an email address. You will recieve a link to reset password
                </p>
              </label>
            </div>

            <div className="my-5 grid w-full justify-items-center gap-5">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={!isValid || processing}
              >
                <i className="fas fa-sign-in-alt mr-2"></i> Reset Password
              </button>
              <Link href="/auth/sign-in" className="text-xs text-primary hover:underline">
                Go back to login?
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
}
