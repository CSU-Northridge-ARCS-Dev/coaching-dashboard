import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCog,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const Search = () => {
  return (
    <div className="tw-grid tw-grid-rows-[1fr_auto] tw-grid-cols-[auto_1fr] tw-min-h-screen">
      <Navbar />
      <div className="tw-col-span-1 tw-row-span-1 tw-bg-gradient-to-r tw-from-black tw-to-red-900 tw-border-l-4 tw-border-black">
        <div>
          <div className="tw-bg-red-900 tw-flex tw-justify-between tw-items-center tw-px-4 tw-py-2 tw-text-white">
            <div className="tw-text-xl">
              Hello John Doe, Welcome back to the
              <strong> Coaching Dashboard</strong>
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

          <div className="tw-h-1 tw-bg-black"></div>

          <section className="tw-flex tw-flex-col tw-items-center tw-justify-center">
            <div className="tw-mt-4 tw-flex">
              <input
                type="text"
                placeholder="Search..."
                className="tw-py-2 tw-px-4 tw-rounded-l-lg tw-outline-none tw-w-64"
              />
              <button className="tw-bg-red-600 tw-py-2 tw-px-4 tw-rounded-r-lg tw-text-white hover:tw-bg-red-700">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </section>

          <div className="tw-mt-8 tw-grid tw-grid-cols-3 tw-gap-32 tw-place-items-center">
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
          </div>
        </div>
      </div>
      <div className="tw-col-span-2">
        <Footer />
      </div>
    </div>
  );
};

export default Search;
