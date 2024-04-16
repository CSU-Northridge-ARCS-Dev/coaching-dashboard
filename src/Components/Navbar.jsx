import React, {useState} from "react";  {/* import useState is neccessary */}
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser, 
  faBars,
  faSearch,
  faHeartbeat,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="tw-bg-red-900 tw-flex tw-flex-wrap tw-py-4 tw-justify-center">
      <div className="tw-flex tw-flex-col tw-w-full tw-items-center">
      <button
        className="tw-text-white tw-size-16 tw-lg:hidden tw-mb-12"
        onClick={() => setIsOpen(!isOpen)}
      >
      <FontAwesomeIcon icon={faBars} size="5x" />
      </button>
        <Link
          to="/"
          className={`tw-py-2 tw-text-3xl tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
            location.pathname === "/" ? "tw-text-black" : "tw-text-white"
          }`}
        >
          <FontAwesomeIcon icon={faHome} className="tw-text-white tw-mr-6" />
          Home
        </Link>
        <Link
          to="/profile"
          className={`tw-py-2 tw-text-3xl tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
            location.pathname === "/profile" ? "tw-text-black" : "tw-text-white"
          }`}
        >
          <FontAwesomeIcon icon={faUser} className="tw-text-white tw-mr-6" />
          Profile
        </Link>
        <Link
          to="/search"
          className={`tw-py-2 tw-text-3xl tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
            location.pathname === "/search" ? "tw-text-black" : "tw-text-white"
          }`}
        >
          <FontAwesomeIcon icon={faSearch} className="tw-text-white tw-mr-6" />
          Search
        </Link>
        <Link
          to="/health"
          className={`tw-py-2 tw-text-3xl tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
            location.pathname === "/health" ? "tw-text-black" : "tw-text-white"
          }`}
        >
          <FontAwesomeIcon
            icon={faHeartbeat}
            className="tw-text-white tw-mr-6"
          />
          Health
        </Link>
        <Link
          to="/logout"
          className={`tw-py-2 tw-text-3xl tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
            location.pathname === "/logout" ? "tw-text-black" : "tw-text-white"
          }`}
        >
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className="tw-text-white tw-mr-2"
          />
          Logout
        </Link>
      </div>
    </div>
  );
};

export default Navbar;