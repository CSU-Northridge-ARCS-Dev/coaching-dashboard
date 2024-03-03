import React from "react";

const Navbar = () => {
  return (
    <div className="tw-bg-slate-400 tw-w-64 tw-flex tw-flex-col tw-items-center tw-py-4">
      <div className="tw-flex tw-flex-row tw-items-center tw-w-full tw-px-4">
        <img
          src="/csun_logo.png"
          alt="CSUN logo"
          className="tw-h-24 tw-w-24 tw-rounded-full"
        />
        <span className="tw-font-bold tw-text-3xl tw-ml-2">Athlete</span>
      </div>
    </div>
  );
};

export default Navbar;
