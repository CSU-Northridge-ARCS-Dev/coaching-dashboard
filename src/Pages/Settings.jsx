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
      <div className="tw-flex tw-justify-center tw-items-center tw-h-screen tw-bg-black">
        <div className="tw-w-full tw-max-w-md tw-p-8 tw-bg-white tw-rounded-lg tw-shadow-md tw-bg-opacity-90">
          <h1 className="tw-text-xl tw-font-bold tw-text-center tw-mb-8">
            Settings Page
          </h1>
          <h2 className="tw-text-lg tw-text-center tw-mb-4">
            Update User Role to Coach
          </h2>
          <form onSubmit={handleRoleUpdate} className="tw-space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              className="tw-w-full tw-py-2 tw-px-4 tw-rounded-md tw-border tw-border-gray-300 focus:tw-border-blue-500 focus:tw-ring tw-focus:ring-blue-500 tw-outline-none"
              required
            />
            <button
              type="submit"
              disabled={updatingRole}
              className="tw-w-full tw-py-3 tw-px-4 tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-medium tw-rounded-md tw-transition-colors"
            >
              {updatingRole ? "Updating..." : "Update to Coach"}
            </button>
          </form>
          {message && (
            <p className="tw-text-center tw-mt-4 tw-text-green-500">
              {message}
            </p>
          )}
        </div>
      </div>
    </AllowedAccess>
  );
};

export default Settings;
