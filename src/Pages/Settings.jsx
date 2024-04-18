import React, { createContext, useState } from 'react';
import Navbar from "../Components/Navbar";

const Settings = () => {
    return (
        <div className="tw-grid tw-grid-rows-[1fr_auto] tw-grid-cols-[auto_1fr] tw-min-h-screen">
      <Navbar />
      {/* use gradient component, then choice of colors  */} {/* tw-bg-gradient-to-r tw-from-black tw-to-red-900 */}
      <div className="tw-col-span-1 tw-row-span-1 tw-bg-[gradient-radial-1] tw-bg-[gradient-radial-2] tw-border-l-4 tw-border-black">
        <div>
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

          <div className="tw-h-1 tw-bg-black"></div>

          <section className="tw-flex ">
            <div>
                <button onClick={() => setDarkMode(!darkMode)}>
                    Toggle Dark Mode
                </button>
            </div>
            <div className="tw-bg-black"></div>
          </section>
        </div>
      </div>
      <div className="tw-col-span-2 ">
        <Footer />
      </div>
    </div>
    );
};

export const ThemeContext = createContext();

export default Settings;