import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog } from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  return (
    <div>
      <div className="tw-bg-pink-300 tw-flex tw-justify-between tw-items-center tw-px-4 tw-py-2 tw-text-black">
        <div className="tw-text-xl">
          Hello John Doe, Welcome back to the{" "}
          <strong>Coaching Dashboard</strong>
          👋
        </div>
        <div>
          <button className="tw-ml-12">
            <FontAwesomeIcon icon={faBell} className="tw-text-4xl" />
            <div>Alerts</div>
          </button>
          <button className="tw-ml-12">
            <FontAwesomeIcon icon={faCog} className="tw-text-4xl" />
            <div>Settings</div>
          </button>
        </div>
      </div>
      <section className="tw-flex ">
        <div>
          <img
            src="/soccer_team.jpg"
            alt="CSUN Soccer Team"
            className="tw-mx-4 tw-my-4"
          />
          <h2 className="tw-text-center">Once a Matador, always a Matador!</h2>
        </div>
      </section>
    </div>
  );
};

export default Home;
