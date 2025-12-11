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

const RespiratoryGraph = () => {
  const chartReset = useRef(null);
  const [smooth, setSmooth] = useState(false);

  // hardcoded data temporarily
  const rateData = [
    { date : "2024-09-02T22:31:15-07:00" , rate: 13.5},
    { date: "2024-09-03T23:56:43-07:00" , rate:14.0},
    { date: "2024-09-04T00:01:12-07:00" , rate:13.5},
    { date: "2024-09-05T22:38:01-07:00" , rate:15.0},
    { date: "2024-09-06T05:12:32-07:00" , rate:10.0},
    { date: "2024-09-07T23:56:13-07:00" , rate:14.5},
    { date: "2024-09-08T00:01:42-07:00" , rate:15.5},
  ];

  // converting, verifying validity, and normalizing raw data to use for data points
  const chartData = rateData
  .map(({ date, rate }) => ({
    x: new Date(new Date(date).setHours(0, 0, 0, 0)),
    y: rate
  }
  ))
  .sort((a, b) => a.x - b.x);


  // For lttb/smoothing option
  const dense = chartData.length > 400;
  const samples = Math.max(120, Math.min(600, Math.floor(chartData.length * 0.35)));

  const data = {
    datasets: [
      {
        label: "Respiratory Rate",
        data: chartData,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        borderWidth: 2,
        pointRadius: 3,
        tension: smooth ? 0.4 : 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {  //do not display legend
        display: false 
      },
      title: {
        display: true,
        text: "Respiratory Rate",
        color: "#fefefeff",
        font: { 
          size: 28, // not sure if to keep this, or to make font smaller
          weight: "bold" 
        },
        padding: { 
          bottom: 10 
        },
      },
      decimation: { //for smoothing option
        enabled: smooth && dense,
        algorithm: "lttb",
        samples,
      },
      annotation: {
        annotations: {
          highZone:{  
            type:"box", 
            yMin:22, 
            yMax:24, 
            backgroundColor:"rgba(73,7,21,0.37)", 
            borderWidth:0 
          },
          elevatedZone:{ 
            type:"box", 
            yMin:18, 
            yMax:22, 
            backgroundColor:"rgba(90,28,7,0.37)", 
            borderWidth:0 
          },
          optimalZone:{ 
            type:"box", 
            yMin:12, 
            yMax:18, 
            backgroundColor:"rgba(6,69,15,0.37)", 
            borderWidth:0 
          },
          optimalZone2:{ 
            type:"box", 
            yMin:8, 
            yMax:12, 
            backgroundColor:"rgba(7,86,120,0.37)", 
            borderWidth:0 
          },
        }
      },
      tooltip: {
        callbacks: {
          title: () => null,
          label: (userDatapoint) => {
            const t = new Date(userDatapoint.parsed.x);
            const dataDate = t.toLocaleDateString([], { month: "short", day: "numeric" });
            return `${userDatapoint.parsed.y} BPM · ${dataDate}`; //display the Respiratory Rate and month+day only
          },
        },
      },
      zoom: {
        pan: {  // for wheel-scroll
          enabled: true, 
          mode: "x", 
          modifierKey: "ctrl"   
        },
        zoom: {  //for drag+scroll
          drag: { 
            enabled: true, 
            modifierKey: "shift" 
          }, 
          mode: "x" 
        }
      },
    },

    scales: {
      x: { // x-axis will be only month+date, one week at a time
        type: "time",
        time: { 
          unit: "day", 
          displayFormats: { 
            day: "MMM d" 
          } 
        },
        title: {  //make bold?
          display: true, 
          text: "Date", 
          color: "#fefefeff" 
        },
        grid: { 
          display: false 
        },
        ticks: { 
          color: "#fefefeff"
        },
      },
      y: { //display only the numbers associated with zone boundaries; y-axis: breaths per minute
        min: 8, max: 24,
        title: { 
          display: true, 
          text: "Breaths per minute",
          color: "#fefefeff" },
        ticks: { 
          color: "#fefefeff",
          callback: yAxis => ([8,12,18,22,24].includes(yAxis) ? yAxis : "") 
        },
        grid: {
          color: yAxis => ([8,12,18,22,24].includes(yAxis.tick.value) ? "#5c5c5cff" : "transparent"),
          lineWidth: yAxis => ([8,12,18,22,24].includes(yAxis.tick.value) ? 2 : 0),
          drawBorder: false,
          drawTicks: false,
        },
      },
    },
  };
  //for reset zoom button
  const resetZoom = () => chartReset.current?.resetZoom();
 

  return (
    <>
      {/*display graph+ data*/}
      <Line key={smooth ? "smooth" : "raw"} ref={chartReset} data={data} options={options} />
      {/*towards the bottom- reset zoom button, smoothing option button, instructions on how to zoom in*/}
      <div style={{ display:"flex", flexDirection:"column", alignItems: "center", marginBottom:"20px", gap:"8px" }}>
        <div>
          <span style={{ color: "white", fontSize: "14px", paddingRight:"50px" }}>Brush-zoom: Shift + Scroll</span>
          <button onClick={() => setSmooth(s => !s)} style={{backgroundColor:"#161e29", padding:"5px 8px"}}>
             {smooth ? "Smooth: ON" : "Smooth: OFF"}</button>
        </div>
        <div>
          <span style={{ color: "white", fontSize: "14px", paddingRight:"50px" }}>Wheel-zoom: CTRL + Drag</span>
          <button onClick={resetZoom} style={{backgroundColor:"#161e29", padding:"5px 8px"}}>Reset Zoom</button>
        </div>
      </div>
    </>
  );
};

export default RespiratoryGraph;
