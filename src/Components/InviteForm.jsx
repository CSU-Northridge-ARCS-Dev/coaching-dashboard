// Coaching-Dashboard/src/Components/InviteForm.js
import React, { useState } from "react";
import { sendInvitation } from "../Utils/sendInvitation"; // Update the path if necessary

const InviteForm = ({ onInviteSent }) => {
  const [athleteEmail, setAthleteEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleInvite = async () => {
    if (!athleteEmail) {
      setStatus("Please enter a valid email address.");
      return;
    }

    try {
      await sendInvitation(athleteEmail);
      setStatus("Invitation sent successfully.");
      setAthleteEmail(""); // Clear the input field
      onInviteSent(); // Update the pending invitations list
    } catch (error) {
      console.error("Error sending invitation:", error);
      setStatus("Error sending invitation.");
    }
  };

  return (
    <div>
      <h3>Send Invite to Athlete</h3>
      <input
        type="email"
        placeholder="Athlete Email"
        value={athleteEmail}
        onChange={(e) => setAthleteEmail(e.target.value)}
      />
      <button onClick={handleInvite}>Send Invite</button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default InviteForm;
