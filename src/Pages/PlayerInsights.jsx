import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import Navbar from "../Components/Navbar";
import HeartGraph from "../Components/HeartGraph";
import VO2MaxChart from "../Components/V02MaxChart";
import SleepStackedBars from "../Components/SleepStackedBars";

import { loadAppleHealth } from "../lib/loadAppleHealth";

export default function PlayerInsights() {
  const [user] = useAuthState(getAuth());
  const navigate = useNavigate();
  const location = useLocation();
  const athlete = location.state?.user;

  const [ah, setAh] = useState(null);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    // (async () => {
    //   const data = await loadAppleHealth();
    //   // dev console peek
    //   console.group("PlayerInsights · Apple Health CSV");
    //   console.log({
    //     vo2_raw: data.vo2Raw.length,
    //     vo2_weekly: data.vo2Weekly.length,
    //     rhr_daily: data.rhrDaily.length,
    //     sleep_nightly: data.sleepNightly.length,
    //   });
    //   console.groupEnd();
    //   setAh(data);
    // })();
    (async () => {
      try {
        const data = await loadAppleHealth();
        console.group("PlayerInsights · Apple Health CSV");
        console.log({ vo2_raw: data.vo2Raw.length, vo2_weekly: data.vo2Weekly.length, rhr_daily: data.rhrDaily.length, sleep_nightly: data.sleepNightly.length });
        console.groupEnd();
        setAh(data);
      } catch (e) {
        console.error("Apple Health CSV load failed:", e);
        setAh({ error: String(e?.message || e) });
      }
    })();
  }, []);

  // shared classes to match Navbar theme
  const pageBg = "tw-bg-[var(--app-bg, #000)]";
  const card =
    "tw-bg-[var(--sidebar-bg)] tw-border tw-border-[var(--border)] tw-rounded-xl tw-shadow-sm";
  const title = "tw-text-[var(--text)] tw-text-xl tw-font-semibold";
  const sectionHeader = "tw-text-[var(--muted-text)] tw-text-sm tw-font-medium tw-tracking-wide tw-uppercase";

  if (!ah) {
    return (
      <div className={`tw-flex tw-flex-col ${pageBg} tw-min-h-screen tw-text-[var(--text)]`}>
        <Navbar />
        <div className="tw-flex-1 tw-ml-64 tw-p-6">
          <div className={`${card} tw-p-4`}>Loading Player Insights…</div>
        </div>
      </div>
    );
  }
  if (ah.error) {
    return (
      <div className={`tw-flex tw-flex-col ${pageBg} tw-min-h-screen tw-text-[var(--text)]`}>
        <Navbar />
        <div className="tw-flex-1 tw-ml-64 tw-p-6">
          <div className={`${card} tw-p-4`}>Couldn’t load CSVs: {ah.error}. Check files in <code>public/data/apple-health</code>.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`tw-flex tw-flex-col ${pageBg} tw-min-h-screen tw-text-[var(--text)]`}>
      <Navbar />
      <div className="tw-flex-1 tw-ml-64 tw-p-6 tw-space-y-6">
        {/* Athlete/context header */}
        <div className={`${card} tw-p-4`}>
          <div className={title}>{athlete?.fullName || "Player Insights (Sample Data)"}</div>
          <div className="tw-text-[var(--muted-text)] tw-text-sm tw-mt-1">
            VO₂ Max (weekly), Resting HR (daily), and Sleep stages from CSVs in <code>/public/data/apple-health</code>.
          </div>
        </div>

        {/* Heart Rate (from CSV daily RHR points) */}
        <div className={`${card} tw-p-4 tw-h-[400px] tw-flex tw-flex-col tw-overflow-hidden`}>
          <div className="tw-mb-2">
            <span className={sectionHeader}>Resting Heart Rate (daily)</span>
          </div>
          <div className="tw-flex-1 tw-min-h-0">
            {/* rhrDailyPoints shape: [{ time, beatsPerMinute }] */}
            <HeartGraph heartRateData={ah.rhrDailyPoints} />
          </div>
        </div>

        {/* VO₂ + Sleep */}
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6 tw-items-stretch">
          <div className={`${card} tw-p-4 tw-min-h-[580px] tw-flex tw-flex-col tw-overflow-hidden`}>
            <div className="tw-mb-2">
              <span className={sectionHeader}>VO₂ Max (weekly latest)</span>
            </div>
            <div className="tw-flex-1 tw-min-h-0">
              {/* VO₂ chart prefers csvData; userId kept for API fallback if you later enable it */}
              <VO2MaxChart csvData={ah.vo2PointsWeekly} userId={athlete?.id} />
            </div>
          </div>

          <div className="tw-flex tw-flex-col tw-gap-4">
            <SleepStackedBars nights={ah.sleepNights} limit={10} />
          </div>
        </div>
      </div>
    </div>
  );
}
