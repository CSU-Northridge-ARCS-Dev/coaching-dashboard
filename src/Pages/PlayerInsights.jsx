import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import Navbar from "../Components/Navbar";
import HeartGraph from "../Components/HeartGraph";
import VO2MaxChart from "../Components/V02MaxChart";
import SleepTimeline from "../Components/SleepTimeline";

import { loadAppleHealth } from "../lib/loadAppleHealth";

/** Compute per-stage minutes from an events array */
function minutesByStage(events) {
  const mins = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const sorted = [...events].sort(
    (a, b) =>
      (typeof a.time === "number" ? a.time : +new Date(a.time)) -
      (typeof b.time === "number" ? b.time : +new Date(b.time))
  );
  for (let i = 0; i < sorted.length - 1; i++) {
    const t0 = typeof sorted[i].time === "number" ? sorted[i].time : +new Date(sorted[i].time);
    const t1 = typeof sorted[i + 1].time === "number" ? sorted[i + 1].time : +new Date(sorted[i + 1].time);
    const dmin = Math.max(0, Math.round((t1 - t0) / 60000));
    mins[sorted[i].stage] += dmin;
  }
  return mins;
}

/**
 * Realistic “sleep cycle” synthesizer from nightly % breakdown.
 * Stages: 1=Deep, 2=Light/Core, 3=REM, 4=Awake
 */
function synthesizeEpochsFromNight(night) {
  if (!night) return [];

  const startMs = new Date(`${night.night}T22:30:00Z`).getTime();
  const totalMin = Math.max(60, Math.round(night.tstMin ?? 480));

  // Quotas from percentages (minutes per stage)
  const quota = {
    1: Math.round(totalMin * (Number(night.deep)  || 0) / 100),   // Deep
    2: Math.round(totalMin * (Number(night.core)  || 0) / 100),   // Light/Core
    3: Math.round(totalMin * (Number(night.rem)   || 0) / 100),   // REM
    4: Math.round(totalMin * (Number(night.awake) || 0) / 100),   // Awake
  };

  // Helper to build contiguous blocks while respecting quotas
  let t = startMs, remain = totalMin;
  const blocks = [];
  const take = (stage, minutes) => {
    if (remain <= 0 || minutes <= 0) return 0;
    const give = Math.min(minutes, Math.max(0, quota[stage] ?? 0), remain);
    if (give <= 0) return 0;
    if (blocks.length && blocks.at(-1).stage === stage) {
      blocks.at(-1).minutes += give;
    } else {
      blocks.push({ stage, minutes: give, start: t });
    }
    quota[stage] -= give;
    remain -= give;
    t += give * 60000;
    return give;
  };

  // ~90-minute cycles; REM grows later; brief wake between cycles
  let cycle = 0;
  while (remain > 0 && cycle < 10) {
    const firstCycleBonusDeep = cycle === 0 ? 10 : 0;
    const remTarget = Math.min(remain, 10 + cycle * 5); // 10,15,20,...

    take(2, 15);                       // settle-in light
    take(1, 30 + firstCycleBonusDeep); // deep chunk early
    take(2, 10);                       // bridge
    take(3, remTarget);                // growing REM

    if (quota[4] > 0 && remain > 0 && cycle > 0) take(4, 5); // brief awakening

    if (remain > 0 && [1,3,4].every(s => quota[s] <= 0) && quota[2] > 0) {
      take(2, remain); // finish with light if others spent
    }
    cycle++;
  }

  // Greedy fill of any leftover minutes
  for (const s of [2, 1, 3, 4]) {
    if (remain <= 0) break;
    if (quota[s] > 0) take(s, quota[s]);
  }

  // Merge tiny blips (<10m) into previous block to avoid sawtooth
  const minSeg = 10;
  const merged = [];
  for (const b of blocks) {
    if (b.minutes < minSeg && merged.length) merged.at(-1).minutes += b.minutes;
    else merged.push(b);
  }

  // Convert blocks → 5-minute epochs for the chart
  const step = 5;
  const events = [];

  // 👇 Seed an initial "Awake" point just BEFORE start so the line begins at Awake,
  // without contributing measurable minutes (diff rounds to 0).
  events.push({ time: startMs - 1, stage: 4 });

  let cur = startMs;
  for (const b of merged) {
    const steps = Math.max(1, Math.round(b.minutes / step));
    for (let i = 0; i < steps; i++) {
      events.push({ time: cur, stage: b.stage });
      cur += step * 60000;
    }
  }
  // terminal awake point to close the series neatly
  events.push({ time: cur, stage: 4 });

  return events;
}


