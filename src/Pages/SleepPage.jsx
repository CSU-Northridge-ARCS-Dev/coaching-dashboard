import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import SleepGraph from "../Components/SleepGraph";
import Header from "../Components/Header";

const SleepPage = () => {
  const [user] = useAuthState(getAuth());
  const navigate = useNavigate();

  // First and last names
  const displayName = user ? user.displayName : "";
  const [firstName, lastName] = displayName ? displayName.split(" ") : ["", ""];

  // Checks if user is signed in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="tw-flex tw-bg-black tw-min-h-screen">
      <Navbar />
      <div className="tw-flex-1 tw-ml-64 tw-p-4 tw-text-white">
        <Header pageTitle="Sleep Graph" />
        <SleepGraph />
      </div>
    </div>
  );
};

export default SleepPage;
