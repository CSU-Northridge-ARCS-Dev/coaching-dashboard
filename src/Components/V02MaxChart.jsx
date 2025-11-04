import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import PopupCalendar from "./DatePicker/PopupCalendar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

const zoneBackgroundPlugin = {
  id: "zoneBackgroundPlugin",
  beforeDraw: (chart) => {
    const { ctx, chartArea: { top, bottom, left, right }, scales: { y }, options } = chart;
    if (!options.plugins.zoneBackground?.enabled) return;
    const zones = [
      { label: "Poor", from: 0, to: 20, color: "#421418", tx: "#bb633d" },
      { label: "Average", from: 20, to: 40, color: "#363716", tx: "#dad692" },
      { label: "Fair", from: 40, to: 60, color: "#193721", tx: "#dad692" },
      { label: "Good", from: 60, to: 80, color: "#0f3835", tx: "#4bd0cb" },
      { label: "Excellent", from: 80, to: 100, color: "#072627", tx: "#4bd0cb" },
    ];
    zones.forEach(({ label, from, to, color, tx }) => {
      const yTop = y.getPixelForValue(to);
      const yBottom = y.getPixelForValue(from);
      ctx.fillStyle = color;
      ctx.fillRect(left, yTop, right - left, yBottom - yTop);
      ctx.fillStyle = tx;
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(label, left + 48, (yTop + yBottom) / 2);
    });
  },
};

/**
 * Props:
 *  - userId?: string
 *  - height?: number (px)  default 300
 */
export default function VO2MaxChart({ userId, height = 300 }) {
  const chartRef = useRef();
  const [zoneEnabled, setZoneEnabled] = useState(true);
  const [showCal, setShowCal] = useState(false);

  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    async function fetchVO2Max() {
      try {
        const res = await axios.get(`/getVO2MaxData?userId=${userId}`);
        const raw = res.data.data || [];
        const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
        setLabels(raw.map((item) => fmt.format(new Date(item.x))));
        setValues(raw.map((item) => item.y));
        setRawData(raw);
        // const res = await axios.get(`/api/vo2max?userId=${encodeURIComponent(userId)}`);
        // const raw = Array.isArray(res.data) ? res.data : [];
        // setLabels(raw.map((item) => fmt.format(new Date(item.timestamp))));
        // setValues(raw.map((item) => item.vo2max));
        // setRawData(raw);
      } catch (err) {
        console.error("Error fetching VO₂ Max data:", err);
      }
    }
    if (userId) fetchVO2Max();
  }, [userId]);

  useEffect(() => {
    const canvas = chartRef.current?.canvas;
    if (!canvas) return;
    const handleDoubleClick = () => chartRef.current?.resetZoom();
    canvas.addEventListener("dblclick", handleDoubleClick);
    return () => canvas.removeEventListener("dblclick", handleDoubleClick);
  }, []);

  const latestValue = values[values.length - 1] || 0;
  const getZoneLabel = (val) => (val < 20 ? "Poor" : val < 40 ? "Average" : val < 60 ? "Fair" : val < 80 ? "Good" : "Excellent");

  const data = {
    labels,
    datasets: [
      {
        label: "VO₂ Max",
        data: values,
        fill: false,
        borderColor: "#4bd0cb",
        borderDash: [5, 5],
        tension: 0.3,
        pointBorderColor: "#4bd0cb",
        pointBackgroundColor: "#4bd0cb",
        pointStyle: "rect",
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // fill the fixed height
    layout: { padding: { right: 60 } },
    plugins: {
      title: { display: true, text: "VO₂ Max", color: "#ffffff", font: { size: 18, weight: "bold" } },
      legend: {
        labels: { color: "#ffffff" },
        onClick: (e, legendItem, legend) => {
          setZoneEnabled((prev) => !prev);
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          const meta = ci.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
          ci.update();
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const idx = ctx.dataIndex;
            const raw = rawData[idx];
            const value = ctx.parsed.y;
            const date = raw?.x ? new Date(raw.x) : null;
            const dateStr = date
              ? new Intl.DateTimeFormat("en-US", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC",
                }).format(date)
              : "";
            return [`Hexoskin: ${value} ml/kg/min`, dateStr];
          },
        },
      },
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: {
          wheel: { enabled: true, modifierKey: "ctrl" },
          drag: { enabled: true, modifierKey: "shift", backgroundColor: "rgba(75,208,203,0.3)", borderColor: "#4bd0cb", borderWidth: 1 },
          mode: "x",
        },
      },
      zoneBackground: { enabled: zoneEnabled },
    },
    scales: {
      y: {
        min: 0, max: 100, ticks: { stepSize: 20, color: "#ffffff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        title: { display: true, text: "VO₂ max (ml/kg/min)", color: "#ffffff", font: { size: 14, weight: "bold" } },
      },
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        title: { display: true, text: "Date", color: "#ffffff", font: { size: 14, weight: "bold" } },
      },
    },
  };

  return (
    <div className="tw-text-white tw-space-y-2">
      <div className="tw-flex tw-items-center tw-justify-between">
        <div className="tw-text-sm">
          <strong>Latest:</strong> {latestValue} ml/kg/min ({getZoneLabel(latestValue)})
        </div>
        <button
          onClick={() => setShowCal(true)}
          className="tw-border tw-border-gray-500 tw-rounded-full tw-px-3 tw-py-1"
        >
          🗓️ Range
        </button>
      </div>

      <div style={{ height }}>
        <Line ref={chartRef} data={data} options={options} plugins={[zoneBackgroundPlugin]} />
      </div>

      {showCal && (
        <div
          onClick={() => setShowCal(false)}
          className="tw-fixed tw-inset-0 tw-bg-black/40 tw-grid tw-place-items-center tw-z-50"
        >
          <div onClick={(e) => e.stopPropagation()} className="tw-shadow-2xl">
            <PopupCalendar />
          </div>
        </div>
      )}
    </div>
  );
}
