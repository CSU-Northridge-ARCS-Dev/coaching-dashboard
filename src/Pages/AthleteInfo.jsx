// src/Pages/AthleteInfo.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import Navbar from "../Components/Navbar";
import HeartGraph from "../Components/HeartGraph";        // should accept { userId?, heartRateData?, onRangeChange? }
import ActivityRing from "../Components/ActivityRing";
import VO2MaxChart from "../Components/V02MaxChart";      // this one fetches itself
import SleepTimeline from "../Components/SleepTimeline";   // should accept { userId?, data?, onRangeChange? }

const AthleteInfo = () => {
  const [user] = useAuthState(getAuth());
  const navigate = useNavigate();
  const location = useLocation();
  const athlete = location.state?.user;

  const [heartRateData, setHeartRateData] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(false);

  // hard guard: must be signed in and have an athlete
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // -------- helpers --------
  const fetchHeartRate = useCallback(async ({ start, end } = {}) => {
    if (!athlete?.id) return;
    const qs = new URLSearchParams({ userId: athlete.id });
    if (start) qs.set("start", start);
    if (end) qs.set("end", end);

    try {
      const res = await fetch(`/api/getHeartRate?${qs.toString()}`);
      if (!res.ok) {
        console.warn("getHeartRate failed:", res.status, await res.text());
        setHeartRateData([]); // clear but don't crash
        return;
      }
      const json = await res.json();
      setHeartRateData(json.heartRateData ?? []);
      console.log("[HR] rows:", (json.heartRateData ?? []).length, { start, end });
    } catch (e) {
      console.warn("getHeartRate error:", e);
      setHeartRateData([]);
    }
  }, [athlete?.id]);

  const fetchSleep = useCallback(async ({ start, end } = {}) => {
    if (!athlete?.id) return;
    const qs = new URLSearchParams({ userId: athlete.id });
    if (start) qs.set("start", start);
    if (end) qs.set("end", end);

    try {
      const res = await fetch(`/api/getSleepData?${qs.toString()}`);
      if (!res.ok) {
        console.warn("getSleepData failed:", res.status, await res.text());
        setSleepData([]);
        return;
      }
      const json = await res.json();
      setSleepData(json.sleepData ?? []);
      console.log("[Sleep] rows:", (json.sleepData ?? []).length, { start, end });
    } catch (e) {
      console.warn("getSleepData error:", e);
      setSleepData([]);
    }
  }, [athlete?.id]);

  // initial load (no range)
  useEffect(() => {
    if (!athlete?.id) return;
    (async () => {
      setLoading(true);
      await Promise.all([fetchHeartRate(), fetchSleep()]);
      setLoading(false);
    })();
  }, [athlete?.id, fetchHeartRate, fetchSleep]);

  // -------- range callbacks passed down to charts --------
  const onHeartRangeChange = async ({ startDate, endDate }) => {
    await fetchHeartRate({
      start: startDate?.toISOString(),
      end: endDate?.toISOString(),
    });
  };

  const onSleepRangeChange = async ({ startDate, endDate }) => {
    await fetchSleep({
      start: startDate?.toISOString(),
      end: endDate?.toISOString(),
    });
  };

  return (
    <div className="tw-flex tw-flex-col tw-bg-black tw-min-h-screen">
      <Navbar />

      <div className="tw-flex-1 tw-ml-64 tw-p-4 tw-text-white tw-space-y-4">
        <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg">
          <div className="tw-text-xl tw-font-bold">
            {athlete?.fullName || "Athlete"}
          </div>
          {loading && <div className="tw-text-xs tw-opacity-70">Loading…</div>}
        </div>

        {/* Heart rate */}
        <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg">
          <HeartGraph
            userId={athlete?.id}
            heartRateData={heartRateData}
            onRangeChange={onHeartRangeChange}
          />
        </div>

        {/* VO2 Max (fetches itself; server exposes /getVO2MaxData) */}
        <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg">
          <VO2MaxChart userId={athlete?.id} />
        </div>

        {/* Sleep timeline */}
        <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg">
          <SleepTimeline
            userId={athlete?.id}
            data={sleepData}
            onRangeChange={onSleepRangeChange}
          />
        </div>

        <div className="tw-flex tw-justify-center tw-bg-gray-800 tw-p-4 tw-rounded-lg tw-h-[500px]">
          <ActivityRing />
        </div>
      </div>
    </div>
  );
};

export default AthleteInfo;
