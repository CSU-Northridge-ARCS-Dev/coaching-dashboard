import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const HeartGraph = ({ heartRateData }) => {
  // Convert each data point to label (like "03:12") and BPM
  const labels = heartRateData.map((entry) => {
    const date = new Date(entry.time);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  const bpmValues = heartRateData.map((entry) => entry.beatsPerMinute);

  const data = {
    labels,
    datasets: [
      {
        label: "Heart Rate",
        data: bpmValues,
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
