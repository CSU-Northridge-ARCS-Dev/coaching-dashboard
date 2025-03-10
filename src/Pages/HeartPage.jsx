import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import HeartGraph from "../Components/HeartGraph";
import Header from "../Components/Header";

const HeartPage = () => {
  const [user] = useAuthState(getAuth());
  const navigate = useNavigate();

  // State for heart rate data
  const [heartRateData, setHeartRateData] = useState([]);

  // First and last names
  const displayName = user ? user.displayName : "";
  const [firstName, lastName] = displayName ? displayName.split(" ") : ["", ""];

  // Checks if user is signed in
  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchHeartRateData();
    }
  }, [user, navigate]);

  // Function to fetch heart rate data
  const fetchHeartRateData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/getHeartRate?userId=${user.uid}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched heart rate data:", data);
      
      // Check if the data contains heartRateData and it's an array
      if (data.success && Array.isArray(data.heartRateData)) {
        setHeartRateData(data.heartRateData); // Store the heart rate data in state
      } else {
        console.error("Invalid data format:", data);
      }
    } catch (error) {
      console.error("Error fetching heart rate data:", error);
    }
  };

  return (
    <div className="tw-flex tw-bg-black tw-min-h-screen">
      <Navbar />
      <div className="tw-flex-1 tw-ml-64 tw-p-4 tw-text-white">
        <Header pageTitle="Heart Graph" />
        
        {/* Pass heartRateData to HeartGraph */}
        <HeartGraph heartRateData={heartRateData} />
      </div>
    </div>
  );
};

export default HeartPage;
