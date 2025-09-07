import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import HeartGraph from "../Components/HeartGraph";
import ActivityRing from "../Components/ActivityRing";
import VO2MaxChart from "../Components/V02MaxChart";
import SleepTimeline from "../Components/SleepTimeline";

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
  
      //setHeartRateData(heartData.heartRateData || []);
      if (heartData.heartRateData) {
        // const now = new Date();
        // const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      
        // console.log("Now:", now.toISOString());
        // console.log("6 hours ago:", sixHoursAgo.toISOString());
      
        // const filteredHeartRate = heartData.heartRateData
        //   .filter(entry => {
        //     const time = new Date(entry.time);
        //     console.log("Checking:", entry.time, "Parsed:", time.toISOString());
        //     return !isNaN(time) && time >= sixHoursAgo && time <= now;
        //   })
        //   .sort((a, b) => new Date(a.time) - new Date(b.time));
        if (heartData.heartRateData && heartData.heartRateData.length > 0) {
          // Sort and find latest timestamp
          const sorted = heartData.heartRateData
            .filter(entry => !isNaN(new Date(entry.time))) // clean invalid dates
            .sort((a, b) => new Date(a.time) - new Date(b.time));
        
          const latestTime = new Date(sorted[sorted.length - 1].time);
          const sixHoursBefore = new Date(latestTime.getTime() - 8 * 60 * 60 * 1000);
        
          console.log("Latest data point:", latestTime.toISOString());
          console.log("6 hours before:", sixHoursBefore.toISOString());
        
          const filteredHeartRate = sorted.filter(entry => {
            const time = new Date(entry.time);
            return time >= sixHoursBefore && time <= latestTime;
          });
        
          console.log("Filtered count:", filteredHeartRate.length);
        
          setHeartRateData(filteredHeartRate);
        }
        
      
        //console.log("Filtered count:", filteredHeartRate.length);
      
        //setHeartRateData(filteredHeartRate);
      }
      

      console.log("Raw sleep data from backend:", sleep);
      console.log("Sleep data length:", sleep.sleepData?.length);
      
      //setSleepData(sleep.sleepData || []);
      if (sleep.sleepData && sleep.sleepData.length > 0) {
        const processSleepData = (entries) => {
          let deepSleep = 0, coreSleep = 0, remSleep = 0, awake = 0, unknown = 0;
        
          entries.forEach(({ stage, startTime, endTime }) => {
            const duration = (new Date(endTime) - new Date(startTime)) / 3600000;
            switch (stage) {
              case 1: awake += duration; break;
              case 2: remSleep += duration; break;
              case 3: coreSleep += duration; break;
              case 4: deepSleep += duration; break;
              default: unknown += duration; break;
            }
          });
        
          return {
            deepSleep: deepSleep.toFixed(2),
            coreSleep: coreSleep.toFixed(2),
            remSleep: remSleep.toFixed(2),
            awake: awake.toFixed(2),
            unknown: unknown.toFixed(2),
          };
        };
        
        const processedSleep = processSleepData(sleep.sleepData);
        console.log("✅ Processed sleep data:", processedSleep);
        setSleepData(processedSleep);
      }
      
    };
    fetchData();
  }, [athlete]);

  return (
    <div className="tw-flex tw-flex-col tw-bg-black tw-min-h-screen">
      <Navbar />

      <div className="tw-flex-1 tw-ml-64 tw-p-4 tw-text-white tw-space-y-4">
        <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg">
          <div className="tw-text-xl tw-font-bold">{athlete?.fullName}</div>
        </div>
        <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[400px]">
            <HeartGraph heartRateData={heartRateData} />
        </div>
        <div className="tw-grid tw-grid-cols-1 tw-gap-4">
          <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[580px] tw-flex tw-flex-col">
            <div className="tw-flex-grow">
              <VO2MaxChart userId={athlete?.id} />
            </div>
          </div>
          <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[400px]">
            <SleepTimeline />
          </div>
        </div>

        <div className="tw-flex tw-justify-center tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[500px]">
          <ActivityRing />
        </div>
      </div>
    </div>
  );
};

export default AthleteInfo;
