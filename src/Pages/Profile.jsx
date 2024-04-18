import React, { useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog } from "@fortawesome/free-solid-svg-icons";
import Chart from 'chart.js/auto';

const Profile = () => {
  const data = [
    { month: "January", count: 10 },
    { month: "February", count: 20 },
    { month: "March", count: 15 },
    { month: "April", count: 25 },
    { month: "May", count: 22 },
    { month: "June", count: 30 },
    { month: "July", count: 28 },
    { month: "August", count: 12 },
    { month: "September", count: 16},
    { month: "October", count: 21 },
    { month: "November", count: 19 },
    { month: "December", count: 15 }
  ];

  useEffect(() => {
    const chartConfig = {
      type: 'bar',
      data: {
        labels: data.map(row => row.month),
        datasets: [
          {
            label: 'Dummy data',
            data: data.map(row => row.count)
          }
        ]
      }
    };
    const ctx = document.getElementById('acquisitions');
    new Chart(ctx, chartConfig);
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  return (
    <div className="tw-grid tw-grid-rows-[1fr_auto] tw-grid-cols-[auto_0.9fr] tw-min-h-screen">
      <Navbar />
      <div className="tw-col-span-1 tw-row-span-1 tw-bg-gradient-to-r tw-from-black tw-to-red-900 tw-border-l-4 tw-border-black">
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

          <div style={{height: "100%", width: "100%", backgroundColor: "black", justifyContent: "center"}}>
             <div style={{ backgroundColor: "white", width: "60%", height: "60%", justifyContent: "center" }}><canvas style={{width: "100%", height: "100%"}} id="acquisitions"></canvas></div>
          </div>
        </div>
      <div className="tw-col-span-2">
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
