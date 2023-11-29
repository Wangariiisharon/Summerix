import React, { useState } from 'react';

interface SetPasswordFormProps {
  onSubmit: (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
}

const SetPasswordForm: React.FC<SetPasswordFormProps> = ({ onSubmit }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const handleValidation = () => {
    let isValid = true;
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    // Validation for newPassword
    if (!newPassword.trim()) {
      newErrors.newPassword = 'Password is required';
      isValid = false;
    }

    // Validation for confirmPassword
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm Password is required';
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords must match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (handleValidation()) {
      // If validation passes, call the onSubmit prop
      onSubmit({
        newPassword,
        confirmPassword,
        currentPassword,
      });
    } else {
      // If validation fails, handle errors or show a message
      console.error('Form validation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="newPassword">New Password:</label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {errors.newPassword && <div>{errors.newPassword}</div>}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errors.confirmPassword && <div>{errors.confirmPassword}</div>}
      </div>

      <div>
        <label htmlFor="currentPassword">Current Password:</label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)} // Set currentPassword state
        />
      </div>

      <button type="submit">Set Password</button>
    </form>
  );
};

export default SetPasswordForm;
