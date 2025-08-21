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
    const {
      ctx,
      chartArea: { top, bottom, left, right },
      scales: { y },
      options,
    } = chart;

    if (!options.plugins.zoneBackground.enabled) return;

    const zones = [
      { label: "Poor", from: 0, to: 20, color: "#421418", tx: "#bb633d" },
      { label: "Average", from: 20, to: 40, color: "#363716", tx: "#dad692" },
      { label: "Fair", from: 40, to: 60, color: "#193721", tx: "#dad692" },
      { label: "Good", from: 60, to: 80, color: "#0f3835", tx: "#4bd0cb" },
      {
        label: "Excellent",
        from: 80,
        to: 100,
        color: "#072627",
        tx: "#4bd0cb",
      },
    ];

    zones.forEach(({ label, from, to, color, tx }) => {
      const yTop = y.getPixelForValue(to);
      const yBottom = y.getPixelForValue(from);
      ctx.fillStyle = color;
      ctx.fillRect(left, yTop, right - left, yBottom - yTop);
      ctx.fillStyle = tx;
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(label, left + 60, (yTop + yBottom) / 2);
    });
  },
};

const V02MaxChart = ({ userId }) => {
  const chartRef = useRef();
  const [zoneEnabled, setZoneEnabled] = useState(true);
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    const fetchVO2Max = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/getVO2MaxData?userId=${userId}`
        );
        const raw = res.data.data;

        const dateFormatter = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
        });

        setLabels(raw.map((item) => dateFormatter.format(new Date(item.x))));
        setValues(raw.map((item) => item.y));
        setRawData(raw);
      } catch (err) {
        console.error("Error fetching VO₂ Max data:", err);
      }
    };

    if (userId) fetchVO2Max();
  }, [userId]);

  useEffect(() => {
    const canvas = chartRef.current?.canvas;
    if (!canvas) return;
    const handleDoubleClick = () => {
      const chart = chartRef.current;
      if (chart) chart.resetZoom();
    };
    canvas.addEventListener("dblclick", handleDoubleClick);
    return () => {
      canvas.removeEventListener("dblclick", handleDoubleClick);
    };
  }, []);

  const latestValue = values[values.length - 1] || 0;

  const getZoneLabel = (val) => {
    if (val < 20) return "Poor";
    if (val < 40) return "Average";
    if (val < 60) return "Fair";
    if (val < 80) return "Good";
    return "Excellent";
  };

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
      title: {
        display: true,
        text: "Today VO₂ Max",
        color: "#ffffff",
        font: { size: 18, weight: "bold" },
      },
      legend: {
        labels: { color: "#ffffff" },
        onClick: (e, legendItem, legend) => {
          // toggle zone bands and keep dataset toggle working
          setZoneEnabled((prev) => !prev);
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          const meta = ci.getDatasetMeta(index);
          meta.hidden =
            meta.hidden === null ? !ci.data.datasets[index].hidden : null;
          ci.update();
        },
      },
      tooltip: {
        enabled: false,
        external: function (context) {
          let tooltipEl = document.getElementById("custom-tooltip");

          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "custom-tooltip";
            tooltipEl.style.position = "absolute";
            tooltipEl.style.background = "#000";
            tooltipEl.style.color = "#fff";
            tooltipEl.style.padding = "10px";
            tooltipEl.style.borderRadius = "8px";
            tooltipEl.style.pointerEvents = "none";
            tooltipEl.style.transition = "all .2s ease";
            tooltipEl.style.zIndex = 999;
            tooltipEl.style.fontFamily = "Arial, sans-serif";
            document.body.appendChild(tooltipEl);
          }

          const tooltipModel = context.tooltip;

          // Hide if no tooltip
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }

          const index = tooltipModel.dataPoints?.[0]?.dataIndex;
          const value = tooltipModel.dataPoints?.[0]?.parsed?.y;

         const raw = rawData[index];
          
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

          tooltipEl.innerHTML = `
      <div style="font-size: 16px; font-weight: bold;">Hexoskin:</div>
      <div style="font-size: 14px; margin-top: 2px;font-weight: bold; color:#4bd0cb;">${value} ml/kg/min</div>
      <div style="font-size: 14px; margin-top: 2px;font-weight: bold;color:#7a7f83;">${dateStr}</div>
    `;

          const { offsetLeft: positionX, offsetTop: positionY } =
            context.chart.canvas;

          tooltipEl.style.opacity = 1;
          tooltipEl.style.left =
            positionX + tooltipModel.caretX + window.scrollX + "px";
          tooltipEl.style.top =
            positionY + tooltipModel.caretY + window.scrollY + "px";
        },
      },

      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
            modifierKey: "ctrl",
          },
          drag: {
            enabled: true,
            modifierKey: "shift",
            backgroundColor: "rgba(75,208,203,0.3)",
            borderColor: "#4bd0cb",
            borderWidth: 1,
          },
          mode: "x",
        },
      },
      zoneBackground: {
        enabled: zoneEnabled,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, color: "#ffffff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        title: {
          display: true,
          text: "VO₂ max (ml/kg/min)",
          color: "#ffffff",
          font: { size: 14, weight: "bold" },
        },
      },
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        title: {
          display: true,
          text: "Date",
          color: "#ffffff",
          font: { size: 14, weight: "bold" },
        },
      },
    },
  };

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "15px",
        height: "400px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "8px", color: "#ffffff", fontSize: "14px" }}>
        <strong>Latest VO₂ Max:</strong> {latestValue} ml/kg/min (
        {getZoneLabel(latestValue)})
      </div>

      <Line
        ref={chartRef}
        data={data}
        options={options}
        plugins={[zoneBackgroundPlugin]}
      />

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p style={{ color: "#4bd0cb", fontSize: "20px", fontWeight: "700" }}>
          Hexoskin Test
        </p>
        <div
          style={{
            color: "#fff",
            marginTop: "20px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "30px",
          }}
        >
          <div>
            <p>
              <b>Brush-zoom</b>: Shift + drag
            </p>
            <p>
              <b>Wheel zoom</b>: Ctrl + scroll
            </p>
          </div>
          <div>
            <p>
              <b>Reset</b>: Double-click chart
            </p>
            <p>
              <b>Series Toggle</b>: Click legend
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default V02MaxChart;
