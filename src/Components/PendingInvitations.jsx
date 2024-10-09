// Coaching-Dashboard/src/Components/PendingInvitations.js
import React from "react";

const PendingInvitations = ({ pendingInvitations }) => {
  return (
    <div>
      <h3>Pending Invitations</h3>
      <ul>
        {pendingInvitations.map((invitation, index) => (
          <li key={index}>
            Athlete Email: {invitation.athleteEmail}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingInvitations;
