// HeartGraph.jsx
import React, { useEffect, useRef, useState } from "react";
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
  Decimation
} from "chart.js";
import "chartjs-adapter-date-fns";
import HighlightZones from "chartjs-plugin-annotation";
import ZoomAndPan from "chartjs-plugin-zoom";

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

const HeartGraph = ({ heartRateData }) => {
  const chartReset = useRef(null);
  const [smooth, setSmooth] = useState(false);

  const validData = heartRateData
    .map((entry) => {
      const time = new Date(entry.time);
      const ok = !isNaN(time.getTime()) && time.getFullYear() >= 2020 && time.getFullYear() <= 2030;
      return ok ? { x: time.getTime(), y: entry.beatsPerMinute } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.x - b.x);

  let maxHR = 0;
  for (let i = 0; i < validData.length; i++) if (maxHR < validData[i].y) maxHR = validData[i].y;

  const dense = validData.length > 400;
  const samples = Math.max(120, Math.min(600, Math.floor(validData.length * 0.35)));

  const data = {
    datasets: [
      {
        label: "Heart Rate",
        data: validData,
        parsing: false,
        normalized: true,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        pointStyle: "circle",
        pointRadius: smooth ? 0 : 3,
        pointHoverRadius: smooth ? 0 : 8,
        tension: smooth ? 0.35 : 0.0,
      },
      { label: "Peak Zone", data: [], borderColor: "rgba(250, 101, 133, 0.7)", backgroundColor: "rgba(250, 101, 133, 0.7)" },
      { label: "Cardio Zone", data: [], borderColor: "rgba(253, 217, 110, 0.7)", backgroundColor: "rgba(253, 217, 110, 0.7)" },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: "Heart Rate Readings Over Time", color: "#000" },
      legend: { labels: { color: "#000" } },
      decimation: { enabled: smooth && dense, algorithm: "lttb", samples },
      annotation: {
        annotations: {
          peakZone: { type: "box", yMin: maxHR * 0.85, yMax: maxHR, backgroundColor: "rgba(250,101,133,0.7)", borderWidth: 0, drawTime: "beforeDatasetsDraw" },
          cardioZone: { type: "box", yMin: maxHR * 0.7, yMax: maxHR * 0.85, backgroundColor: "rgba(253,217,110,0.7)", borderWidth: 0, drawTime: "beforeDatasetsDraw" },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "rgba(0,0,0,0.15)",
        borderWidth: 1,
        titleColor: "#000",
        bodyColor: "#000",
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
        title: { display: true, text: "Time", color: "#000" },
        grid: { color: "rgba(0,0,0,0.12)" },
        ticks: { color: "#000", maxRotation: 90, minRotation: 45 },
      },
      y: {
        title: { display: true, text: "Heart Rate (BPM)", color: "#000" },
        min: 0,
        max: maxHR,
        grid: { color: "rgba(0,0,0,0.12)" },
        ticks: { color: "#000" },
      },
    },
  };

  const resetZoom = () => chartReset.current?.resetZoom();

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && resetZoom();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: -20 }}>
        <span style={{ opacity: 0.8, fontSize: 12, color: "#000" }}>Zones: estimated</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setSmooth((s) => !s)}
            style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "#000", padding: "5px 8px", cursor: "pointer", border: "1px solid rgba(0,0,0,0.1)" }}
          >
            {smooth ? "Smooth: ON" : "Smooth: OFF"}
          </button>
          <button
            onClick={resetZoom}
            style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "#000", padding: "5px 8px", cursor: "pointer", border: "1px solid rgba(0,0,0,0.1)" }}
          >
            Reset Zoom
          </button>
        </div>
      </div>
      <Line key={smooth ? "smooth" : "raw"} ref={chartReset} data={data} options={options} />
    </>
  );
};

export default HeartGraph;
