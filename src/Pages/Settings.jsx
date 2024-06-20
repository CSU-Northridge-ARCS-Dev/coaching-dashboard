import React, { useState } from "react";
import { AllowedAccess } from "react-permission-role";

const Settings = () => {
  const [email, setEmail] = useState("");
  const [updatingRole, setUpdatingRole] = useState(false);
  const [message, setMessage] = useState("");

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    setUpdatingRole(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/updateRole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newRole: "coach" }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(`Role updated successfully: ${data.message}`);
      } else {
        throw new Error("Failed to update role.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setMessage(error.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  return (
    <AllowedAccess
      roles={["admin"]}
      renderAuthFailed={<p>You are not authorized to access this page.</p>}
    >
      <h2>this is where the role will be updated</h2>
    </AllowedAccess>
  );
};

export default Settings;
