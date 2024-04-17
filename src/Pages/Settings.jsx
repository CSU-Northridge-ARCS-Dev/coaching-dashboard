import React from 'react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Settings = () => {
    return (
        <div className="settings-topbar tw-grid tw-grid-rows-[1fr_auto] tw-grid-cols-[auto_1fr] tw-min-h-screen">
            
            <div className="settings-sidebar">
                <Navbar />
                
            </div>
            {/* Content for general, appearance, notifications, and data settings */}
            <div className="tw-col-span-1 tw-row-span-1 tw-bg-[gradient-radial-1] tw-bg-[gradient-radial-2] tw-border-l-4 tw-border-black">
                {/* Content for dark mode, notification settings, and health data delete */}
                <div className='settings-container tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4'>
                    <div className='settings-item tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4'>
                        General
                    </div>
                    <div className='settings-item tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4'>
                        Appearance
                        <button className='settings-button' id='dark-mode-button'>Dark Mode</button>
                    </div>
                    <div className='settings-item tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4'>
                        Notifications
                    </div>
                    <div className='settings-item tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4'>
                        Data Settings
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;