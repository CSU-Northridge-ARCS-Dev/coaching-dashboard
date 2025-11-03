import React, { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Decimation,
} from "chart.js";
import "chartjs-adapter-date-fns";
import HighlightZones from "chartjs-plugin-annotation";
import ZoomAndPan from "chartjs-plugin-zoom";
import PopupCalendar from "./DatePicker/PopupCalendar";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  HighlightZones,
  ZoomAndPan,
  Decimation
);

/**
 * Props:
 *  - heartRateData: [{ time, beatsPerMinute }]
 *  - onRangeChange?: ({startDate, endDate}) => void
 *  - height?: number  // px; default 300 like the old one
 */
export default function HeartGraph({ heartRateData = [], onRangeChange, height = 400 }) {
  const chartRef = useRef(null);
  const [smooth, setSmooth] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [dateRange, setDateRange] = useState(null); // { startDate, endDate }

  // normalize + sort
  const base = useMemo(() => {
    return heartRateData
      .map((e) => {
        const t = new Date(e.time);
        const ok = !isNaN(t.getTime()) && t.getFullYear() >= 2020 && t.getFullYear() <= 2035;
        return ok ? { x: t.getTime(), y: e.beatsPerMinute } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.x - b.x);
  }, [heartRateData]);

  // optional local range filter
  const points = useMemo(() => {
    if (!dateRange) return base;
    const s = dateRange.startDate.getTime();
    const e = dateRange.endDate.getTime();
    return base.filter((p) => p.x >= s && p.x <= e);
  }, [base, dateRange]);

  // y-axis bounds + zones
  const maxHR = points.reduce((m, p) => Math.max(m, p.y), 0);
  const yMaxAxis = Math.max(60, Math.ceil(maxHR / 10) * 10 || 100); // neat top line even if empty

  const dense = points.length > 400;
  const samples = Math.max(120, Math.min(600, Math.floor(points.length * 0.35)));

  const data = {
    datasets: [
      {
        label: "Heart Rate",
        data: points,
        parsing: false,
        normalized: true,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        pointStyle: "circle",
        pointRadius: smooth ? 0 : 3,
        pointHoverRadius: smooth ? 0 : 8,
        tension: smooth ? 0.35 : 0.0,
      },
      { label: "Peak Zone", data: [], borderColor: "rgba(250,101,133,.7)", backgroundColor: "rgba(250,101,133,.7)" },
      { label: "Cardio Zone", data: [], borderColor: "rgba(253,217,110,.7)", backgroundColor: "rgba(253,217,110,.7)" },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,       // <-- respect container height
    plugins: {
      title: { display: true, text: "Heart Rate Readings Over Time" },
      decimation: { enabled: smooth && dense, algorithm: "lttb", samples },
      annotation: {
        annotations: {
          peakZone: {
            type: "box",
            yMin: yMaxAxis * 0.85,
            yMax: yMaxAxis,
            backgroundColor: "rgba(250,101,133,.7)",
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },
          cardioZone: {
            type: "box",
            yMin: yMaxAxis * 0.7,
            yMax: yMaxAxis * 0.85,
            backgroundColor: "rgba(253,217,110,.7)",
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },
        },
      },
      tooltip: {
        callbacks: {
          title: () => null,
          label: (ctx) => {
            const t = new Date(ctx.parsed.x);
            const hhmm = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return `${ctx.parsed.y} BPM · ${hhmm}`;
          },
        },
      },
      zoom: {
        pan: { enabled: true, mode: "x", modifierKey: "ctrl" },
        zoom: { drag: { enabled: true, modifierKey: "shift" }, mode: "x" },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { tooltipFormat: "HH:mm", displayFormats: { hour: "HH:mm", minute: "HH:mm" } },
        title: { display: true, text: "Time", color: "#fff" },
        grid: { color: "#ffffff" },
        ticks: { color: "#ffffff", maxRotation: 90, minRotation: 45 },
      },
      y: {
        title: { display: true, text: "Heart Rate (BPM)", color: "#fff" },
        min: 0,
        max: yMaxAxis,
        grid: { color: "#ffffff" },
        ticks: { color: "#ffffff" },
      },
    },
  };

  const resetZoom = () => chartRef.current?.resetZoom();

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && resetZoom();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const openCalendar = () => setShowCal(true);
  const handleCalendarChange = ({ startDate, endDate }) => {
    setDateRange({ startDate, endDate });
    onRangeChange?.({ startDate, endDate });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* header like old layout */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ opacity: 0.8, fontSize: 12 }}>Zones: estimated</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSmooth((s) => !s)} style={{ background: "rgba(75,75,75,0.5)", padding: "6px 10px" }}>
            {smooth ? "Smooth: ON" : "Smooth: OFF"}
          </button>
          <button onClick={resetZoom} style={{ background: "rgba(75,75,75,0.5)", padding: "6px 10px" }}>
            Reset Zoom
          </button>
          <button
            onClick={openCalendar}
            style={{ border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 18, padding: "6px 10px" }}
          >
            🗓️ Range
          </button>
        </div>
      </div>

      {dateRange && (
        <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.8 }}>
          Range: {dateRange.startDate.toISOString().slice(0, 10)} → {dateRange.endDate.toISOString().slice(0, 10)}
        </div>
      )}

      {/* 🔒 constrain height exactly like the old chart */}
      <div style={{ height, width: "100%" }}>
        <Line ref={chartRef} data={data} options={options} />
      </div>

      {/* simple overlay calendar (same UX as VO2) */}
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

