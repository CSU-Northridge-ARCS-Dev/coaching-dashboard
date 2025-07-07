import React from "react";
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
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  //CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const HeartGraph = ({ heartRateData }) => {
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

      return isValid ? { x: time, y: entry.beatsPerMinute } : null;
    })
    .filter(Boolean) // remove nulls
    .sort((a, b) => a.x - b.x); // sort by time

    if (validData.length > 0 && validData[0].x instanceof Date && !isNaN(validData[0].x)) {
      console.log("Start:", validData[0].x.toISOString());
      console.log("End:", validData[validData.length - 1].x.toISOString());
    } else {
      console.warn("⚠️ No valid heart rate data points to plot.");
    }
    


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
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        pointStyle: "circle",
        pointRadius: 5,
        pointHoverRadius: 10,
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
      y: {
        title: {
          display: true,
          text: "Heart Rate (BPM)",
          color: "#ffffff",
        },
        min: 0,
        max: 150,
        grid: { color: "#ffffff" },
        ticks: { color: "#ffffff" },
      },
    },
  };

  return <Line data={data} options={options} />;
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
