import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth, signOut } from "firebase/auth";
import {
  faHome,
  faUser,
  faBars,
  faSearch,
  faHeartbeat,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  return (
    <h1>This is logout</h1>
 
  );
};

export default Navbar;