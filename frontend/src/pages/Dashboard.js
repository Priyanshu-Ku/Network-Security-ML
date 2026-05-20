import React, { useState, useEffect } from "react";
import {
  getMetrics,
  getModelInfo,
  getPredictionHistory,
  getDriftReport,
} from "../api/api";
import ChartCard from "../components/ChartCard";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [driftStatus, setDriftStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsRes, modelInfoRes, historyRes, driftRes] = await Promise.all([
        getMetrics().catch(() => ({ data: null })),
        getModelInfo().catch(() => ({ data: null })),
        getPredictionHistory(1000).catch(() => ({ data: { history: [] } })),
        getDriftReport().catch(() => ({ data: null })),
      ]);
      setMetrics(metricsRes.data);
      setModelInfo(modelInfoRes.data);
      setTotalPredictions(historyRes.data?.history?.length || 0);

      // Calculate drift status
      if (driftRes.data?.drift_report) {
        const features = Object.values(driftRes.data.drift_report);
        const driftDetected = features.some((f) => f.drift_status === true);
        const driftCount = features.filter((f) => f.drift_status === true).length;
        setDriftStatus({ detected: driftDetected, count: driftCount, total: features.length });
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <div>
            <p style={styles.errorTitle}>Connection Error</p>
            <p style={styles.errorText}>{error}</p>
          </div>
          <button onClick={fetchData} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const metricsChartData = metrics
    ? {
        labels: ["Precision", "Recall", "F1 Score"],
        datasets: [
          {
            label: "Score (%)",
            data: [
              Math.round(metrics.precision * 1000) / 10,
              Math.round(metrics.recall * 1000) / 10,
              Math.round(metrics.f1_score * 1000) / 10,
            ],
            backgroundColor: ["#3b82f6", "#8b5cf6", "#06b6d4"],
            borderRadius: 8,
            barThickness: 60,
          },
        ],
      }
    : null;

  const getMetricStatus = (value) => {
    if (value >= 0.9) return { color: "#16a34a", bg: "#f0fdf4", label: "Excellent" };
    if (value >= 0.8) return { color: "#2563eb", bg: "#eff6ff", label: "Good" };
    if (value >= 0.7) return { color: "#d97706", bg: "#fffbeb", label: "Fair" };
    return { color: "#dc2626", bg: "#fef2f2", label: "Needs Improvement" };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>ML Monitoring Dashboard</h1>
          <p style={styles.subtitle}>
            Real-time model performance and data drift monitoring
          </p>
        </div>
        <div style={styles.headerRight}>
          {lastUpdated && (
            <p style={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={styles.metricsGrid}>
        {/* F1 Score Card */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricIcon}>🎯</span>
            <span style={styles.metricLabel}>F1 Score</span>
          </div>
          <div style={styles.metricBody}>
            <span style={styles.metricValue}>
              {metrics ? (metrics.f1_score * 100).toFixed(1) : "--"}
              <span style={styles.metricUnit}>%</span>
            </span>
            {metrics && (
              <span
                style={{
                  ...styles.metricBadge,
                  backgroundColor: getMetricStatus(metrics.f1_score).bg,
                  color: getMetricStatus(metrics.f1_score).color,
                }}
              >
                {getMetricStatus(metrics.f1_score).label}
              </span>
            )}
          </div>
          <p style={styles.metricDesc}>Harmonic mean of precision and recall</p>
        </div>

        {/* Precision Card */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricIcon}>✅</span>
            <span style={styles.metricLabel}>Precision</span>
          </div>
          <div style={styles.metricBody}>
            <span style={styles.metricValue}>
              {metrics ? (metrics.precision * 100).toFixed(1) : "--"}
              <span style={styles.metricUnit}>%</span>
            </span>
            {metrics && (
              <span
                style={{
                  ...styles.metricBadge,
                  backgroundColor: getMetricStatus(metrics.precision).bg,
                  color: getMetricStatus(metrics.precision).color,
                }}
              >
                {getMetricStatus(metrics.precision).label}
              </span>
            )}
          </div>
          <p style={styles.metricDesc}>Correctly identified phishing URLs</p>
        </div>

        {/* Recall Card */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricIcon}>🔍</span>
            <span style={styles.metricLabel}>Recall</span>
          </div>
          <div style={styles.metricBody}>
            <span style={styles.metricValue}>
              {metrics ? (metrics.recall * 100).toFixed(1) : "--"}
              <span style={styles.metricUnit}>%</span>
            </span>
            {metrics && (
              <span
                style={{
                  ...styles.metricBadge,
                  backgroundColor: getMetricStatus(metrics.recall).bg,
                  color: getMetricStatus(metrics.recall).color,
                }}
              >
                {getMetricStatus(metrics.recall).label}
              </span>
            )}
          </div>
          <p style={styles.metricDesc}>Phishing URLs successfully detected</p>
        </div>

        {/* Total Predictions Card */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricIcon}>📊</span>
            <span style={styles.metricLabel}>Total Predictions</span>
          </div>
          <div style={styles.metricBody}>
            <span style={styles.metricValue}>{totalPredictions.toLocaleString()}</span>
          </div>
          <p style={styles.metricDesc}>Predictions stored in database</p>
        </div>

        {/* Model Status Card */}
        <div
          style={{
            ...styles.metricCard,
            borderColor: modelInfo ? "#bbf7d0" : "#fecaca",
            backgroundColor: modelInfo ? "#f0fdf4" : "#fef2f2",
          }}
        >
          <div style={styles.metricHeader}>
            <span style={styles.metricIcon}>{modelInfo ? "🤖" : "❌"}</span>
            <span style={styles.metricLabel}>Model Status</span>
          </div>
          <div style={styles.metricBody}>
            <span
              style={{
                ...styles.metricValue,
                color: modelInfo ? "#16a34a" : "#dc2626",
                fontSize: "24px",
              }}
            >
              {modelInfo ? "Loaded" : "Not Loaded"}
            </span>
          </div>
          {modelInfo ? (
            <div style={styles.modelDetails}>
              <p style={styles.metricDesc}>
                <strong>{modelInfo.model_name}</strong> v{modelInfo.version}
              </p>
              <p style={styles.metricDesc}>
                {modelInfo.number_of_features} features
              </p>
            </div>
          ) : (
            <p style={styles.metricDesc}>Check server connection</p>
          )}
        </div>

        {/* Drift Status Card */}
        <div
          style={{
            ...styles.metricCard,
            borderColor: driftStatus?.detected ? "#fecaca" : "#bbf7d0",
            backgroundColor: driftStatus?.detected ? "#fef2f2" : "#f0fdf4",
          }}
        >
          <div style={styles.metricHeader}>
            <span style={styles.metricIcon}>
              {driftStatus?.detected ? "⚠️" : "✅"}
            </span>
            <span style={styles.metricLabel}>Drift Status</span>
          </div>
          <div style={styles.metricBody}>
            <span
              style={{
                ...styles.metricValue,
                color: driftStatus?.detected ? "#dc2626" : "#16a34a",
                fontSize: "24px",
              }}
            >
              {driftStatus?.detected ? "Drift Detected" : "No Drift"}
            </span>
          </div>
          <p style={styles.metricDesc}>
            {driftStatus
              ? `${driftStatus.count} of ${driftStatus.total} features affected`
              : "Monitoring feature distributions"}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.chartsSection}>
        <h2 style={styles.sectionTitle}>Performance Overview</h2>
        <div style={styles.chartsGrid}>
          {metricsChartData && (
            <ChartCard
              title="Model Metrics Comparison"
              type="bar"
              data={metricsChartData}
              height={300}
              options={{
                indexAxis: "x",
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                      stepSize: 20,
                    },
                    grid: {
                      color: "#e2e8f0",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y.toFixed(1)}%`,
                    },
                  },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.actionsSection}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <a href="/upload" style={styles.actionCard}>
            <span style={styles.actionIcon}>📤</span>
            <span style={styles.actionLabel}>Upload CSV</span>
            <span style={styles.actionDesc}>Batch prediction</span>
          </a>
          <a href="/predict" style={styles.actionCard}>
            <span style={styles.actionIcon}>🔮</span>
            <span style={styles.actionLabel}>Single Predict</span>
            <span style={styles.actionDesc}>Test single URL</span>
          </a>
          <a href="/drift" style={styles.actionCard}>
            <span style={styles.actionIcon}>📉</span>
            <span style={styles.actionLabel}>Drift Report</span>
            <span style={styles.actionDesc}>View details</span>
          </a>
          <a href="/history" style={styles.actionCard}>
            <span style={styles.actionIcon}>📜</span>
            <span style={styles.actionLabel}>History</span>
            <span style={styles.actionDesc}>Past predictions</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "16px",
    fontSize: "16px",
    color: "#64748b",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px 24px",
    backgroundColor: "#fef2f2",
    borderRadius: "12px",
    border: "1px solid #fecaca",
  },
  errorIcon: {
    fontSize: "32px",
  },
  errorTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#dc2626",
    margin: "0 0 4px",
  },
  errorText: {
    fontSize: "14px",
    color: "#991b1b",
    margin: 0,
  },
  retryButton: {
    marginLeft: "auto",
    padding: "10px 20px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },
  headerRight: {
    textAlign: "right",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
    border: "1px solid #e2e8f0",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  lastUpdated: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "8px 0 0",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  metricCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  metricHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  metricIcon: {
    fontSize: "24px",
  },
  metricLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  metricBody: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    marginBottom: "12px",
  },
  metricValue: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 1,
  },
  metricUnit: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#64748b",
  },
  metricBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  metricDesc: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
  },
  modelDetails: {
    textAlign: "center",
  },
  chartsSection: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 20px",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
  },
  actionsSection: {
    marginBottom: "20px",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },
  actionCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textDecoration: "none",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  actionIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  actionLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
  },
  actionDesc: {
    fontSize: "13px",
    color: "#94a3b8",
  },
};

export default Dashboard;
