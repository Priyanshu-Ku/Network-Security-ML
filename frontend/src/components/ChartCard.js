import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// Deep merge utility to preserve nested defaults
const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

const ChartCard = ({
  title,
  type = "bar",
  data,
  options = {},
  height = 300,
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const mergedOptions = deepMerge(defaultOptions, options);

  const renderChart = () => {
    switch (type) {
      case "doughnut":
        return <Doughnut data={data} options={mergedOptions} />;
      case "bar":
      default:
        return <Bar data={data} options={mergedOptions} />;
    }
  };

  return (
    <div style={styles.card}>
      {title && <h3 style={styles.title}>{title}</h3>}
      <div style={{ height }}>{renderChart()}</div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 20px",
  },
};

export default ChartCard;
