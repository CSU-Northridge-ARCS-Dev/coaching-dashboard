// SleepTimeline.jsx
import React, { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import moment from "moment";
import PopupCalendar from "./DatePicker/PopupCalendar";

// display + color map
const stageMap = {
  1: { label: "Awake", color: "#FF4D4F" },
  2: { label: "REM",   color: "#ADD8E6" },
  3: { label: "Light", color: "#6495ED" },
  4: { label: "Deep",  color: "#00008B" },
};

// map stages to a flipped numeric band: top=3 .. bottom=0
const STAGE_TO_Y = { 1: 3, 2: 2, 3: 1, 4: 0 };         // Awake=3, REM=2, Light=1, Deep=0
const Y_TICKS     = [0, 1, 2, 3];                      // bottom→top
const Y_TO_LABEL  = { 0: "Deep", 1: "Light", 2: "REM", 3: "Awake" };

// ---- demo default
const rawData = [
  { time: '2025-05-21T21:00:00.000Z', stage: 1 },
  { time: '2025-05-21T21:34:00.000Z', stage: 2 },
  { time: '2025-05-21T22:00:00.000Z', stage: 3 },
  { time: '2025-05-21T22:30:00.000Z', stage: 3 },
  { time: '2025-05-21T22:55:00.000Z', stage: 2 },
  { time: '2025-05-21T23:20:00.000Z', stage: 4 },
  { time: '2025-05-21T23:45:00.000Z', stage: 2 },
  { time: '2025-05-22T00:15:00.000Z', stage: 3 },
  { time: '2025-05-22T00:45:00.000Z', stage: 3 },
  { time: '2025-05-22T01:10:00.000Z', stage: 2 },
  { time: '2025-05-22T01:40:00.000Z', stage: 2 },
  { time: '2025-05-22T02:00:00.000Z', stage: 4 },
  { time: '2025-05-22T02:25:00.000Z', stage: 2 },
  { time: '2025-05-22T02:50:00.000Z', stage: 3 },
  { time: '2025-05-22T03:15:00.000Z', stage: 3 },
  { time: '2025-05-22T03:40:00.000Z', stage: 2 },
  { time: '2025-05-22T04:05:00.000Z', stage: 4 },
  { time: '2025-05-22T04:35:00.000Z', stage: 2 },
  { time: '2025-05-22T04:55:00.000Z', stage: 3 },
  { time: '2025-05-22T05:15:00.000Z', stage: 3 },
  { time: '2025-05-22T05:35:00.000Z', stage: 2 },
  { time: '2025-05-22T05:50:00.000Z', stage: 4 },
  { time: '2025-05-22T06:05:00.000Z', stage: 4 },
  { time: '2025-05-22T06:30:00.000Z', stage: 2 },
  { time: '2025-05-22T06:45:00.000Z', stage: 1 },
  { time: '2025-05-22T07:00:00.000Z', stage: 2 },
  { time: '2025-05-22T07:15:00.000Z', stage: 1 },
];

const data = rawData.map(e => ({
  time: moment(e.time).valueOf(),
  displayTime: moment(e.time).format("h:mm a"),
  stage: e.stage,
  y: STAGE_TO_Y[e.stage],
}));

// helpers
function toPoint(e) {
  const t = moment(e.time);
  return {
    time: t.valueOf(),
    displayTime: t.format("h:mm a"),
    stage: e.stage,
    y: STAGE_TO_Y[e.stage],
  };
}

// expand server intervals [{startTime,endTime,stage}] to step points
function expandIntervalsToPoints(intervals) {
  const pts = [];
  for (const row of intervals) {
    const s = moment(row.startTime || row.start);
    const e = moment(row.endTime || row.end);
    if (!s.isValid() || !e.isValid()) continue;
    const stage = Number(row.stage);
    const y = STAGE_TO_Y[stage];

    // start + end to make horizontal step
    pts.push({ time: +s, displayTime: s.format("h:mm a"), stage, y });
    pts.push({ time: +e, displayTime: e.format("h:mm a"), stage, y });
  }
  pts.sort((a,b)=>a.time-b.time);
  // dedupe same timestamps (keep last)
  const out = [];
  let last = null;
  for (const p of pts) {
    if (p.time === last) out[out.length-1] = p; else { out.push(p); last = p.time; }
  }
  return out;
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{ background: "#000", color: "#fff", padding: 8, borderRadius: 6 }}>
        {stageMap[d.stage]?.label ?? d.stage} · {d.displayTime}
      </div>
    );
  }
  return null;
};

/**
 * Props:
 *  - data?: server sleep intervals OR points
 *  - height?: number
 *  - onRangeChange?: ({startDate,endDate})
 */
