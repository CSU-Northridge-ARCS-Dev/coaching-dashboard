import React from "react";

const Navbar = () => {
  return (
    <div className="tw-bg-red-900 tw-w-64 tw-flex tw-flex-col tw-items-center tw-py-4 tw-px-4">
      this is the left navbar
      <div className="tw-flex tw-flex-row tw-items-center tw-w-full">
        <img
          src="/csun_logo.png"
          alt="CSUN logo"
          className="tw-h-24 tw-w-24 tw-rounded-full tw-mr-2"
        />
        <span className="tw-font-bold tw-text-3xl tw-ml-2">Athlete</span>
      </div>
      <div className="tw-flex tw-flex-col tw-w-full tw-mt-4 tw-px-6">
        <a
          href="#home"
          className="tw-py-2 tw-text-lg tw-text-center tw-text-white hover:tw-bg-gray-600 tw-rounded tw-mb-2"
        >
          Home
        </a>
        <a
          href="#profile"
          className="tw-py-2 tw-text-lg tw-text-center tw-text-white hover:tw-bg-gray-600 tw-rounded tw-mb-2"
        >
          Profile
        </a>
        <a
          href="#settings"
          className="tw-py-2 tw-text-lg tw-text-center tw-text-white hover:tw-bg-gray-600 tw-rounded tw-mb-2"
        >
          Boracle
        </a>
      </div>
    </div>
  );
};

export default Navbar;
