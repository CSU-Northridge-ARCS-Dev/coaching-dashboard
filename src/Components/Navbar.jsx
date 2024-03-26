import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faSearch,
  faHeartbeat,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  return (
    <div className="tw-bg-red-900 tw-w-64 tw-flex tw-flex-col tw-items-center tw-py-4 tw-px-4  tw-justify-center">
      <div className="tw-flex tw-flex-col tw-w-full tw-mt-4 tw-items-center">
        <a
          href="#home"
          className="tw-py-2 tw-text-3xl tw-text-white tw-w-full hover:tw-text-black tw-flex tw-justify-center tw-items-center tw-rounded tw-mb-12"
        >
          <FontAwesomeIcon icon={faHome} className="tw-text-white tw-mr-6" />
          Home
        </a>
        <a
          href="#profile"
          className="tw-py-2 tw-text-3xl tw-text-white tw-w-full hover:tw-text-black tw-flex tw-justify-center tw-items-center tw-rounded tw-mb-12"
        >
          <FontAwesomeIcon icon={faUser} className="tw-text-white tw-mr-6" />
          Profile
        </a>
        <a
          href="#search"
          className="tw-py-2 tw-text-3xl tw-text-white hover:tw-text-black tw-w-full tw-flex tw-justify-center tw-items-center tw-rounded tw-mb-12"
        >
          <FontAwesomeIcon icon={faSearch} className="tw-text-white tw-mr-6" />
          Search
        </a>
        <a
          href="#health"
          className="tw-py-2 tw-text-3xl tw-text-white hover:tw-text-black tw-w-full tw-flex tw-justify-center tw-items-center tw-rounded tw-mb-12"
        >
          <FontAwesomeIcon
            icon={faHeartbeat}
            className="tw-text-white tw-mr-6"
          />
          Health
        </a>
        <a
          href="#logout"
          className="tw-py-2 tw-text-3xl tw-text-white hover:tw-text-black tw-w-full tw-flex tw-justify-center tw-items-center tw-rounded tw-mb-12"
        >
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className="tw-text-white tw-mr-2"
          />
          Logout
        </a>
      </div>
    </div>
  );
};

export default Navbar;
