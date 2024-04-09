import React from 'react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Settings = () => {
    return (
        <div className="settings-topbar tw-grid tw-grid-rows-[1fr_auto] tw-grid-cols-[auto_1fr] tw-min-h-screen">
            
            <div className="settings-sidebar">
                <Navbar />
                
            </div>
            <div className="tw-col-span-1 tw-row-span-1 tw-bg-[gradient-radial-1] tw-bg-[gradient-radial-2] tw-border-l-4 tw-border-black">
                {/* Content for dark mode, notification settings, and health data delete */}
            </div>
        </div>
    );
};

export default Settings;