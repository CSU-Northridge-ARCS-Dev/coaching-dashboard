import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";
import PopupCalendar from "./DatePicker/PopupCalendar";

const stageMap = {
  1: { label: "Deep",  color: "#00008B" },
  2: { label: "Light", color: "#6495ED" },
  3: { label: "REM",   color: "#ADD8E6" },
  4: { label: "Awake", color: "#FF4D4F" },
};

// demo data — replace with your real feed if needed
const rawData = [
  { time: "2025-05-21T21:34:00.000Z", stage: 4 },
  { time: "2025-05-21T22:00:00.000Z", stage: 2 },
  { time: "2025-05-21T23:00:00.000Z", stage: 3 },
  { time: "2025-05-22T00:30:00.000Z", stage: 2 },
  { time: "2025-05-22T02:00:00.000Z", stage: 1 },
  { time: "2025-05-22T03:30:00.000Z", stage: 2 },
  { time: "2025-05-22T04:30:00.000Z", stage: 3 },
  { time: "2025-05-22T05:00:00.000Z", stage: 4 },
  { time: "2025-05-22T06:45:00.000Z", stage: 4 },
];

function formatRow(e) {
  return {
    time: moment(e.time).valueOf(),                 // numeric x
    displayTime: moment(e.time).format("h:mm a"),   // tooltip
    stage: e.stage,
  };
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{ background: "#000", color: "#fff", padding: 8, borderRadius: 6 }}>
        {stageMap[d.stage].label} · {d.displayTime}
      </div>
    );
  }
  return null;
};

/**
 * Props:
 *  - data?: [{time, stage}]  // optional external feed; defaults to rawData above
 *  - height?: number         // px; default 300
 */
export default function SleepTimeline({ data: external = rawData, height = 300 }) {
  // overlay calendar state
  const [showCal, setShowCal] = useState(false);
  const [range, setRange] = useState(null); // { startDate: Date, endDate: Date }

  // normalize + (optionally) filter to range
  const all = useMemo(() => external.map(formatRow).sort((a,b)=>a.time-b.time), [external]);
  const filtered = useMemo(() => {
    if (!range) return all;
    const s = range.startDate.getTime(), e = range.endDate.getTime();
    return all.filter(p => p.time >= s && p.time <= e);
  }, [all, range]);

  // simple stage duration summary (unchanged)
  const stageDurations = useMemo(() => {
    const acc = {};
    const src = filtered.length ? filtered : all;
    for (let i = 0; i < src.length - 1; i++) {
      const mins = (src[i + 1].time - src[i].time) / 60000;
      acc[src[i].stage] = (acc[src[i].stage] || 0) + mins;
    }
    return acc;
  }, [filtered, all]);

  function handleCalendarChange({ startDate, endDate }) {
    setRange({ startDate, endDate });
  }

  return (
    <div
      style={{
        background: "#0f0f0f",
        padding: 20,
        borderRadius: 10,
        color: "white",
        position: "relative",       // allows the overlay to anchor here
      }}
    >
      {/* header + Range button (VO2-style) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Sleep Stages</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {range && (
            <span style={{ opacity: 0.8, fontSize: 12 }}>
              {moment(range.startDate).format("YYYY-MM-DD")} → {moment(range.endDate).format("YYYY-MM-DD")}
              <button
                onClick={() => setRange(null)}
                style={{ marginLeft: 8, textDecoration: "underline", background: "transparent", color: "#fff" }}
              >
                clear
              </button>
            </span>
          )}
          <button
            onClick={() => setShowCal(true)}
            style={{ border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 18, padding: "6px 10px" }}
          >
            🗓️ Range
          </button>
        </div>
      </div>

      {/* summary blocks (keep light) */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        {[1,2,3,4].map(k => (
          <div key={k} style={{ background: "#141414", border: "1px solid #222", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{stageMap[k].label}</div>
            <div style={{ fontWeight: 700 }}>{Math.round(stageDurations[k] || 0)} min</div>
          </div>
        ))}
      </div>

      {/* fixed-height chart container so it doesn't grow huge */}
      <div style={{ height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filtered}
            margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
          >
            <defs>
              <linearGradient id="sleepGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stopColor={stageMap[1].color} />
                <stop offset="33%"  stopColor={stageMap[2].color} />
                <stop offset="66%"  stopColor={stageMap[3].color} />
                <stop offset="100%" stopColor={stageMap[4].color} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(t) => moment(t).format("h:mm a")}
              tick={{ fill: "white" }}
            />
            <YAxis
              type="number"
              domain={[1, 4]}
              ticks={[1, 2, 3, 4]}
              tickFormatter={(v) => stageMap[v]?.label ?? v}
              tick={{ fill: "white" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="stage"
              stroke="url(#sleepGradient)"
              strokeWidth={4}
              strokeLinecap="round"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* simple overlay calendar (same UX as VO₂/Heart) */}
      {showCal && (
        <div
          onClick={() => setShowCal(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>
            <PopupCalendar onChange={handleCalendarChange} onClose={() => setShowCal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
