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

const SleepGraph = () => {
  const generateRandomData = () => {
    return {
      deepSleep: Math.floor(Math.random() * 5) + 1,
      coreSleep: Math.floor(Math.random() * 5) + 1,
      remSleep: Math.floor(Math.random() * 5) + 1,
      awake: Math.floor(Math.random() * 3) + 1,
    };
  };

  const sleepData = generateRandomData();

  const data = {
    labels: ["Deep Sleep", "Core Sleep", "REM Sleep", "Awake"],
    datasets: [
      {
        label: "Hours",
        data: [
          sleepData.deepSleep,
          sleepData.coreSleep,
          sleepData.remSleep,
          sleepData.awake,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(255, 99, 132, 0.2)",
        ],
        borderColor: [
          "rgb(54, 162, 235)",
          "rgb(75, 192, 192)",
          "rgb(255, 205, 86)",
          "rgb(255, 99, 132)",
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
        text: "Sleep Stages",
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
