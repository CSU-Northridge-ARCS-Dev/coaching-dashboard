import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
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
  //CategoryScale,
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
  //const chartReset = useRef(null); //used for resetting chart after zoom/drag
  const chartReset = useRef(null);
  const [smooth, setSmooth] = useState(false);
  // Convert each data point to label (like "03:12") and BPM
  // const labels = heartRateData.map((entry) => {
  //   const date = new Date(entry.time);
  //   return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  // });

  // const bpmValues = heartRateData.map((entry) => entry.beatsPerMinute);

  // const validData = heartRateData
  //   .filter((entry) => {
  //     const time = new Date(entry.time).getTime();
  //     return !isNaN(time) && time < Date.now() + 1000 * 60 * 60; // max 1 hour into future
  //   })
  //   .map((entry) => ({
  //     x: new Date(entry.time),
  //     y: entry.beatsPerMinute,
  //   }));

  const validData = heartRateData
    .map(entry => {
      const time = new Date(entry.time);
      const isValid =
        !isNaN(time.getTime()) &&
        time.getFullYear() >= 2020 &&
        time.getFullYear() <= 2030; // avoid 1970 or junk

      //return isValid ? { x: time, y: entry.beatsPerMinute } : null;
      return isValid ? { x: time.getTime(), y: entry.beatsPerMinute } : null; // <-- numeric x
    })
    .filter(Boolean) // remove nulls
    .sort((a, b) => a.x - b.x); // sort by time

    if (validData.length > 0 && validData[0].x instanceof Date && !isNaN(validData[0].x)) {
      console.log("Start:", validData[0].x.toISOString());
      console.log("End:", validData[validData.length - 1].x.toISOString());
    } else {
      console.warn("⚠️ No valid heart rate data points to plot.");
    }
    
  let maxHR = 0;
  for(let i = 0; i<validData.length; i++){ //finds max hr by traversing dataset
    if(maxHR < validData[i].y){
      maxHR = validData[i].y;
    }
  }

  // decide how aggressive to decimate
 const dense = validData.length > 400; // only bother if there's enough data
 const samples = Math.max(
   120,                                      // floor
   Math.min(600, Math.floor(validData.length * 0.35)) // keep ~35%, cap 600
 );
