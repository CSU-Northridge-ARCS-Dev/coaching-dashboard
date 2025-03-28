import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SleepGraph = ({ sleepData }) => {
  const data = {
    labels: ["Deep Sleep", "Core Sleep", "REM Sleep", "Awake", "Unknown"],
    datasets: [
      {
        label: "Hours",
        data: [
          Number(sleepData.deepSleep) || 0,
          Number(sleepData.coreSleep) || 0,
          Number(sleepData.remSleep) || 0,
          Number(sleepData.awake) || 0,
          Number(sleepData.unknown) || 0,
          // sleepData.deepSleep,
          // sleepData.coreSleep,
          // sleepData.remSleep,
          // sleepData.awake,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: [
          "rgb(54, 162, 235)",
          "rgb(75, 192, 192)",
          "rgb(255, 205, 86)",
          "rgb(255, 99, 132)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Sleep Stages (Hours)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours",
        },
        grid: {
          color: "#ffffff",
        },
        ticks: {
          color: "#ffffff",
        },
      },
      x: {
        title: {
          display: true,
          text: "Sleep Stages",
        },
        grid: {
          color: "#ffffff",
        },
        ticks: {
          color: "#ffffff",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default SleepGraph;
