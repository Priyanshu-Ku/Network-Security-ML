import React, { useState, useEffect } from "react";
import { getMetrics } from "../api/api";
import ChartCard from "../components/ChartCard";

const Metrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await getMetrics();
        setMetrics(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading metrics...</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <span>❌</span> {error}
        </div>
      </div>
    );
  }

  const chartData = {
    labels: ["Precision", "Recall", "F1 Score"],
    datasets: [
      {
        label: "Score (%)",
        data: [
          Math.round(metrics.precision * 10000) / 100,
          Math.round(metrics.recall * 10000) / 100,
          Math.round(metrics.f1_score * 10000) / 100,
        ],
        backgroundColor: ["#3b82f6", "#8b5cf6", "#06b6d4"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Model Metrics</h2>
        <p style={styles.description}>
          Performance metrics from the trained classification model.
        </p>
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricIcon}>🎯</span>
          <div style={styles.metricInfo}>
            <p style={styles.metricLabel}>Precision</p>
            <p style={styles.metricValue}>
              {(metrics.precision * 100).toFixed(2)}%
            </p>
          </div>
          <p style={styles.metricDesc}>
            Ratio of correctly predicted phishing URLs to total predicted
            phishing URLs
          </p>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricIcon}>🔍</span>
          <div style={styles.metricInfo}>
            <p style={styles.metricLabel}>Recall</p>
            <p style={styles.metricValue}>
              {(metrics.recall * 100).toFixed(2)}%
            </p>
          </div>
          <p style={styles.metricDesc}>
            Ratio of correctly predicted phishing URLs to all actual phishing
            URLs
          </p>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricIcon}>⚖️</span>
          <div style={styles.metricInfo}>
            <p style={styles.metricLabel}>F1 Score</p>
            <p style={styles.metricValue}>
              {(metrics.f1_score * 100).toFixed(2)}%
            </p>
          </div>
          <p style={styles.metricDesc}>
            Harmonic mean of precision and recall for balanced evaluation
          </p>
        </div>
      </div>

      <div style={styles.chartContainer}>
        <ChartCard
          title="Model Performance Comparison"
          type="bar"
          data={chartData}
          height={350}
          options={{
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: (value) => `${value}%`,
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => `${context.parsed.y}%`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "300px",
    fontSize: "18px",
    color: "#64748b",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 20px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: "8px",
    fontSize: "14px",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 10px",
  },
  description: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  metricCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  metricIcon: {
    fontSize: "32px",
    display: "block",
    marginBottom: "15px",
  },
  metricInfo: {
    marginBottom: "12px",
  },
  metricLabel: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 4px",
  },
  metricValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  metricDesc: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
    lineHeight: "1.5",
  },
  chartContainer: {
    marginTop: "20px",
  },
};

export default Metrics;
