import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const TopBar = () => {
    return (
        <div className="top-bar">
            {/* Add your top bar content here */}
            <div className="tw-col-span-1 tw-row-span-1 tw-bg-[gradient-radial-1] tw-bg-[gradient-radial-2] tw-border-l-4 tw-border-black">
                <div className="tw-bg-red-900 tw-flex tw-justify-between tw-items-center tw-px-4 tw-py-2 tw-text-white">
                    <div className="tw-text-xl">
                    {/* use dynamic data here instead of John Doe */}
                    Hello John Doe, Welcome back to the
                    <strong> Coaching Dashboard</strong>
                    👋
                    </div>
                    <div>
                    <Link to="/alerts">
                        <button className="tw-ml-12">
                        <FontAwesomeIcon icon={faBell} className="tw-text-4xl" />
                        <div>Alerts</div>
                        </button>
                    </Link>
                    <Link to="/Settings">
                        <button className="tw-ml-12">
                        <FontAwesomeIcon icon={faCog} className="tw-text-4xl" />
                        <div>Settings</div>
                        </button>
                    </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;