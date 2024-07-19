import React, { useState } from "react";
import { Container, Typography, TextField, Button, Paper } from "@mui/material";
import { useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";

const Invitation = () => {
  const location = useLocation();
  const { state } = location;
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    console.log("Message sent:", message);
  };

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
            Send Message to {state?.user?.fullName || "Athlete"}
          </Typography>
          <Paper
            elevation={3}
            sx={{ p: 3, backgroundColor: "white", color: "black" }}
          >
            <TextField
              label="Message"
              multiline
              rows={6}
              variant="outlined"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              fullWidth
            >
              Send Message
            </Button>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default Invitation;
