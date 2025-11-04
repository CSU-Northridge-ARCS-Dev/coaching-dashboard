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
 *  - userId?: string
 *  - heartRateData?: [{ time, beatsPerMinute }]
 *  - onRangeChange?: ({startDate, endDate}) => void
 *  - height?: number (px)  default 300
 */
export default function HeartRateChart({
  userId,
  heartRateData = [],
  onRangeChange,
  height = 300,
}) {
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
  const yMaxAxis = Math.max(60, Math.ceil(maxHR / 10) * 10 || 100);

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
        pointHoverRadius: smooth ? 0 : 6,
        tension: smooth ? 0.35 : 0.0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // fill the given height
    plugins: {
      title: { display: true, text: "Heart Rate Over Time", color: "#fff" },
      decimation: { enabled: smooth && dense, algorithm: "lttb", samples },
      annotation: {
        annotations: {
          peakZone: {
            type: "box",
            yMin: yMaxAxis * 0.85,
            yMax: yMaxAxis,
            backgroundColor: "rgba(250,101,133,.18)",
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },
          cardioZone: {
            type: "box",
            yMin: yMaxAxis * 0.7,
            yMax: yMaxAxis * 0.85,
            backgroundColor: "rgba(253,217,110,.18)",
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
      legend: { labels: { color: "#fff" } },
    },
    scales: {
      x: {
        type: "time",
        time: { tooltipFormat: "HH:mm", displayFormats: { hour: "HH:mm", minute: "HH:mm" } },
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#ffffff", maxRotation: 90, minRotation: 45 },
        title: { display: true, text: "Time", color: "#fff" },
      },
      y: {
        min: 0,
        max: yMaxAxis,
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#ffffff" },
        title: { display: true, text: "BPM", color: "#fff" },
      },
    },
  };

  const resetZoom = () => chartRef.current?.resetZoom();
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && resetZoom();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const handleCalendarChange = ({ startDate, endDate }) => {
    setDateRange({ startDate, endDate });
    onRangeChange?.({ startDate, endDate });
  };

  return (
    <div className="tw-space-y-2 tw-text-white">
      {/* header controls */}
      <div className="tw-flex tw-items-center tw-justify-between">
        <span className="tw-text-xs tw-opacity-80">Zones: estimated</span>
        <div className="tw-flex tw-gap-2">
          <button onClick={() => setSmooth((s) => !s)} className="tw-bg-gray-700 tw-px-3 tw-py-1 tw-rounded">
            {smooth ? "Smooth: ON" : "Smooth: OFF"}
          </button>
          <button onClick={resetZoom} className="tw-bg-gray-700 tw-px-3 tw-py-1 tw-rounded">
            Reset Zoom
          </button>
          <button onClick={() => setShowCal(true)} className="tw-border tw-border-gray-500 tw-rounded-full tw-px-3 tw-py-1">
            🗓️ Range
          </button>
        </div>
      </div>

      {dateRange && (
        <div className="tw-text-xs tw-opacity-80">
          Range: {dateRange.startDate.toISOString().slice(0, 10)} → {dateRange.endDate.toISOString().slice(0, 10)}
        </div>
      )}

      {/* fixed inner height so it fits your card */}
      <div style={{ height }}>
        <Line ref={chartRef} data={data} options={options} />
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
