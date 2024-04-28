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
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        window.location.href = "/";
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="tw-bg-red-900 tw-flex tw-flex-wrap tw-items-center tw-py-4 tw-px-4 tw-justify-center">
      {isMobile ? (
        <div className="tw-flex tw-justify-start tw-w-full">
          <FontAwesomeIcon
            icon={faBars}
            className="tw-text-white tw-text-4xl cursor-pointer"
            onClick={handleMenuToggle}
          />
        </div>
      ) : (
        <div className="tw-flex tw-flex-col tw-w-full tw-mt-4 tw-items-center">
          <Link
            to="/home"
            className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-8 ${
              location.pathname === "/home" ? "tw-text-black" : "tw-text-white"
            }`}
          >
            <FontAwesomeIcon icon={faHome} className="tw-text-white tw-mr-6" />
            Home
          </Link>
          <Link
            to="/profile"
            className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-8 ${
              location.pathname === "/profile"
                ? "tw-text-black"
                : "tw-text-white"
            }`}
          >
            <FontAwesomeIcon icon={faUser} className="tw-text-white tw-mr-6" />
            Profile
          </Link>
          <Link
            to="/search"
            className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-8 ${
              location.pathname === "/search"
                ? "tw-text-black"
                : "tw-text-white"
            }`}
          >
            <FontAwesomeIcon
              icon={faSearch}
              className="tw-text-white tw-mr-6"
            />
            Search
          </Link>
          <Link
            to="/health"
            className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-8 ${
              location.pathname === "/health"
                ? "tw-text-black"
                : "tw-text-white"
            }`}
          >
            <FontAwesomeIcon
              icon={faHeartbeat}
              className="tw-text-white tw-mr-6"
            />
            Health
          </Link>
          <button
            onClick={handleSignOut}
            className={`tw-py-2 tw-text-3xl tw-w-full tw-flex-1 tw-justify-center tw-items-center tw-rounded tw-mb-8 ${
              location.pathname === "/logout"
                ? "tw-text-black"
                : "tw-text-white"
            }`}
          >
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className="tw-text-white tw-mr-2"
            />
            Logout
          </button>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex justify-center items-center">
            <div className="flex flex-col items-center tw-mb-4">
              <Link
                to="/home"
                className={`tw-py-2 tw-text-3xl ${
                  location.pathname === "/" ? "tw-text-black" : "tw-text-white"
                }`}
                onClick={handleMenuToggle}
              >
                <FontAwesomeIcon
                  icon={faHome}
                  className="tw-text-white tw-mr-2"
                />
                Home
              </Link>
            </div>
            <div className="flex flex-col items-center tw-mb-4">
              <Link
                to="/profile"
                className={`tw-py-2 tw-text-3xl ${
                  location.pathname === "/profile"
                    ? "tw-text-black"
                    : "tw-text-white"
                }`}
                onClick={handleMenuToggle}
              >
                <FontAwesomeIcon
                  icon={faUser}
                  className="tw-text-white tw-mr-2"
                />
                Profile
              </Link>
            </div>
            <div className="flex flex-col items-center tw-mb-4">
              <Link
                to="/search"
                className={`tw-py-2 tw-text-3xl ${
                  location.pathname === "/search"
                    ? "tw-text-black"
                    : "tw-text-white"
                }`}
                onClick={handleMenuToggle}
              >
                <FontAwesomeIcon
                  icon={faSearch}
                  className="tw-text-white tw-mr-2"
                />
                Search
              </Link>
            </div>
            <div className="flex flex-col items-center tw-mb-4">
              <Link
                to="/health"
                className={`tw-py-2 tw-text-3xl ${
                  location.pathname === "/health"
                    ? "tw-text-black"
                    : "tw-text-white"
                }`}
                onClick={handleMenuToggle}
              >
                <FontAwesomeIcon
                  icon={faHeartbeat}
                  className="tw-text-white tw-mr-2"
                />
                Health
              </Link>
            </div>
            <button
              onClick={handleSignOut}
              className={`tw-py-2 tw-text-3xl ${
                location.pathname === "/logout"
                  ? "tw-text-black"
                  : "tw-text-white"
              }`}
            >
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className="tw-text-white tw-mr-2"
              />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
