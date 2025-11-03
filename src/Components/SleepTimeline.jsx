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

function formatRow(e) {
  return {
    time: moment(e.time).valueOf(),
    displayTime: moment(e.time).format("h:mm a"),
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
 *  - userId?: string
 *  - data?: [{time, stage}]   // optional; otherwise pass your real feed
 *  - height?: number (px)     // default 300
 */
export default function SleepTimeline({ userId, data = [], height = 300 }) {
  const [showCal, setShowCal] = useState(false);
  const [range, setRange] = useState(null); // { startDate, endDate }

  const all = useMemo(() => data.map(formatRow).sort((a,b)=>a.time-b.time), [data]);
  const filtered = useMemo(() => {
    if (!range) return all;
    const s = range.startDate.getTime(), e = range.endDate.getTime();
    return all.filter(p => p.time >= s && p.time <= e);
  }, [all, range]);

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
    <div className="tw-text-white tw-space-y-2">
      {/* header */}
      <div className="tw-flex tw-items-center tw-justify-between">
        <h2 className="tw-m-0">Sleep Stages</h2>
        <div className="tw-flex tw-items-center tw-gap-2">
          {range && (
            <span className="tw-text-xs tw-opacity-80">
              {moment(range.startDate).format("YYYY-MM-DD")} → {moment(range.endDate).format("YYYY-MM-DD")}
              <button onClick={() => setRange(null)} className="tw-ml-2 tw-underline">clear</button>
            </span>
          )}
          <button
            onClick={() => setShowCal(true)}
            className="tw-border tw-border-gray-500 tw-rounded-full tw-px-3 tw-py-1"
          >
            🗓️ Range
          </button>
        </div>
      </div>

      {/* quick summary */}
      <div className="tw-flex tw-gap-3 tw-flex-wrap">
        {[1,2,3,4].map(k => (
          <div key={k} className="tw-bg-gray-900/60 tw-border tw-border-gray-800 tw-rounded tw-px-2 tw-py-1">
            <div className="tw-text-xs tw-opacity-80">{stageMap[k].label}</div>
            <div className="tw-font-bold">{Math.round(stageDurations[k] || 0)} min</div>
          </div>
        ))}
      </div>

      {/* chart (fills fixed height) */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filtered} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(t) => moment(t).format("h:mm a")}
              tick={{ fill: "#ffffff" }}
              stroke="#FFFFFF1A"
            />
            <YAxis
              type="number"
              domain={[1, 4]}
              ticks={[1, 2, 3, 4]}
              tickFormatter={(v) => stageMap[v]?.label ?? v}
              tick={{ fill: "#ffffff" }}
              stroke="#FFFFFF1A"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="stage"
              stroke="#8ecae6"
              strokeWidth={4}
              strokeLinecap="round"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showCal && (
        <div
          onClick={() => setShowCal(false)}
          className="tw-fixed tw-inset-0 tw-bg-black/40 tw-grid tw-place-items-center tw-z-50"
        >
          <div onClick={(e) => e.stopPropagation()} className="tw-shadow-2xl">
            <PopupCalendar onChange={handleCalendarChange} onClose={() => setShowCal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