//  const dense = validData.length > 20; // only bother if there's enough data
//  const samples = Math.max(
//    20,                                      // floor
//    Math.min(30, Math.floor(validData.length * 0.35)) // keep ~35%, cap 600
//  );

  const data = {
    //labels,
    datasets: [
      {
        label: "Heart Rate",
        //data: bpmValues,
        // data: heartRateData.map((entry) => ({
        //   x: new Date(entry.time),
        //   y: entry.beatsPerMinute,
        // })),
        data: validData,
        parsing: false,        // <-- let decimator work directly on data
        normalized: true,      // <-- perf hint for sorted x
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        // pointStyle: "circle",
        // pointRadius: 5,
        // pointHoverRadius: 10,

        // pointStyle: "circle",
        // pointRadius: smooth ? 0 : 3,     // ✨ hide points when smoothed
        // pointHoverRadius: smooth ? 0 : 8,
        // tension: smooth ? 0.4 : 0.0,

        pointStyle: "circle",
        pointRadius: smooth ? 0 : 3,   // hide dots when smoothed
        pointHoverRadius: smooth ? 0 : 8,
        tension: smooth ? 0.35 : 0.0,  // small curve so it “reads” as smooth
      },
      {
        label: "Peak Zone",
        data: [], //empty, just for legend display
        borderColor: "rgba(250, 101, 133, 0.7)",
        backgroundColor: "rgba(250, 101, 133, 0.7)",
      },
      {
        label: "Cardio Zone",
        data: [], //empty, just for legend display
        borderColor: "rgba(253, 217, 110, 0.7)",
        backgroundColor: "rgba(253, 217, 110, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Heart Rate Readings Over Time",
      },
      decimation: {
        enabled: smooth && dense,  // only when toggle is ON and worth it
        algorithm: "lttb",
        samples,                   // dynamic target
      },
      annotation:{
      annotations:{
        peakZone:{
            type:"box",
            yMin: maxHR * 0.85,
            yMax: maxHR,
            backgroundColor: "rgba(250, 101, 133, 0.7)",
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },
          cardioZone:{
            type:"box",
            yMin: maxHR *0.7,
            yMax: maxHR * 0.85,
            backgroundColor: "rgba(253, 217, 110, 0.7)",
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },

      },
      
    },
    tooltip:{
      callbacks:{
        title: ()=>null,
        // label: function dataDisplay(data){
        //   return `${data.parsed.y} BPM · ${data.label}`;
        // },
        label: (ctx) => {
        const t = new Date(ctx.parsed.x);
        const hhmm = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `${ctx.parsed.y} BPM · ${hhmm}`;
      },
     },
    },
    // decimation: {
    //     enabled: smooth,           // only when toggle is ON
    //     algorithm: "lttb",
    //     samples: 1000,             // ~how many points to keep (tune 600–1500)
    //   },
    zoom:{
        pan:{
          enabled: true,
          mode: "x",
          modifierKey: "ctrl",
        },
        zoom:{
         drag:{
            enabled:true,
            modifierKey: "shift",
         },
         mode:"x"
      },
      },
     

    },
    
    scales: {
      x: {
        type: "time", 
        // time: {
        //   unit: "hour",
        //   tooltipFormat: "HH:mm",
        //   displayFormats: {
        //     hour: "HH:mm",
        //   },
        // },
        time: {
          tooltipFormat: "HH:mm",
          displayFormats: {
            hour: "HH:mm",
            minute: "HH:mm",
          },
        },        
        title: {
          display: true,
          text: "Time",
          color: "#ffffff",
        },
        grid: { color: "#ffffff" },
        ticks: { color: "#ffffff", maxRotation: 90, minRotation: 45 },
      },
      // y: {
      //   title: {
      //     display: true,
      //     text: "Heart Rate (BPM)",
      //     color: "#ffffff",
      //   },
      //   min: 0,
      //   max: maxHR,
      //   grid: { color: "#ffffff" },
      //   ticks: { color: "#ffffff" },
      // },
      y: { 
        title: { 
          display: true, 
          text: "Heart Rate (BPM)", 
          color: "#fff" },
          min: 0, 
          max: maxHR, 
          grid: { color: "#fff" }, 
          ticks: { color: "#fff" } },
    },
  };
   const resetZoom =()=>{
    chartReset.current?.resetZoom();
  }
  useEffect(()=>{
    const handleKey = (e) =>{
      if(e.key==="Escape"){
        resetZoom();
     }
    };
    window.addEventListener("keydown", handleKey);
    return()=> window.removeEventListener("keydown", handleKey);
  }, []);
 
  return (
  <>
  {/* <div style={{textAlign:"right", marginBottom:"-20px"}}>
    <button onClick={resetZoom} style={{backgroundColor: "rgba(75, 75, 75, 0.5)", padding: "5px", cursor: "pointer",}}> Reset Zoom </button>
  </div> */}
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"-20px" }}>
        <span style={{ opacity: 0.8, fontSize: 12 }}>Zones: estimated</span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setSmooth(s => !s)}
                  style={{backgroundColor:"rgba(75,75,75,0.5)", padding:"5px 8px", cursor:"pointer"}}>
            {smooth ? "Smooth: ON" : "Smooth: OFF"}
          </button>
          <button onClick={resetZoom}
                  style={{backgroundColor:"rgba(75,75,75,0.5)", padding:"5px 8px", cursor:"pointer"}}>
            Reset Zoom
          </button>
        </div>
      </div>
    {/* <Line ref={chartReset} data={data} options={options} /> */}
    <Line key={smooth ? "smooth" : "raw"} ref={chartReset} data={data} options={options} />
  </>
);

};




// const HeartGraph = ({ heartRateData }) => {
//   // Prepare labels (hours) for 24 hours of the day
//   const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

//   // Initialize an array to store the max heart rate for each hour
//   const maxHeartRatePerHour = Array(24).fill(0); // Default value is 0 for missing hours

//   // Filter data for the specific date "2024-07-03"
//   const filteredData = heartRateData.filter((entry) =>
//     entry.time.startsWith("2024-07-03")
//   );

//   // Map over filtered data to update max heart rate per hour
//   filteredData.forEach((entry) => {
//     const date = new Date(entry.time);
//     const hour = date.getUTCHours(); // Get the hour in UTC (or use `getHours()` for local time)
//     maxHeartRatePerHour[hour] = entry.beatsPerMinute; // Set the heart rate for the corresponding hour
//   });

//   const data = {
//     labels: hours, // X-axis: Time in hours
//     datasets: [
//       {
//         label: "Max Heart Rate",
//         data: maxHeartRatePerHour, // Y-axis: BPM data
//         borderColor: "rgba(255, 99, 132, 1)",
//         backgroundColor: "rgba(255, 99, 132, 0.2)",
//         pointStyle: "circle",
//         pointRadius: 5,
//         pointHoverRadius: 10,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       title: {
//         display: true,
//         text: "Max Heart Rate Per Hour for 2024-07-03",
//       },
//     },
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: "Time of Day",
//           color: "#ffffff",
//         },
//         grid: {
//           color: "#ffffff",
//         },
//         ticks: {
//           color: "#ffffff",
//         },
//       },
//       y: {
//         title: {
//           display: true,
//           text: "Heart Rate (BPM)",
//           color: "#ffffff",
//         },
//         min: 0,
//         max: 150, // Adjust max value as needed based on actual data range
//         grid: {
//           color: "#ffffff",
//         },
//         ticks: {
//           color: "#ffffff",
//         },
//       },
//     },
//   };

//   return <Line data={data} options={options} />;
// };

export default HeartGraph;
