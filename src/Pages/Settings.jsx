import React, { useState } from "react";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";

const Settings = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleCheckEmail = async () => {
    const auth = getAuth();
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setMessage("Email found!");
      } else {
        setMessage("Email does not exist.");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setMessage("Failed to check email.");
    }
  };

  return (
    <div>
      <h1>Settings Page</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email to check"
      />
      <button onClick={handleCheckEmail}>Check Email</button>
      <p>{message}</p>
    </div>
  );
};

export default Settings;
