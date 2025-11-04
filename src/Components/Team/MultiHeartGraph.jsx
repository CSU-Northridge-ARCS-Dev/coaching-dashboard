import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale, LinearScale,
  LineElement, PointElement, Tooltip, Legend, Filler,
  CategoryScale
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(TimeScale, LinearScale, CategoryScale, LineElement, PointElement, Tooltip, Legend, Filler);

function makeColor(idx) {
  // simple deterministic palette without specifying a theme
  const hues = [210, 0, 140, 60, 280, 20, 100, 320];
  const h = hues[idx % hues.length];
  return `hsl(${h}deg 70% 55%)`;
}

export default function MultiHeartGraph({ title = "Overlay", series = [], average = [] }) {
  const datasets = useMemo(() => {
    if (average?.length) {
      return [{
        label: "Team Avg",
        data: average.map(p => ({ x: new Date(p.timestamp), y: p.bpm })),
        borderColor: makeColor(0),
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.1,
      }];
    }
    return (series || []).map((s, i) => ({
      label: s.label || s.userId,
      data: (s.data || []).map(p => ({ x: new Date(p.timestamp), y: p.bpm })),
      borderColor: makeColor(i),
      pointRadius: 0,
      borderWidth: 2,
      tension: 0.1,
    }));
  }, [series, average]);

  const data = { datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12 } },
      tooltip: { mode: "nearest", intersect: false },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "minute" },
        title: { display: true, text: "Time" },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "BPM" },
      },
    },
  };

  return (
    <div style={{ height: 360 }}>
      <div className="tw-text-base tw-font-semibold tw-mb-2">{title}</div>
      <Line data={data} options={options} />
    </div>
  );
}
