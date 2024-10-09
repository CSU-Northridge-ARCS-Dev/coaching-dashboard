import React, { useState, useEffect } from "react";
import { Container, Typography, Paper } from "@mui/material";
import Navbar from "../Components/Navbar";
import InviteForm from "../Components/InviteForm";
import PendingInvitations from "../Components/PendingInvitations";
import { fetchPendingInvitations } from "../Utils/fetchPendingInvitations"; // Ensure utility is created
import { auth } from "../../firebaseConfig"; // Firebase auth config

const Invitation = () => {
  const [pendingInvitations, setPendingInvitations] = useState([]);

  // Fetch pending invitations for the coach
  const loadPendingInvitations = async () => {
    try {
      const coachId = auth.currentUser.uid; // Get current coach ID
      const data = await fetchPendingInvitations(coachId);
      setPendingInvitations(data);
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
    }
  };

  useEffect(() => {
    loadPendingInvitations();
  }, []);

  return (
    <div className="tw-flex tw-flex-col tw-min-h-screen tw-bg-black">
      <Navbar />
      <div className="tw-flex-1 tw-ml-64 tw-p-4 tw-text-white">
        <Container>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            style={{ color: "white" }}
          >
            Invite Athlete
          </Typography>

          <Paper elevation={3} sx={{ p: 3, backgroundColor: "white", color: "black" }}>
            {/* Invite Form */}
            <InviteForm onInviteSent={loadPendingInvitations} />
          </Paper>

          {/* Pending Invitations */}
          <PendingInvitations pendingInvitations={pendingInvitations} />
        </Container>
      </div>
    </div>
  );
};

export default Invitation;
