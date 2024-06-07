// src/components/InactivityModal.js
// src/components/InactivityModal.js
// src/components/InactivityModal.js
// src/components/InactivityModal.js
import React from "react";
import { useRouter } from "next/router";

const InactivityModal = ({ isOpen, onClose }: any) => {
  const router = useRouter(); // Hook for navigation

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose(); // Close the modal
    router.push("/auth"); // Redirect to login page
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
          width: "300px",
          textAlign: "center",
        }}
      >
        <p>You have been logged out due to inactivity.</p>
        <button
          onClick={handleLogin}
          style={{ color: "blue", marginTop: "20px" }}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default InactivityModal;
