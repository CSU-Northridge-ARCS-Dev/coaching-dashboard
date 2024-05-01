import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [user] = useAuthState(getAuth());
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        <section className="tw-flex ">
          <div
            className={`tw-flex tw-justify-center tw-items-center ${
              isMobile ? "tw-mt-32" : ""
            }`}
          >
            <img
              src="/soccer_team.jpg"
              alt="CSUN Soccer Team"
              className="tw-mx-3 tw-my-3"
            />
          </div>
          <div className="tw-bg-black"></div>
        </section>
      </div>
      <div className="tw-col-span-2 ">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
