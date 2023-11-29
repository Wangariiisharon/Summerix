import firebaseApp from '@/firebase/configs';
import { getAuth, checkActionCode, updatePassword, applyActionCode, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import React, { useEffect } from 'react'
import { Field, Form, Formik } from "formik";
import SetPasswordForm from './setPasswordForm';


export default function email() { 
  async function handleSetPassword(values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    console.log('Form values:', values);
  
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const adminId = urlParams.get('adminId');
  
      if (!adminId) {
        console.error('Admin ID is missing in the URL');
        // Handle the error or redirect to an error page
        return;
      }
  
      // Ensure that the email action code is present in the URL
      const oobCode = urlParams.get('oobCode');
      if (!oobCode) {
        console.error('Password reset code is missing in the URL');
        // Handle the error or redirect to an error page
        return;
      }
  
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;
  
      if (!user) {
        console.error('Current user is null');
        // Handle the error or redirect to an error page
        return;
      }
  
      console.log('User email:', user.email);
      
      // Verify the password reset code
      await checkActionCode(auth, oobCode);
  
      // Reauthenticate the user
      const currentPassword = values.currentPassword;
  
      console.log('Current Password:', currentPassword);
  
      // Check for null values before creating the credential
      if (user.email && currentPassword) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
  
        // Set the new password after reauthentication
        const newPassword = values.newPassword;
        await updatePassword(user, newPassword);
  
        // Clear the password reset code after successful password reset
        await applyActionCode(auth, oobCode);
  
        console.log('Password set successfully');
  
        // Redirect to a success page or home page
        // window.location.href = '/success';
      } else {
        console.error('Email or password is null');
        // Handle the error or redirect to an error page
      }
    } catch (error) {
      console.error('Error setting password:', error);
  
      // Handle specific password-related errors
      if (error === 'auth/requires-recent-login') {
        console.error('User authentication is not recent enough');
        // Handle the error or provide feedback to the user
      } else {
        // Handle other errors or redirect to an error page
      }
    }
  }
  

  return (
    <div>
      <h1>Set Password</h1>
      <SetPasswordForm onSubmit={handleSetPassword} />
    </div>
  )
}