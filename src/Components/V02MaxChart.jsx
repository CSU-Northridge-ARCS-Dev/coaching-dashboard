// V02MaxChart.jsx
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

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler, zoomPlugin);

const zoneBackgroundPlugin = {
  id: "zoneBackgroundPlugin",
  beforeDraw: (chart) => {
    const { ctx, chartArea: { top, bottom, left, right }, scales: { y }, options } = chart;
    if (!options.plugins.zoneBackground.enabled) return;

    const zones = [
      { label: "Poor", from: 0, to: 20, color: "#f5e8ea", tx: "#000" },
      { label: "Average", from: 20, to: 40, color: "#f2f2df", tx: "#000" },
      { label: "Fair", from: 40, to: 60, color: "#e6f2ea", tx: "#000" },
      { label: "Good", from: 60, to: 80, color: "#e3f7f6", tx: "#000" },
      { label: "Excellent", from: 80, to: 100, color: "#e1f5f6", tx: "#000" },
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
      ctx.fillText(label, left + 60, (yTop + yBottom) / 2);
    });
  },
};

//const V02MaxChart = ({ userId }) => {
const V02MaxChart = ({ userId, csvData }) => {
  const chartRef = useRef();
  const [zoneEnabled, setZoneEnabled] = useState(true);
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [rawData, setRawData] = useState([]);

  // prefer data passed in (weekly points) and skip axios
  useEffect(() => {
    if (!csvData || !csvData.length) return;
    const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
    setLabels(csvData.map(i => fmt.format(new Date(i.x))));
    setValues(csvData.map(i => Number(i.y)));
    setRawData(csvData);
  }, [csvData]);

  useEffect(() => {
    const fetchVO2Max = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/getVO2MaxData?userId=${userId}`);
        const raw = res.data.data;
        const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
        setLabels(raw.map((i) => fmt.format(new Date(i.x))));
        setValues(raw.map((i) => i.y));
        setRawData(raw);
      } catch (err) {
        console.error("Error fetching VO₂ Max data:", err);
      }
    };
  //   if (userId) fetchVO2Max();
  // }, [userId]);
    if (!csvData?.length && userId) fetchVO2Max();
  }, [userId, csvData]);

  useEffect(() => {
    const canvas = chartRef.current?.canvas;
    if (!canvas) return;
    const handleDoubleClick = () => chartRef.current?.resetZoom();
    canvas.addEventListener("dblclick", handleDoubleClick);
    return () => canvas.removeEventListener("dblclick", handleDoubleClick);
  }, []);

  const latestValue = values[values.length - 1] || 0;
  const getZoneLabel = (v) => (v < 20 ? "Poor" : v < 40 ? "Average" : v < 60 ? "Fair" : v < 80 ? "Good" : "Excellent");

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
        pointRadius: 6,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: 70 } },
    plugins: {
      title: { display: true, text: "Today VO₂ Max", color: "#000", font: { size: 18, weight: "bold" } },
      legend: {
        labels: { color: "#000" },
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
        enabled: false,
        external: function (context) {
          let el = document.getElementById("custom-tooltip");
          if (!el) {
            el = document.createElement("div");
            el.id = "custom-tooltip";
            Object.assign(el.style, {
              position: "absolute",
              background: "#fff",
              color: "#000",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              pointerEvents: "none",
              transition: "all .2s ease",
              zIndex: 999,
              fontFamily: "Arial, sans-serif",
            });
            document.body.appendChild(el);
          }

          const t = context.tooltip;
          if (t.opacity === 0) {
            el.style.opacity = 0;
            return;
          }

          const idx = t.dataPoints?.[0]?.dataIndex;
          const val = t.dataPoints?.[0]?.parsed?.y;
          const raw = rawData[idx];
          const date = raw?.x ? new Date(raw.x) : "";
          const dateStr = new Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "UTC",
          }).format(date);

          el.innerHTML = `
            <div style="font-size:16px;font-weight:bold;">Hexoskin:</div>
            <div style="font-size:14px;margin-top:2px;font-weight:bold;color:#000;">${val} ml/kg/min</div>
            <div style="font-size:14px;margin-top:2px;color:#333;">${dateStr}</div>
          `;

          const { offsetLeft: x, offsetTop: y } = context.chart.canvas;
          el.style.opacity = 1;
          el.style.left = x + t.caretX + window.scrollX + "px";
          el.style.top = y + t.caretY + window.scrollY + "px";
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
        min: 0, max: 100,
        ticks: { stepSize: 20, color: "#000" },
        grid: { color: "rgba(0,0,0,0.12)" },
        title: { display: true, text: "VO₂ max (ml/kg/min)", color: "#000", font: { size: 14, weight: "bold" } },
      },
      x: {
        ticks: { color: "#000" },
        grid: { color: "rgba(0,0,0,0.12)" },
        title: { display: true, text: "Date", color: "#000", font: { size: 14, weight: "bold" } },
      },
    },
  };

  return (
    <div style={{ padding: 20, borderRadius: 15, height: "400px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 8, color: "#000", fontSize: 14 }}>
        <strong>Latest VO₂ Max:</strong> {latestValue} ml/kg/min ({getZoneLabel(latestValue)})
      </div>
      <Line ref={chartRef} data={data} options={options} plugins={[zoneBackgroundPlugin]} />
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <div style={{ color: "#000", marginTop: 20, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
          <div><p><b>Brush-zoom</b>: Shift + drag</p><p><b>Wheel zoom</b>: Ctrl + scroll</p></div>
          <div><p><b>Reset</b>: Double-click chart</p><p><b>Series Toggle</b>: Click legend</p></div>
        </div>
      </div>
    </div>
  );
};

export default V02MaxChart;
