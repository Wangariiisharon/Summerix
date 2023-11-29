import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import firebaseApp, { fbDb } from '@/firebase/configs';

const PasswordSetPage = ({ adminId }: { adminId: string }) => {
  const [newPassword, setNewPassword] = useState('');
  const [user, setUser] = useState(getAuth(firebaseApp).currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(firebaseApp), (user) => {
      setUser(user);
      console.log('User:', user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePasswordSet = async () => {
    try {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;
  
      if (user) {
        const userEmail = user.email;
  
        if (userEmail) {
          // Fetch the correct current password dynamically
          const currentPassword = ''; // Replace '...' with the dynamic fetch logic
  
          // Reauthenticate the user before setting the password
          const credential = EmailAuthProvider.credential(userEmail, currentPassword);
          await reauthenticateWithCredential(user, credential);
  
          // Set the user's password using Firebase Authentication API
          await updatePassword(user, newPassword);
  
          // Update the Firestore document to indicate that the password has been set
          const adminDocRef = doc(fbDb, 'admins', adminId);
          await updateDoc(adminDocRef, {
            passwordSet: true,
          });
  
          console.log('Password set successfully');
        } else {
          console.error('User email is null');
          // Handle the case where user email is null, e.g., display an error message
        }
      } else {
        console.error('Current user is null');
        // Handle the case where the current user is null, e.g., redirect to an error page
      }
    } catch (error) {
      console.error('Error setting password:', error);
      // Handle the error, e.g., display an error message to the user
    }
  };
  

  return (
    <div>
      <h1>Set Your Password</h1>
      <input
        type="password"
        placeholder="Enter your new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handlePasswordSet}>Set Password</button>
    </div>
  );
};

export default PasswordSetPage;