export default function SleepTimeline({ data: external = [], height = 300, onRangeChange }) {
  const [showCal, setShowCal] = useState(false);
  const [range, setRange] = useState(null);

  const externalPoints = useMemo(() => {
    if (!external?.length) return [];
    const looksInterval = external[0]?.startTime || external[0]?.start;
    return looksInterval ? expandIntervalsToPoints(external) : external.map(toPoint);
  }, [external]);

  const filtered = useMemo(() => {
    if (!range) return externalPoints;
    const s = range.startDate.getTime();
    const e = range.endDate.getTime();
    return externalPoints.filter(p => p.time >= s && p.time <= e);
  }, [externalPoints, range]);

  const datasetForChart = range ? filtered : data;

  // minutes per stage (visible series)
  const stageDurations = useMemo(() => {
    const src = datasetForChart;
    const acc = {};
    for (let i = 0; i < src.length - 1; i++) {
      const mins = (src[i + 1].time - src[i].time) / 60000;
      acc[src[i].stage] = (acc[src[i].stage] || 0) + Math.max(0, mins);
    }
    return acc;
  }, [datasetForChart]);

  function handleCalendarChange({ startDate, endDate }) {
    setRange({ startDate, endDate });
    onRangeChange?.({ startDate, endDate });
    setShowCal(false);
  }

  return (
    <div style={{ background: "#0f0f0f", padding: 20, borderRadius: 10, color: "white", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Sleep Stages</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {range && (
            <span style={{ opacity: 0.8, fontSize: 12 }}>
              {moment(range.startDate).format("YYYY-MM-DD")} → {moment(range.endDate).format("YYYY-MM-DD")}
              <button onClick={() => setRange(null)} style={{ marginLeft: 8, textDecoration: "underline", background: "transparent", color: "#fff" }}>
                clear
              </button>
            </span>
          )}
          <button onClick={() => setShowCal(true)} style={{ border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 18, padding: "6px 10px" }}>
            🗓️ Range
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        {[1,2,3,4].map(k => (
          <div key={k} style={{ background: "#141414", border: "1px solid #222", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{stageMap[k].label}</div>
            <div style={{ fontWeight: 700 }}>{Math.round(stageDurations[k] || 0)} min</div>
          </div>
        ))}
      </div>

      <div style={{ height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datasetForChart} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
            <defs>
              {/* top (Awake/red) -> bottom (Deep/blue) */}
              <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
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
              tickFormatter={(t)=>moment(t).format("h:mm a")}
              tick={{ fill: "white" }}
            />

            {/* Flipped scale via numeric remap: Deep=0 ... Awake=3 */}
            <YAxis
              type="number"
              domain={[0, 3]}
              ticks={Y_TICKS}
              tickFormatter={(v)=>Y_TO_LABEL[v] ?? ""}
              tick={{ fill: "white" }}
            />

            <Tooltip content={<CustomTooltip/>}/>

            <Line
              type="stepAfter"
              dataKey="y"                      
              stroke="url(#sleepGradient)"
              strokeWidth={4}
              strokeLinecap="round"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showCal && (
        <div onClick={() => setShowCal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>
            <PopupCalendar onChange={handleCalendarChange} onClose={() => setShowCal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}






















// // SleepTimeline.jsx
// import React, { useMemo, useState } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
// } from "recharts";
// import moment from "moment";
// import PopupCalendar from "./DatePicker/PopupCalendar";

// // display + color map (Awake/REM/Light/Deep)
// const stageMap = {
//   1: { label: "Awake", color: "#FF4D4F" },
//   2: { label: "REM",   color: "#ADD8E6" },
//   3: { label: "Light", color: "#6495ED" },
//   4: { label: "Deep",  color: "#00008B" },
// };

// // ---- demo default
// const rawData = [
//   { time: '2025-05-21T21:34:00.000Z', stage: 2 },
//   { time: '2025-05-21T22:00:00.000Z', stage: 3 },
//   { time: '2025-05-21T22:30:00.000Z', stage: 3 },
//   { time: '2025-05-21T22:55:00.000Z', stage: 2 },
//   { time: '2025-05-21T23:20:00.000Z', stage: 4 },
//   { time: '2025-05-21T23:45:00.000Z', stage: 2 },
//   { time: '2025-05-22T00:15:00.000Z', stage: 3 },
//   { time: '2025-05-22T00:45:00.000Z', stage: 3 },
//   { time: '2025-05-22T01:10:00.000Z', stage: 2 },
//   { time: '2025-05-22T01:40:00.000Z', stage: 2 },
//   { time: '2025-05-22T02:00:00.000Z', stage: 4 },
//   { time: '2025-05-22T02:25:00.000Z', stage: 2 },
//   { time: '2025-05-22T02:50:00.000Z', stage: 3 },
//   { time: '2025-05-22T03:15:00.000Z', stage: 3 },
//   { time: '2025-05-22T03:40:00.000Z', stage: 2 },
//   { time: '2025-05-22T04:05:00.000Z', stage: 4 },
//   { time: '2025-05-22T04:35:00.000Z', stage: 2 },
//   { time: '2025-05-22T04:55:00.000Z', stage: 3 },
//   { time: '2025-05-22T05:15:00.000Z', stage: 3 },
//   { time: '2025-05-22T05:35:00.000Z', stage: 2 },
//   { time: '2025-05-22T05:50:00.000Z', stage: 4 },
//   { time: '2025-05-22T06:05:00.000Z', stage: 4 },
//   { time: '2025-05-22T06:30:00.000Z', stage: 2 },
//   { time: '2025-05-22T06:45:00.000Z', stage: 1 },
//   { time: '2025-05-22T07:00:00.000Z', stage: 2 },
//   { time: '2025-05-22T07:15:00.000Z', stage: 1 }
// ];

// const data = rawData.map(e => ({
//   time: moment(e.time).valueOf(),
//   displayTime: moment(e.time).format("h:mm a"),
//   stage: e.stage,
// }));

// function toPoint(e) {
//   return {
//     time: moment(e.time).valueOf(),
//     displayTime: moment(e.time).format("h:mm a"),
//     stage: e.stage,
//   };
// }

// // expand server intervals [{startTime,endTime,stage}] to step points
// function expandIntervalsToPoints(intervals) {
//   const pts = [];
//   for (const row of intervals) {
//     const s = moment(row.startTime || row.start);
//     const e = moment(row.endTime || row.end);
//     if (!s.isValid() || !e.isValid()) continue;
//     pts.push({ time: +s, displayTime: s.format("h:mm a"), stage: Number(row.stage) });
//     pts.push({ time: +e, displayTime: e.format("h:mm a"), stage: Number(row.stage) });
//   }
//   pts.sort((a,b)=>a.time-b.time);
//   const out = [];
//   let lastT = null;
//   for (const p of pts) {
//     if (p.time === lastT) out[out.length-1] = p;
//     else { out.push(p); lastT = p.time; }
//   }
//   return out;
// }

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const d = payload[0].payload;
//     return (
//       <div style={{ background: "#000", color: "#fff", padding: 8, borderRadius: 6 }}>
//         {stageMap[d.stage]?.label ?? d.stage} · {d.displayTime}
//       </div>
//     );
//   }
//   return null;
// };

// export default function SleepTimeline({ data: external = [], height = 300, onRangeChange }) {
//   const [showCal, setShowCal] = useState(false);
//   const [range, setRange] = useState(null); // { startDate, endDate }

//   // detect if external are intervals; normalize to points
//   const externalPoints = useMemo(() => {
//     if (!external?.length) return [];
//     const looksInterval = external[0]?.startTime || external[0]?.start;
//     return looksInterval ? expandIntervalsToPoints(external) : external.map(toPoint);
//   }, [external]);

//   const filtered = useMemo(() => {
//     if (!range) return externalPoints;
//     const s = range.startDate.getTime();
//     const e = range.endDate.getTime();
//     return externalPoints.filter(p => p.time >= s && p.time <= e);
//   }, [externalPoints, range]);

//   const datasetForChart = range ? filtered : data;

//   // minutes per stage (use whichever series is on screen)
//   const stageDurations = useMemo(() => {
//     const src = datasetForChart;
//     const acc = {};
//     for (let i = 0; i < src.length - 1; i++) {
//       const mins = (src[i + 1].time - src[i].time) / 60000;
//       acc[src[i].stage] = (acc[src[i].stage] || 0) + Math.max(0, mins);
//     }
//     return acc;
//   }, [datasetForChart]);

//   function handleCalendarChange({ startDate, endDate }) {
//     setRange({ startDate, endDate });
//     onRangeChange?.({ startDate, endDate });
//     setShowCal(false);
//   }

//   return (
//     <div style={{ background: "#0f0f0f", padding: 20, borderRadius: 10, color: "white", position: "relative" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
//         <h2 style={{ margin: 0 }}>Sleep Stages</h2>
//         <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//           {range && (
//             <span style={{ opacity: 0.8, fontSize: 12 }}>
//               {moment(range.startDate).format("YYYY-MM-DD")} → {moment(range.endDate).format("YYYY-MM-DD")}
//               <button onClick={() => setRange(null)} style={{ marginLeft: 8, textDecoration: "underline", background: "transparent", color: "#fff" }}>
//                 clear
//               </button>
//             </span>
//           )}
//           <button onClick={() => setShowCal(true)} style={{ border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 18, padding: "6px 10px" }}>
//             🗓️ Range
//           </button>
//         </div>
//       </div>

//       <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
//         {[1,2,3,4].map(k => (
//           <div key={k} style={{ background: "#141414", border: "1px solid #222", borderRadius: 8, padding: "6px 10px" }}>
//             <div style={{ fontSize: 12, opacity: 0.8 }}>{stageMap[k].label}</div>
//             <div style={{ fontWeight: 700 }}>{Math.round(stageDurations[k] || 0)} min</div>
//           </div>
//         ))}
//       </div>

//       <div style={{ height, width: "100%" }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={datasetForChart} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
//             <defs>
//               {/* top (Awake/red) -> bottom (Deep/blue) */}
//               <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%"   stopColor={stageMap[1].color} />
//                 <stop offset="33%"  stopColor={stageMap[2].color} />
//                 <stop offset="66%"  stopColor={stageMap[3].color} />
//                 <stop offset="100%" stopColor={stageMap[4].color} />
//               </linearGradient>
//             </defs>

//             <XAxis
//               dataKey="time"
//               type="number"
//               domain={["dataMin", "dataMax"]}
//               tickFormatter={(t)=>moment(t).format("h:mm a")}
//               tick={{ fill: "white" }}
//             />
//             {/* FLIPPED Y-AXIS: higher stage number at bottom */}
//             <YAxis
//               type="number"
//               domain={[4, 1]}                  // <= flip!
//               ticks={[1, 2, 3, 4].reverse()}   // [4,3,2,1]
//               tickFormatter={(v)=>stageMap[v]?.label ?? v}
//               tick={{ fill: "white" }}
//             />
//             <Tooltip content={<CustomTooltip/>}/>
//             <Line
//               type="stepAfter"                  // looks better for stages; ok to change to "monotone" if you want
//               dataKey="stage"
//               stroke="url(#sleepGradient)"
//               strokeWidth={4}
//               strokeLinecap="round"
//               dot={false}
//               isAnimationActive={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {showCal && (
//         <div onClick={() => setShowCal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", zIndex: 50 }}>
//           <div onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>
//             <PopupCalendar onChange={handleCalendarChange} onClose={() => setShowCal(false)} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

























// // SleepTimeline.jsx
// import React, { useMemo, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import moment from "moment";
// import PopupCalendar from "./DatePicker/PopupCalendar";

// // display + color map (Awake/REM/Core/Deep)
// const stageMap = {
//   1: { label: "Awake", color: "#FF4D4F" },
//   2: { label: "REM",   color: "#ADD8E6" },
//   3: { label: "Core",  color: "#6495ED" },
//   4: { label: "Deep",  color: "#00008B" },
// };

// // fixed Y-band centers
// const STAGE_TO_BAND = { 
//   4: 50,   // Deep
//   3: 100,  // Core
//   2: 150,  // REM
//   1: 200,  // Awake
// };
// const BAND_TO_LABEL = {
//   50: "Deep",
//   100: "Core",
//   150: "REM",
//   200: "Awake",
// };

// // ---- fallback demo data ----
// const rawData = [
//   { time: "2025-05-21T21:34:00.000Z", stage: 2 },
//   { time: "2025-05-21T22:00:00.000Z", stage: 3 },
//   { time: "2025-05-21T22:30:00.000Z", stage: 3 },
//   { time: "2025-05-21T22:55:00.000Z", stage: 2 },
//   { time: "2025-05-21T23:20:00.000Z", stage: 4 },
//   { time: "2025-05-21T23:45:00.000Z", stage: 2 },
//   { time: "2025-05-22T00:15:00.000Z", stage: 3 },
//   { time: "2025-05-22T00:45:00.000Z", stage: 3 },
//   { time: "2025-05-22T01:10:00.000Z", stage: 2 },
//   { time: "2025-05-22T01:40:00.000Z", stage: 2 },
//   { time: "2025-05-22T02:00:00.000Z", stage: 4 },
//   { time: "2025-05-22T02:25:00.000Z", stage: 2 },
//   { time: "2025-05-22T02:50:00.000Z", stage: 3 },
//   { time: "2025-05-22T03:15:00.000Z", stage: 3 },
//   { time: "2025-05-22T03:40:00.000Z", stage: 2 },
//   { time: "2025-05-22T04:05:00.000Z", stage: 4 },
//   { time: "2025-05-22T04:35:00.000Z", stage: 2 },
//   { time: "2025-05-22T04:55:00.000Z", stage: 3 },
//   { time: "2025-05-22T05:15:00.000Z", stage: 3 },
//   { time: "2025-05-22T05:35:00.000Z", stage: 2 },
//   { time: "2025-05-22T05:50:00.000Z", stage: 4 },
//   { time: "2025-05-22T06:05:00.000Z", stage: 4 },
//   { time: "2025-05-22T06:30:00.000Z", stage: 2 },
//   { time: "2025-05-22T06:45:00.000Z", stage: 1 },
//   { time: "2025-05-22T07:00:00.000Z", stage: 2 },
//   { time: "2025-05-22T07:15:00.000Z", stage: 1 },
// ];

// const demoPoints = rawData.map(e => ({
//   time: moment(e.time).valueOf(),
//   displayTime: moment(e.time).format("h:mm a"),
//   stage: e.stage,
//   yBand: STAGE_TO_BAND[e.stage],
// }));

// function toPoint(e) {
//   const t = moment(e.time);
//   return {
//     time: t.valueOf(),
//     displayTime: t.format("h:mm a"),
//     stage: e.stage,
//     yBand: STAGE_TO_BAND[e.stage],
//   };
// }

// function expandIntervalsToPoints(intervals) {
//   const pts = [];
//   for (const row of intervals) {
//     const s = moment(row.startTime || row.start);
//     const e = moment(row.endTime || row.end);
//     if (!s.isValid() || !e.isValid()) continue;
//     const stage = Number(row.stage);
//     const yBand = STAGE_TO_BAND[stage];

//     pts.push({ time:+s, displayTime:s.format("h:mm a"), stage, yBand });
//     pts.push({ time:+e, displayTime:e.format("h:mm a"), stage, yBand });
//   }
//   pts.sort((a,b)=>a.time-b.time);
//   return pts;
// }

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const d = payload[0].payload;
//     return (
//       <div style={{background:"#000",color:"#fff",padding:8,borderRadius:6,fontSize:12}}>
//         {stageMap[d.stage]?.label} · {d.displayTime}
//       </div>
//     );
//   }
//   return null;
// };

// export default function SleepTimeline({ data:external=[], height=300, onRangeChange }) {
//   const [showCal,setShowCal]=useState(false);
//   const [range, setRange] = useState(null);

//   const externalPoints=useMemo(()=>{
//     if (!external?.length) return [];
//     const looksInterval=external[0]?.startTime || external[0]?.start;
//     return looksInterval ? expandIntervalsToPoints(external) : external.map(toPoint);
//   },[external]);

//   const filtered=useMemo(()=>{
//     if(!range) return externalPoints;
//     const s=range.startDate.getTime(), e=range.endDate.getTime();
//     return externalPoints.filter(p=>p.time>=s && p.time<=e);
//   },[externalPoints,range]);

//   const datasetForChart = useMemo(()=>{
//     const base = range ? filtered : (externalPoints.length? externalPoints : demoPoints);
//     return base.map(p=>({...p,yBand:p.yBand})).filter(p=>p.yBand!=null);
//   },[range,filtered,externalPoints]);

//   const stageDurations=useMemo(()=>{
//     const src=datasetForChart, acc={};
//     for(let i=0;i<src.length-1;i++){
//       const mins=(src[i+1].time-src[i].time)/60000;
//       acc[src[i].stage]=(acc[src[i].stage]||0)+Math.max(0,mins);
//     }
//     return acc;
//   },[datasetForChart]);

//   return (
//     <div style={{background:"#0f0f0f",padding:20,borderRadius:10,color:"white",position:"relative"}}>
//       <h2 style={{margin:0}}>Sleep Stages</h2>

//       <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:8,marginTop:8}}>
//         {[1,2,3,4].map(k=>(
//           <div key={k} style={{background:"#141414",border:"1px solid #222",borderRadius:8,padding:"6px 10px"}}>
//             <div style={{fontSize:12,opacity:0.8}}>{stageMap[k].label}</div>
//             <div style={{fontWeight:700}}>{Math.round(stageDurations[k]||0)} min</div>
//           </div>
//         ))}
//       </div>

//       <div style={{height,width:"100%"}}>
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={datasetForChart} margin={{top:10,right:30,left:10,bottom:40}}>

//             <defs>
//               <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%"   stopColor={stageMap[1].color} />
//                 <stop offset="33%"  stopColor={stageMap[2].color} />
//                 <stop offset="66%"  stopColor={stageMap[3].color} />
//                 <stop offset="100%" stopColor={stageMap[4].color} />
//               </linearGradient>
//             </defs>

//             <XAxis
//               dataKey="time"
//               type="number"
//               domain={["dataMin","dataMax"]}
//               tickFormatter={t=>moment(t).format("h:mm a")}
//               tick={{fill:"white"}}
//             />
//             <YAxis
//               type="number"
//               domain={[0,200]}
//               ticks={[50,100,150,200]}
//               tickFormatter={v=>BAND_TO_LABEL[v]??""}
//               tick={{fill:"white"}}
//             />
//             <Tooltip content={<CustomTooltip/>}/>

//             <Line
//               type="stepAfter"
//               dataKey="yBand"
//               stroke="url(#sleepGradient)"
//               strokeWidth={4}
//               strokeLinecap="round"
//               dot={false}
//               isAnimationActive={false}
//               connectNulls
//             />

//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {showCal && (
//         <div onClick={()=>setShowCal(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",display:"grid",placeItems:"center",zIndex:50}}>
//           <div onClick={e=>e.stopPropagation()} style={{boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
//             <PopupCalendar
//               onChange={({startDate,endDate})=>{setRange({startDate,endDate});onRangeChange?.({startDate,endDate});}}
//               onClose={()=>setShowCal(false)}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }











// SleepTimeline.jsx
// import React, { useMemo, useState } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
// } from "recharts";
// import moment from "moment";
// import PopupCalendar from "./DatePicker/PopupCalendar";

// // const stageMap = {
// //   1: { label: "Deep",  color: "#00008B" },
// //   2: { label: "Light", color: "#6495ED" },
// //   3: { label: "REM",   color: "#ADD8E6" },
// //   4: { label: "Awake", color: "#FF4D4F" },
// // };
// const stageMap = {
//   1: { label: "Awake", color: "#FF4D4F" },
//   2: { label: "REM",   color: "#ADD8E6" },
//   3: { label: "Light", color: "#6495ED" },
//   4: { label: "Deep",  color: "#00008B" },
// };

// // ---- your demo default 
// const rawData = [
//   { time: '2025-05-21T21:34:00.000Z', stage: 2 }, // falling asleep
//   { time: '2025-05-21T22:00:00.000Z', stage: 3 },
//   { time: '2025-05-21T22:30:00.000Z', stage: 3 },
//   { time: '2025-05-21T22:55:00.000Z', stage: 2 },
//   { time: '2025-05-21T23:20:00.000Z', stage: 4 }, // first REM (short)
//   { time: '2025-05-21T23:45:00.000Z', stage: 2 },
//   { time: '2025-05-22T00:15:00.000Z', stage: 3 },
//   { time: '2025-05-22T00:45:00.000Z', stage: 3 },
//   { time: '2025-05-22T01:10:00.000Z', stage: 2 },
//   { time: '2025-05-22T01:40:00.000Z', stage: 2 },
//   { time: '2025-05-22T02:00:00.000Z', stage: 4 }, // REM period gets longer
//   { time: '2025-05-22T02:25:00.000Z', stage: 2 },
//   { time: '2025-05-22T02:50:00.000Z', stage: 3 },
//   { time: '2025-05-22T03:15:00.000Z', stage: 3 },
//   { time: '2025-05-22T03:40:00.000Z', stage: 2 },
//   { time: '2025-05-22T04:05:00.000Z', stage: 4 }, // REM again
//   { time: '2025-05-22T04:35:00.000Z', stage: 2 },
//   { time: '2025-05-22T04:55:00.000Z', stage: 3 },
//   { time: '2025-05-22T05:15:00.000Z', stage: 3 },
//   { time: '2025-05-22T05:35:00.000Z', stage: 2 },
//   { time: '2025-05-22T05:50:00.000Z', stage: 4 },
//   { time: '2025-05-22T06:05:00.000Z', stage: 4 }, // late REM usually longest
//   { time: '2025-05-22T06:30:00.000Z', stage: 2 },
//   { time: '2025-05-22T06:45:00.000Z', stage: 1 }, // brief morning wake
//   { time: '2025-05-22T07:00:00.000Z', stage: 2 }, // dozing
//   { time: '2025-05-22T07:15:00.000Z', stage: 1 }  // final wake
// ];

// const data = rawData.map(e => ({
//   time: moment(e.time).valueOf(),
//   displayTime: moment(e.time).format("h:mm a"),
//   stage: e.stage,
// }));

// // ---- helpers ----
// function toPoint(e) {
//   return {
//     time: moment(e.time).valueOf(),
//     displayTime: moment(e.time).format("h:mm a"),
//     stage: e.stage,
//   };
// }

// // expand server intervals [{startTime,endTime,stage}] to step points
// function expandIntervalsToPoints(intervals) {
//   const pts = [];
//   for (const row of intervals) {
//     const s = moment(row.startTime || row.start);
//     const e = moment(row.endTime || row.end);
//     if (!s.isValid() || !e.isValid()) continue;

//     // start step
//     pts.push({ time: +s, displayTime: s.format("h:mm a"), stage: Number(row.stage) });
//     // end step (duplicate stage keeps horizontal segment)
//     pts.push({ time: +e, displayTime: e.format("h:mm a"), stage: Number(row.stage) });
//   }
//   // sort & de-dup times (keep last for ties)
//   pts.sort((a,b)=>a.time-b.time);
//   const out = [];
//   let lastT = null;
//   for (const p of pts) {
//     if (p.time === lastT) out[out.length-1] = p;
//     else { out.push(p); lastT = p.time; }
//   }
//   return out;
// }

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const d = payload[0].payload;
//     return (
//       <div style={{ background: "#000", color: "#fff", padding: 8, borderRadius: 6 }}>
//         {stageMap[d.stage]?.label ?? d.stage} · {d.displayTime}
//       </div>
//     );
//   }
//   return null;
// };

// /**
//  * Props:
//  *  - data?: server sleep intervals OR points
//  *  - height?: number
//  *  - onRangeChange?: ({startDate,endDate}) => void   // passed from parent
//  */
// export default function SleepTimeline({ data: external = [], height = 300, onRangeChange }) {
//   const [showCal, setShowCal] = useState(false);
//   const [range, setRange] = useState(null); // { startDate, endDate }

//   // detect if external are intervals; normalize to points
//   const externalPoints = useMemo(() => {
//     if (!external?.length) return [];
//     const looksInterval = external[0]?.startTime || external[0]?.start;
//     return looksInterval ? expandIntervalsToPoints(external) : external.map(toPoint);
//   }, [external]);

//   // filter only when range exists
//   const filtered = useMemo(() => {
//     if (!range) return externalPoints;
//     const s = range.startDate.getTime();
//     const e = range.endDate.getTime();
//     return externalPoints.filter(p => p.time >= s && p.time <= e);
//   }, [externalPoints, range]);

//   // choose dataset: your default demo `data` until a range is set
//   const datasetForChart = range ? filtered : data;

//   // minutes per stage (use whichever series is on screen)
//   const stageDurations = useMemo(() => {
//     const src = datasetForChart;
//     const acc = {};
//     for (let i = 0; i < src.length - 1; i++) {
//       const mins = (src[i + 1].time - src[i].time) / 60000;
//       acc[src[i].stage] = (acc[src[i].stage] || 0) + Math.max(0, mins);
//     }
//     return acc;
//   }, [datasetForChart]);

//   function handleCalendarChange({ startDate, endDate }) {
//     setRange({ startDate, endDate });
//     onRangeChange?.({ startDate, endDate });
//     setShowCal(false);
//   }

//   return (
//     <div style={{ background: "#0f0f0f", padding: 20, borderRadius: 10, color: "white", position: "relative" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
//         <h2 style={{ margin: 0 }}>Sleep Stages</h2>
//         <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//           {range && (
//             <span style={{ opacity: 0.8, fontSize: 12 }}>
//               {moment(range.startDate).format("YYYY-MM-DD")} → {moment(range.endDate).format("YYYY-MM-DD")}
//               <button onClick={() => setRange(null)} style={{ marginLeft: 8, textDecoration: "underline", background: "transparent", color: "#fff" }}>
//                 clear
//               </button>
//             </span>
//           )}
//           <button onClick={() => setShowCal(true)} style={{ border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 18, padding: "6px 10px" }}>
//             🗓️ Range
//           </button>
//         </div>
//       </div>

//       <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
//         {[1,2,3,4].map(k => (
//           <div key={k} style={{ background: "#141414", border: "1px solid #222", borderRadius: 8, padding: "6px 10px" }}>
//             <div style={{ fontSize: 12, opacity: 0.8 }}>{stageMap[k].label}</div>
//             <div style={{ fontWeight: 700 }}>{Math.round(stageDurations[k] || 0)} min</div>
//           </div>
//         ))}
//       </div>

//       <div style={{ height, width: "100%" }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={datasetForChart} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
//             <defs>
//               <linearGradient id="sleepGradient" x1="0" y1="1" x2="0" y2="0">
//                 <stop offset="0%"   stopColor={stageMap[1].color} />
//                 <stop offset="33%"  stopColor={stageMap[2].color} />
//                 <stop offset="66%"  stopColor={stageMap[3].color} />
//                 <stop offset="100%" stopColor={stageMap[4].color} />
//               </linearGradient>
//             </defs>
//             <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} tickFormatter={(t)=>moment(t).format("h:mm a")} tick={{ fill: "white" }}/>
//             <YAxis type="number" domain={[1,4]} ticks={[1,2,3,4]} tickFormatter={(v)=>stageMap[v]?.label ?? v} tick={{ fill: "white" }}/>
//             <Tooltip content={<CustomTooltip/>}/>
//             <Line type="monotone" dataKey="stage" stroke="url(#sleepGradient)" strokeWidth={4} strokeLinecap="round" dot={false} isAnimationActive={false}/>
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {showCal && (
//         <div onClick={() => setShowCal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", zIndex: 50 }}>
//           <div onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>
//             <PopupCalendar onChange={handleCalendarChange} onClose={() => setShowCal(false)} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


























// import React, { useMemo, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import moment from "moment";
// import PopupCalendar from "./DatePicker/PopupCalendar";

// const stageMap = {
//   1: { label: "Deep",  color: "#00008B" },
//   2: { label: "Light", color: "#6495ED" },
//   3: { label: "REM",   color: "#ADD8E6" },
//   4: { label: "Awake", color: "#FF4D4F" },
// };

// // demo data — replace with your real feed if needed
// const rawData = [
//   { time: '2025-05-21T21:34:00.000Z', stage: 2 }, // falling asleep
//   { time: '2025-05-21T22:00:00.000Z', stage: 3 },
//   { time: '2025-05-21T22:30:00.000Z', stage: 3 },
//   { time: '2025-05-21T22:55:00.000Z', stage: 2 },
//   { time: '2025-05-21T23:20:00.000Z', stage: 4 }, // first REM (short)
//   { time: '2025-05-21T23:45:00.000Z', stage: 2 },
//   { time: '2025-05-22T00:15:00.000Z', stage: 3 },
//   { time: '2025-05-22T00:45:00.000Z', stage: 3 },
//   { time: '2025-05-22T01:10:00.000Z', stage: 2 },
//   { time: '2025-05-22T01:40:00.000Z', stage: 2 },
//   { time: '2025-05-22T02:00:00.000Z', stage: 4 }, // REM period gets longer
//   { time: '2025-05-22T02:25:00.000Z', stage: 2 },
//   { time: '2025-05-22T02:50:00.000Z', stage: 3 },
//   { time: '2025-05-22T03:15:00.000Z', stage: 3 },
//   { time: '2025-05-22T03:40:00.000Z', stage: 2 },
//   { time: '2025-05-22T04:05:00.000Z', stage: 4 }, // REM again
//   { time: '2025-05-22T04:35:00.000Z', stage: 2 },
//   { time: '2025-05-22T04:55:00.000Z', stage: 3 },
//   { time: '2025-05-22T05:15:00.000Z', stage: 3 },
//   { time: '2025-05-22T05:35:00.000Z', stage: 2 },
//   { time: '2025-05-22T05:50:00.000Z', stage: 4 },
//   { time: '2025-05-22T06:05:00.000Z', stage: 4 }, // late REM usually longest
//   { time: '2025-05-22T06:30:00.000Z', stage: 2 },
//   { time: '2025-05-22T06:45:00.000Z', stage: 1 }, // brief morning wake
//   { time: '2025-05-22T07:00:00.000Z', stage: 2 }, // dozing
//   { time: '2025-05-22T07:15:00.000Z', stage: 1 }  // final wake
// ];


// const data = rawData.map(e => ({
//   time: moment(e.time).valueOf(),
//   displayTime: moment(e.time).format('h:mm a'),
//   stage: e.stage,
// }));



// function formatRow(e) {
//   return {
//     time: moment(e.time).valueOf(),                 // numeric x
//     displayTime: moment(e.time).format("h:mm a"),   // tooltip
//     stage: e.stage,
//   };
// }

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const d = payload[0].payload;
//     return (
//       <div style={{ background: "#000", color: "#fff", padding: 8, borderRadius: 6 }}>
//         {stageMap[d.stage].label} · {d.displayTime}
//       </div>
//     );
//   }
//   return null;
// };








// /**
//  * Props:
//  *  - data?: [{time, stage}]  // optional external feed; defaults to rawData above
//  *  - height?: number         // px; default 300
//  */
// export default function SleepTimeline({ data: external = rawData, height = 300 }) {
//   // overlay calendar state
//   const [showCal, setShowCal] = useState(false);
//   const [range, setRange] = useState(null); // { startDate: Date, endDate: Date }

//   // normalize + (optionally) filter to range
//   const all = useMemo(() => external.map(formatRow).sort((a,b)=>a.time-b.time), [external]);
//   const filtered = useMemo(() => {
//     if (!range) return all;
//     const s = range.startDate.getTime(), e = range.endDate.getTime();
//     return all.filter(p => p.time >= s && p.time <= e);
//   }, [all, range]);

//     // 👇 default to your top-level `data`; switch to filtered only when range exists
//   const datasetForChart = range ? filtered : data;


//   // simple stage duration summary (unchanged)
//   const stageDurations = useMemo(() => {
//     const acc = {};
//     const src = filtered.length ? filtered : all;
//     for (let i = 0; i < src.length - 1; i++) {
//       const mins = (src[i + 1].time - src[i].time) / 60000;
//       acc[src[i].stage] = (acc[src[i].stage] || 0) + mins;
//     }
//     return acc;
//   }, [filtered, all]);

//   function handleCalendarChange({ startDate, endDate }) {
//     setRange({ startDate, endDate });
//   }

//   return (
//     <div
//       style={{
//         background: "#0f0f0f",
//         padding: 20,
//         borderRadius: 10,
//         color: "white",
//         position: "relative",       // allows the overlay to anchor here
//       }}
//     >
//       {/* header + Range button (VO2-style) */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
//         <h2 style={{ margin: 0 }}>Sleep Stages</h2>
//         <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//           {range && (
//             <span style={{ opacity: 0.8, fontSize: 12 }}>
//               {moment(range.startDate).format("YYYY-MM-DD")} → {moment(range.endDate).format("YYYY-MM-DD")}
//               <button
//                 onClick={() => setRange(null)}
//                 style={{ marginLeft: 8, textDecoration: "underline", background: "transparent", color: "#fff" }}
//               >
//                 clear
//               </button>
//             </span>
//           )}
//           <button
//             onClick={() => setShowCal(true)}
//             style={{ border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 18, padding: "6px 10px" }}
//           >
//             🗓️ Range
//           </button>
//         </div>
//       </div>

//       {/* summary blocks (keep light) */}
//       <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
//         {[1,2,3,4].map(k => (
//           <div key={k} style={{ background: "#141414", border: "1px solid #222", borderRadius: 8, padding: "6px 10px" }}>
//             <div style={{ fontSize: 12, opacity: 0.8 }}>{stageMap[k].label}</div>
//             <div style={{ fontWeight: 700 }}>{Math.round(stageDurations[k] || 0)} min</div>
//           </div>
//         ))}
//       </div>

//       {/* fixed-height chart container so it doesn't grow huge */}
//       <div style={{ height, width: "100%" }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={datasetForChart}
//             // data={filtered}
//             margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
//           >
//             <defs>
//               <linearGradient id="sleepGradient" x1="0" y1="1" x2="0" y2="0">
//                 <stop offset="0%"   stopColor={stageMap[1].color} />
//                 <stop offset="33%"  stopColor={stageMap[2].color} />
//                 <stop offset="66%"  stopColor={stageMap[3].color} />
//                 <stop offset="100%" stopColor={stageMap[4].color} />
//               </linearGradient>
//             </defs>

//             <XAxis
//               dataKey="time"
//               type="number"
//               domain={["dataMin", "dataMax"]}
//               tickFormatter={(t) => moment(t).format("h:mm a")}
//               tick={{ fill: "white" }}
//             />
//             <YAxis
//               type="number"
//               domain={[1, 4]}
//               ticks={[1, 2, 3, 4]}
//               tickFormatter={(v) => stageMap[v]?.label ?? v}
//               tick={{ fill: "white" }}
//             />
//             <Tooltip content={<CustomTooltip />} />
//             <Line
//               type="monotone"
//               dataKey="stage"
//               stroke="url(#sleepGradient)"
//               strokeWidth={4}
//               strokeLinecap="round"
//               dot={false}
//               isAnimationActive={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* simple overlay calendar (same UX as VO₂/Heart) */}
//       {showCal && (
//         <div
//           onClick={() => setShowCal(false)}
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: "rgba(0,0,0,0.35)",
//             display: "grid",
//             placeItems: "center",
//             zIndex: 50,
//           }}
//         >
//           <div onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>
//             <PopupCalendar onChange={handleCalendarChange} onClose={() => setShowCal(false)} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
