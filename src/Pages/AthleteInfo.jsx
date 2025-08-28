import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import HeartGraph from "../Components/HeartGraph";
import ActivityRing from "../Components/ActivityRing";
import SleepGraph from "../Components/SleepGraph";
import SleepTimeline from "../Components/SleepTimeline";
import VO2MaxChart from "../Components/V02MaxChart";

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
      const API_BASE =
        (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ??
        "http://localhost:3000";

      const heartRes = await fetch(`${API_BASE}/getHeartRate?userId=${athlete.id}`);
      const sleepRes = await fetch(`${API_BASE}/getSleepData?userId=${athlete.id}`);
      const heartData = await heartRes.json();
      const sleep = await sleepRes.json();

      if (heartData.heartRateData && heartData.heartRateData.length > 0) {
        const sorted = heartData.heartRateData
          .filter((entry) => !isNaN(new Date(entry.time)))
          .sort((a, b) => new Date(a.time) - new Date(b.time));

        const latestTime = new Date(sorted[sorted.length - 1].time);
        const sixHoursBefore = new Date(latestTime.getTime() - 8 * 60 * 60 * 1000);

        const filteredHeartRate = sorted.filter((entry) => {
          const time = new Date(entry.time);
          return time >= sixHoursBefore && time <= latestTime;
        });

        setHeartRateData(filteredHeartRate);
      }

      if (sleep.sleepData && sleep.sleepData.length > 0) {
        const processSleepData = (entries) => {
          let deepSleep = 0,
            coreSleep = 0,
            remSleep = 0,
            awake = 0,
            unknown = 0;

          entries.forEach(({ stage, startTime, endTime }) => {
            const duration = (new Date(endTime) - new Date(startTime)) / 3600000;
            switch (stage) {
              case 1:
                awake += duration;
                break;
              case 2:
                remSleep += duration;
                break;
              case 3:
                coreSleep += duration;
                break;
              case 4:
                deepSleep += duration;
                break;
              default:
                unknown += duration;
                break;
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
        setSleepData(processedSleep);
      }
    };
    fetchData();
  }, [athlete]);

  // shared classes to match Navbar theme
  const pageBg = "tw-bg-[var(--app-bg, #000)]";
  const card =
    "tw-bg-[var(--sidebar-bg)] tw-border tw-border-[var(--border)] tw-rounded-xl tw-shadow-sm";
  const title =
    "tw-text-[var(--text)] tw-text-xl tw-font-semibold";
  const sectionHeader =
    "tw-text-[var(--muted-text)] tw-text-sm tw-font-medium tw-tracking-wide tw-uppercase";

  return (
    <div className={`tw-flex tw-flex-col ${pageBg} tw-min-h-screen tw-text-[var(--text)]`}>
      <Navbar />

      <div className="tw-flex-1 tw-ml-64 tw-p-6 tw-space-y-6">
        {/* Athlete name */}
        <div className={`${card} tw-p-4`}>
          <div className={title}>{athlete?.fullName}</div>
        </div>

        {/* Heart graph */}
        <div className={`${card} tw-p-4 tw-h-[400px] tw-flex tw-flex-col tw-overflow-hidden`}>
          <div className="tw-mb-2">
            <span className={sectionHeader}>Heart Rate (last 8h)</span>
          </div>
          <div className="tw-flex-1 tw-min-h-0">
            <HeartGraph heartRateData={heartRateData} />
          </div>
        </div>
        {/* <div className={`${card} tw-p-4 tw-h-[400px]`}>
          <div className="tw-mb-2"><span className={sectionHeader}>Heart Rate (last 8h)</span></div>
          <HeartGraph heartRateData={heartRateData} />
        </div> */}

        {/* VO2 + Sleep timeline (match heights to VO₂ Max) */}
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6 tw-items-stretch">
          {/* VO₂ Max — canonical height */}
          <div className={`${card} tw-p-4 tw-min-h-[580px] tw-flex tw-flex-col tw-overflow-hidden`}>
            <div className="tw-mb-2">
              <span className={sectionHeader}>VO₂ Max</span>
            </div>
            <div className="tw-flex-1 tw-min-h-0">
              <VO2MaxChart userId={athlete?.id} />
            </div>
          </div>

          {/* Sleep Timeline — match VO₂ Max height */}
          <div className={`${card} tw-p-4 tw-min-h-[580px] tw-flex tw-flex-col tw-overflow-hidden`}>
            <div className="tw-mb-2">
              <span className={sectionHeader}>Sleep Timeline</span>
            </div>
            <div className="tw-flex-1 tw-min-h-0">
              {/* If you’re using the “fill parent height” version I gave earlier,
                  this will stretch perfectly. Otherwise it still fits without overflow. */}
              <SleepTimeline />
              {/* or <SleepTimeline compact /> if you adopted that prop */}
            </div>
          </div>
        </div>

        {/* Activity ring */}
        <div className={`${card} tw-p-4 tw-h-[500px] tw-flex tw-justify-center tw-items-center`}>
          <div className="tw-absolute tw-right-6 tw-top-6 tw-text-[var(--muted-text)] tw-text-xs tw-uppercase tw-tracking-wide">
            Activity
          </div>
          <ActivityRing />
        </div>
      </div>
    </div>
  );
};

export default AthleteInfo;
