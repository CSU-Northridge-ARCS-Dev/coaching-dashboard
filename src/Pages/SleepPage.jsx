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

  const [sleepData, setSleepData] = useState({
    deepSleep: 0,
    coreSleep: 0,
    remSleep: 0,
    awake: 0,
  });

  // First and last names
  const displayName = user ? user.displayName : "";
  const [firstName, lastName] = displayName ? displayName.split(" ") : ["", ""];

  // Checks if user is signed in
  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchSleepData();
    }
  }, [user, navigate]);

  // Fetch sleep data from the server for a specific date
  const fetchSleepData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/getSleepData?userId=${user.uid}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sleep data");
      }
      const data = await response.json();

      if (data.success && Array.isArray(data.sleepData)) {
        const processedData = processSleepData(data.sleepData); // Process the raw sleep data
        setSleepData(processedData);
      } else {
        console.error("Invalid sleep data format:", data);
      }
    } catch (error) {
      console.error("Error fetching sleep data:", error);
    }
  };

  // Function to process raw sleep data and group by stages
  const processSleepData = (sleepData) => {
    let deepSleep = 0;
    let coreSleep = 0;
    let remSleep = 0;
    let awake = 0;

    sleepData.forEach((entry) => {
      const duration = (new Date(entry.endTime) - new Date(entry.startTime)) / 3600000; // Convert ms to hours
      switch (entry.stage) {
        case 1: // Awake
          awake += duration;
          break;
        case 2: // REM
          remSleep += duration;
          break;
        case 3: // Core
          coreSleep += duration;
          break;
        case 4: // Deep
          deepSleep += duration;
          break;
        default:
          break;
      }
    });

    return {
      deepSleep: deepSleep.toFixed(2),  // Fix to 2 decimal places
      coreSleep: coreSleep.toFixed(2),
      remSleep: remSleep.toFixed(2),
      awake: awake.toFixed(2),
    };
  };

  return (
    <div className="tw-flex tw-bg-black tw-min-h-screen">
      <Navbar />
      <div className="tw-flex-1 tw-ml-64 tw-p-4 tw-text-white">
        <Header pageTitle="Sleep Graph" />
        <SleepGraph sleepData={sleepData} /> {/* Pass sleepData to the graph */}
      </div>
    </div>
  );
};

export default SleepPage;
