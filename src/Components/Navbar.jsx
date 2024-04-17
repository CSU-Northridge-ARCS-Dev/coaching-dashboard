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
    <div className={`tw-bg-red-900 tw-flex tw-flex-wrap tw-items-center tw-p-4 tw-justify-center ${isOpen ? 'tw-w-16 tw-h-16' : 'tw-w-full tw-h-auto'} tw-relative tw-border-1-4 tw-border-black`}>
      <button
        className="tw-text-white tw-lg:hidden tw-p-8 tw-absolute tw-top"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={faBars} size="2x"/>
      </button>
      <div className={`tw-flex tw-flex-col tw-w-full tw-mt-4 tw-items-center ${isOpen ? 'tw-hidden' : 'tw-block'}`}>
        <Link
          to="/"
          className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
            location.pathname === "/" ? "tw-text-black" : "tw-text-white"
          }`}
        >
          <FontAwesomeIcon icon={faHome} className="tw-text-white tw-mr-6" />
          {!isOpen && "Home"}
        </Link>
        <Link
          to="/profile"
          className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
            location.pathname === "/profile" ? "tw-text-black" : "tw-text-white"
          } ${isOpen ? "tw-block" : "tw-hidden"}`}
        >
          <FontAwesomeIcon icon={faUser} className="tw-text-white tw-mr-6" />
          Profile
        </Link>
        <Link
          to="/search"
          className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
            location.pathname === "/search" ? "tw-text-black" : "tw-text-white"
          }`}
        >
          <FontAwesomeIcon icon={faSearch} className="tw-text-white tw-mr-6" />
          Search
        </Link>
        <Link
          to="/health"
          className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
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
          className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-12 ${
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