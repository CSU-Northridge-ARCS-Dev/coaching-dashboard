import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../Components/Navbar";

const Home = () => {
  const [user] = useAuthState(getAuth());
  const navigate = useNavigate();

  // first and last names extraction
  const displayName = user ? user.displayName : "";
  const [firstName, lastName] = displayName ? displayName.split(" ") : ["", ""];

  // checks for user is signed in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div>
      <h1>This is the landing page</h1>
    </div>
  );
};

export default Home;
