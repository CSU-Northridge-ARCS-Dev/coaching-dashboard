import React, { useEffect, useState } from "react";
import { loadAppleHealth } from "../lib/loadAppleHealth";
import V02MaxChart from "../components/V02MaxChart";
import HeartGraph from "../components/HeartGraph";
import SleepStackedBars from "../components/SleepStackedBars";

export default function AppleHealthSandbox() {
  const [d, setD] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await loadAppleHealth();

      console.group("Apple Health CSVs");
      console.log("Counts", {
        vo2_raw: data.vo2Raw.length,
        vo2_weekly: data.vo2Weekly.length,
        rhr_daily: data.rhrDaily.length,
        rhr_weekly: data.rhrWeekly.length,
        sleep_nightly: data.sleepNightly.length,
        sleep_weekly: data.sleepWeekly.length,
      });
      console.log("Samples", {
        vo2_raw: data.vo2Raw.slice(0, 5),
        vo2_weekly: data.vo2Weekly.slice(0, 5),
        rhr_daily: data.rhrDaily.slice(0, 5),
        rhr_weekly: data.rhrWeekly.slice(0, 5),
        sleep_nightly: data.sleepNightly.slice(0, 3),
        sleep_weekly: data.sleepWeekly.slice(0, 3),
      });
      console.log("Chart-ready", {
        vo2PointsWeekly: data.vo2PointsWeekly.slice(0, 5),
        rhrDailyPoints: data.rhrDailyPoints.slice(0, 5),
        sleepNights: data.sleepNights.slice(-3),
      });
      console.groupEnd();

      setD(data);
    })();
  }, []);

  if (!d) return <div style={{ padding: 24 }}>Loading Apple Health data…</div>;

  return (
    <div style={{ padding: 24, display: "grid", gap: 20 }}>
      {/* VO₂ weekly (latest per ISO week) */}
      <div style={{ background: "white", borderRadius: 12, padding: 16, height: 420 }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>VO₂ Max (weekly latest)</h3>
        <V02MaxChart csvData={d.vo2PointsWeekly} />
      </div>

      {/* Resting HR daily */}
      <div style={{ background: "white", borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Resting Heart Rate (daily)</h3>
        <div style={{ height: 360 }}>
          <HeartGraph heartRateData={d.rhrDailyPoints} />
        </div>
      </div>

      {/* Sleep stacked bars (last 10 nights) */}
      <SleepStackedBars nights={d.sleepNights} limit={10} />
    </div>
  );
}
