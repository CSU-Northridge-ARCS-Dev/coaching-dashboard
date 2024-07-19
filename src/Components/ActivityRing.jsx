import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Data for the Activity Ring
const data = {
  labels: [
    "Calories Burned",
    "Remaining Calories",
    "Steps Taken",
    "Remaining Steps",
    "Distance Walked",
    "Remaining Distance",
  ],
  datasets: [
    {
      backgroundColor: ["#6B5B95", "#4B0082"],
      data: [21, 79], 
    },
    {
      backgroundColor: ["#74C0FC", "#1C7ED6"],
      data: [33, 67],
    },
    {
      backgroundColor: ["#A5D8FF", "#748FFC"],
      data: [20, 80],
    },
    {
      backgroundColor: ["#D0EBFF", "#8A2BE2"],
      data: [10, 90],
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        generateLabels: function (chart) {
          const original =
            ChartJS.overrides.pie.plugins.legend.labels.generateLabels;
          const labelsOriginal = original.call(this, chart);

          let datasetColors = chart.data.datasets.map(function (e) {
            return e.backgroundColor;
          });
          datasetColors = datasetColors.flat();

          labelsOriginal.forEach((label) => {
            label.datasetIndex = (label.index - (label.index % 2)) / 2;
            label.hidden = !chart.isDatasetVisible(label.datasetIndex);
            label.fillStyle = datasetColors[label.index];
          });

          return labelsOriginal;
        },
      },
      onClick: function (mouseEvent, legendItem, legend) {
        legend.chart.getDatasetMeta(legendItem.datasetIndex).hidden =
          legend.chart.isDatasetVisible(legendItem.datasetIndex);
        legend.chart.update();
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const labelIndex = context.datasetIndex * 2 + context.dataIndex;
          return (
            context.chart.data.labels[labelIndex] +
            ": " +
            context.formattedValue
          );
        },
      },
    },
  },
};

const ActivityRing = () => {
  return (
    <div className="tw-bg-gray-800 tw-p-5 tw-rounded-lg">
      <div className="tw-w-[999px] tw-h-[400px] tw-flex tw-justify-center tw-items-center">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default ActivityRing;