/** Compare CSV targets vs realized events; returns summary for UI + logs */
function auditNightVsTimeline(night, events) {
  const mins = minutesByStage(events);
  const total = Object.values(mins).reduce((a, b) => a + b, 0);
  const pct = (m) => (total ? Math.round((m / total) * 100) : 0);

  const target = {
    1: Math.round(night.deep || 0),
    2: Math.round(night.core || 0),
    3: Math.round(night.rem || 0),
    4: Math.round(night.awake || 0),
  };
  const realized = {
    1: pct(mins[1]),
    2: pct(mins[2]),
    3: pct(mins[3]),
    4: pct(mins[4]),
  };
  const pass = [1, 2, 3, 4].every((s) => Math.abs(target[s] - realized[s]) <= 5);
  return { mins, total, target, realized, pass };
}

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
    (async () => {
      try {
        const data = await loadAppleHealth();
        console.group("PlayerInsights · Apple Health CSV");
        console.log({
          vo2_raw: data.vo2Raw.length,
          vo2_weekly: data.vo2Weekly.length,
          rhr_daily: data.rhrDaily.length,
          sleep_nightly: data.sleepNightly.length,
        });
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
  const sectionHeader =
    "tw-text-[var(--muted-text)] tw-text-sm tw-font-medium tw-tracking-wide tw-uppercase";

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
          <div className={`${card} tw-p-4`}>
            Couldn’t load CSVs: {ah.error}. Check files in <code>public/data/apple-health</code>.
          </div>
        </div>
      </div>
    );
  }

  // most recent night → events
  const chosenNight = ah.sleepNights.at(-1);
  const timelineEvents = synthesizeEpochsFromNight(chosenNight);

  // Console audit + UI badge data
  const audit = chosenNight && timelineEvents.length
    ? auditNightVsTimeline(chosenNight, timelineEvents)
    : null;

  if (audit) {
    console.groupCollapsed("%cSleep · target vs realized", "color:#8a7dff;font-weight:bold;");
    console.log("Night:", chosenNight.night);
    console.table([
      { Stage: "Deep (1)",  CSV_pct: audit.target[1],  Chart_pct: audit.realized[1], Chart_min: audit.mins[1] },
      { Stage: "Light (2)", CSV_pct: audit.target[2],  Chart_pct: audit.realized[2], Chart_min: audit.mins[2] },
      { Stage: "REM (3)",   CSV_pct: audit.target[3],  Chart_pct: audit.realized[3], Chart_min: audit.mins[3] },
      { Stage: "Awake (4)", CSV_pct: audit.target[4],  Chart_pct: audit.realized[4], Chart_min: audit.mins[4] },
    ]);
    const csvSum =
      (chosenNight.deep || 0) +
      (chosenNight.core || 0) +
      (chosenNight.rem || 0) +
      (chosenNight.awake || 0);
    console.log("CSV % sum:", csvSum, "%");
    console.log("Total minutes from chart:", audit.total, "(CSV TST min:", chosenNight.tstMin, ")");
    // quick event integrity check
    const times = timelineEvents.map(e => (typeof e.time === "number" ? e.time : +new Date(e.time)));
    const increasing = times.every((v, i) => i === 0 || v > times[i - 1]);
    const fmt = (ms) =>
      new Date(ms).toLocaleString("en-GB", { hour12: true, timeZone: "UTC" });
    console.log("Points:", timelineEvents.length);
    if (times.length) console.log("Range :", fmt(times[0]), "→", fmt(times[times.length - 1]));
    console.log("Strictly increasing timestamps:", increasing);
    console.groupEnd();
  }

  return (
    <div className={`tw-flex tw-flex-col ${pageBg} tw-min-h-screen tw-text-[var(--text)]`}>
      <Navbar />
      <div className="tw-flex-1 tw-ml-64 tw-p-6 tw-space-y-6">
        {/* Athlete/context header */}
        <div className={`${card} tw-p-4`}>
          <div className={title}>{athlete?.fullName || "Player Insights (Sample Data)"}</div>
          <div className="tw-text-[var(--muted-text)] tw-text-sm tw-mt-1">
            VO₂ Max (weekly), Resting HR (daily), and a one-night Sleep Timeline synthesized from
            nightly percentages in <code>/public/data/apple-health</code>.
          </div>
        </div>

        {/* Heart Rate (from CSV daily RHR points) */}
        <div className={`${card} tw-p-4 tw-h-[400px] tw-flex tw-flex-col tw-overflow-hidden`}>
          <div className="tw-mb-2">
            <span className={sectionHeader}>Resting Heart Rate (daily)</span>
          </div>
          <div className="tw-flex-1 tw-min-h-0">
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
              <VO2MaxChart csvData={ah.vo2PointsWeekly} userId={athlete?.id} />
            </div>
          </div>

          <div className={`${card} tw-p-4 tw-min-h-[580px] tw-flex tw-flex-col tw-overflow-hidden`}>
            <div className="tw-mb-2">
              <span className={sectionHeader}>Sleep Timeline (one night)</span>
              {audit && (
                <span
                  className={`tw-ml-3 tw-text-xs tw-rounded tw-px-2 tw-py-0.5 ${
                    audit.pass
                      ? "tw-bg-green-900 tw-text-green-200"
                      : "tw-bg-yellow-900 tw-text-yellow-200"
                  }`}
                >
                  {audit.pass ? "Validated" : "Approximate"} — D/L/R/A:{' '}
                  {audit.target[1]}/{audit.target[2]}/{audit.target[3]}/{audit.target[4]}%
                  {" → "}
                  {audit.realized[1]}/{audit.realized[2]}/{audit.realized[3]}/{audit.realized[4]}%
                </span>
              )}
            </div>
            <div className="tw-flex-1 tw-min-h-0">
              {timelineEvents.length ? (
                <SleepTimeline events={timelineEvents} />
              ) : (
                <div className="tw-text-[var(--muted-text)]">No nightly sleep data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
