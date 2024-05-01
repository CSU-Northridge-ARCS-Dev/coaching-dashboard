import React, { createContext, useState } from 'react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import TopBar from '../Components/TopBar';
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
export const ThemeContext = createContext();

const Settings = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

  const handleCheckEmail = async () => {
    const auth = getAuth();
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setMessage("Email found!");
      } else {
        setMessage("Email does not exist.");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setMessage("Failed to check email.");
    }
  };

    return (
        <div className="settings-topbar tw-flex tw-min-h-screen">
            <div className='settings-sidebar'>
                <Navbar />
            </div>
            <div className='settings-topbar-and-content tw-flex-grow tw-bg-[gradient-radial-1] tw-bg-[gradient-radial-2]'>
                <TopBar />
            </div>
            {/* Content for general, appearance, notifications, and data settings */}
            <div className="tw-col-span-1 tw-row-span-1 tw-bg-[gradient-radial-1] tw-bg-[gradient-radial-2] tw-border-l-4 tw-border-black">
                {/* Content for dark mode, notification settings, and health data delete */}
                <div className='settings-container tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4'>
                    <div className='settings-item tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4 tw-bg-gray-300'>
                        <h2 className='tw-col-span-2 tw-text-center'>General</h2>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Setting 1</button>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Setting 2</button>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email to check"
                        />
                        <button onClick={handleCheckEmail}>Check Email</button>
                        <p>{message}</p>
                    </div>
                    <div className='settings-item tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4 tw-bg-gray-300'>
                    <h2 className='tw-col-span-2 tw-text-center'>Appearance</h2>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Dark Mode</button>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Setting 2</button>
                    </div>
                    <div className='settings-item tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4 tw-bg-gray-300'>
                        <h2 className='tw-col-span-2 tw-text-center'>Notifications</h2>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Setting 1</button>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Setting 2</button>
                    </div>
                    <div className='settings-item tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4 tw-bg-gray-300'>
                        <h2 className='tw-col-span-2 tw-text-center'>Data Settings</h2>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Setting 1</button>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Setting 2</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;import React, { useState } from "react";