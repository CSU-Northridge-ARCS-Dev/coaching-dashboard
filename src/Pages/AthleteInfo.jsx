import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import HeartGraph from "../Components/HeartGraph";
import ActivityRing from "../Components/ActivityRing";
import SleepGraph from "../Components/SleepGraph";

const AthleteInfo = () => {
  const [user] = useAuthState(getAuth());
  const navigate = useNavigate();
  const location = useLocation();
  const athlete = location.state?.user;

  const [heartRateData, setHeartRateData] = useState([]);
  const [sleepData, setSleepData] = useState([]);

  // Checks if user is signed in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!athlete?.id) return;
      const heartRes = await fetch(`http://localhost:3000/getHeartRate?userId=${athlete.id}`);
      const sleepRes = await fetch(`http://localhost:3000/getSleepData?userId=${athlete.id}`);
      const heartData = await heartRes.json();
      const sleep = await sleepRes.json();
  
      setHeartRateData(heartData.heartRateData || []);
      setSleepData(sleep.sleepData || []);
    };
    fetchData();
  }, [athlete]);

  return (
    <div className="tw-flex tw-flex-col tw-bg-black tw-min-h-screen">
      <Navbar />
      <div className="tw-flex-1 tw-ml-64 tw-p-4 tw-text-white tw-space-y-4">
        <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg">
          <div className="tw-text-xl tw-font-bold">{athlete.fullName}</div>
        </div>

        <div className="tw-grid tw-grid-cols-1 tw-gap-4">
          <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[400px]">
            <HeartGraph heartRateData={heartRateData} />
          </div>
          <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[400px]">
            <SleepGraph sleepData={sleepData} />
          </div>
        </div>

        {/* <div className="tw-flex tw-gap-4">
          <div className="tw-flex-1 tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[400px]">
            <HeartGraph heartRateData={heartRateData} />
          </div>
          <div className="tw-flex-1 tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[400px]">
            <SleepGraph sleepData={sleepData} />
          </div>
        </div> */}

        <div className="tw-flex tw-justify-center tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[500px]">
          <ActivityRing />
        </div>
      </div>
    </div>

    // <div className="tw-flex tw-bg-black tw-min-h-screen tw-flex-col">
    //   <Navbar />
    //   <div className="tw-flex-1 tw-ml-64 tw-p-4 tw-text-white">
    //     <div className="tw-p-4">
    //       {athlete ? (
    //         <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-mb-6">
    //           <div className="tw-text-xl tw-font-bold">{athlete.fullName}</div>
    //         </div>
    //       ) : (
    //         <p>No athlete selected</p>
    //       )}
    //     </div>
    //     <div className="tw-flex tw-justify-between tw-gap-4">
    //       <div className="tw-flex-1 tw-bg-gray-800 tw-p-4 tw-rounded-lg">
    //         <HeartGraph heartRateData={heartRateData} />
    //       </div>
    //       <div className="tw-flex-1 tw-bg-gray-800 tw-p-4 tw-rounded-lg">
    //         <SleepGraph sleepData={sleepData} />
    //       </div>
    //     </div>
    //   </div>
    //   <div className="tw-p-4 tw-flex tw-justify-center">
    //     <ActivityRing />
    //   </div>
    // </div>
  );
};

export default AthleteInfo;
