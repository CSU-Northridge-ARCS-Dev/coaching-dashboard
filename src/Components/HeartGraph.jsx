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

const HeartGraph = () => {
  const generateRandomData = () => {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 101)); 
  };

  const data = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), 
    datasets: [
      {
        label: "Max Heart Rate",
        data: generateRandomData(),
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
        text: "Max Heart Rate Per Hour",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time of Day",
          color: "#ffffff",
        },
        grid: {
          color: "#ffffff",
        },
        ticks: {
          color: "#ffffff",
        },
      },
      y: {
        title: {
          display: true,
          text: "Heart Rate (BPM)",
          color: "#ffffff",
        },
        min: 0,
        max: 150,
        grid: {
          color: "#ffffff",
        },
        ticks: {
          color: "#ffffff",
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default HeartGraph;
