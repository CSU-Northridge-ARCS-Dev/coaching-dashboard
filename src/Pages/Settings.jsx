import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import TopBar from '../Components/TopBar';
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";

const Settings = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
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

    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

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
        <div className="settings-topbar tw-grid tw-grid-rows-[1fr_auto] tw-grid-cols-[auto_1fr] tw-min-h-screen">
            <div className="tw-text-xl">
              Hello {firstName} {lastName}, Welcome back to the
              <strong> Coaching Dashboard</strong> 👋
            </div>
            {/* Content for general, appearance, notifications, and data settings */}
            <div className="tw-col-span-1 tw-row-span-1 tw-bg-[gradient-radial-1] tw-bg-[gradient-radial-2] tw-border-l-4 tw-border-black">
                {/* Content for dark mode, notification settings, and health data delete */}
                <div className='settings-container tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4'>
                    <div className='settings-item tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4 tw-bg-gray-300'>
                        <h2 className='tw-col-span-2 tw-text-center'>General</h2>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Setting 1</button>
                        <button className='settings-button tw-bg-red-900 tw-text-white' id='dark-mode-button'>Setting 2</button>
                        <input className='settings-button tw-bg-red-900 tw-text-white'
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email to check"
                        />
                        <button className="settings-button tw-bg-red-900 tw-text-white" onClick={handleCheckEmail}>Check Email</button>
                        <p className='settings-button tw-bg-red-900 tw-text-white'>{message}</p>
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

export default Settings;