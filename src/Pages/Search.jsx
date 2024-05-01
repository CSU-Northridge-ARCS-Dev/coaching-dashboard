import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCog,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const Search = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [user] = useAuthState(getAuth());
  const displayName = user ? user.displayName : "";
  const [firstName, lastName] = displayName ? displayName.split(" ") : ["", ""];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="tw-grid tw-grid-rows-[1fr_auto] tw-grid-cols-[auto_1fr] tw-min-h-screen">
      {!isMobile && <Navbar />}
      <div className="tw-col-span-1 tw-row-span-1 tw-bg-[gradient-radial-1] tw-bg-[gradient-radial-2] tw-border-l-4 tw-border-black">
        {isMobile && <Navbar />}
        {user && !isMobile && (
          <div className="tw-bg-appTheme tw-flex tw-justify-between tw-items-center tw-px-4 tw-py-2 tw-text-white">
            <div className="tw-text-xl">
              Hello {firstName} {lastName}, Welcome back to the
              <strong> Coaching Dashboard</strong> 👋
            </div>
            <div className="tw-flex tw-items-center">
              <button className="tw-ml-12">
                <FontAwesomeIcon icon={faBell} className="tw-text-4xl" />
                <div>Alerts</div>
              </button>
              <div className="tw-ml-12 tw-flex tw-flex-col tw-items-center">
                <Link to="/settings">
                  <FontAwesomeIcon icon={faCog} className="tw-text-4xl" />
                </Link>
                <div>Settings</div>
              </div>
            </div>
          </div>
        )}
        <div className="tw-h-1 tw-bg-black"></div>

        <section className="tw-flex tw-flex-col tw-items-center tw-justify-center">
          <div className="tw-mt-4 tw-flex tw-items-center">
            <input
              type="text"
              placeholder="Search..."
              className="tw-py-2 tw-px-4 tw-rounded-l-lg tw-outline-none tw-w-96"
            />
            <button className="tw-bg-red-600 tw-py-2 tw-px-4 tw-rounded-r-lg tw-text-white hover:tw-bg-red-700">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>

          {/* Mobile menu */}
          {isMobile && (
            <div className="tw-w-48 tw-h-48 tw-bg-blue-500 tw-flex tw-items-center tw-justify-center tw-mt-4">
              <FontAwesomeIcon
                icon={faUser}
                className="tw-text-white tw-text-4xl"
              />
            </div>
          )}
        </section>

        <div className="tw-mt-8 tw-grid tw-grid-cols-3 tw-gap-32 tw-place-items-center">
          {!isMobile && (
            <>
              <div className="tw-w-48 tw-h-48 tw-bg-blue-500 tw-flex tw-items-center tw-justify-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="tw-text-white tw-text-4xl"
                />
              </div>
              <div className="tw-w-48 tw-h-48 tw-bg-green-500 tw-flex tw-items-center tw-justify-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="tw-text-white tw-text-4xl"
                />
              </div>
              <div className="tw-w-48 tw-h-48 tw-bg-yellow-500 tw-flex tw-items-center tw-justify-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="tw-text-white tw-text-4xl"
                />
              </div>
              <div className="tw-w-48 tw-h-48 tw-bg-purple-500 tw-flex tw-items-center tw-justify-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="tw-text-white tw-text-4xl"
                />
              </div>
              <div className="tw-w-48 tw-h-48 tw-bg-indigo-500 tw-flex tw-items-center tw-justify-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="tw-text-white tw-text-4xl"
                />
              </div>
              <div className="tw-w-48 tw-h-48 tw-bg-pink-500 tw-flex tw-items-center tw-justify-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="tw-text-white tw-text-4xl"
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="tw-col-span-2 ">
        <Footer />
      </div>
    </div>
  );
};

export default Search;
