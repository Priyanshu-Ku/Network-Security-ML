import React, { useState, useEffect } from "react";
import { getPredictionHistory } from "../api/api";
import Table from "../components/Table";

const PredictionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPredictionHistory(limit);
        setHistory(response.data?.history || []);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Failed to load prediction history",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [limit]);

  const columns = [
    {
      key: "timestamp",
      label: "Timestamp",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      key: "prediction",
      label: "Prediction",
      render: (value) => (
        <span
          style={{
            display: "inline-block",
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "500",
            backgroundColor: value === 1 ? "#fef2f2" : "#f0fdf4",
            color: value === 1 ? "#dc2626" : "#166534",
          }}
        >
          {value === 1 ? "Phishing" : "Legitimate"}
        </span>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (value) => (
        <span
          style={{
            fontSize: "12px",
            color: "#64748b",
            backgroundColor: "#f1f5f9",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {value || "N/A"}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div style={styles.loading}>Loading prediction history...</div>;
  }

  const phishingCount = history.filter((h) => h.prediction === 1).length;
  const legitimateCount = history.filter((h) => h.prediction === 0).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Prediction History</h2>
          <p style={styles.description}>
            Recent predictions made by the model, stored in MongoDB.
          </p>
        </div>
        <div style={styles.limitSelector}>
          <label style={styles.limitLabel}>Show:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            style={styles.limitSelect}
          >
            <option value={25}>25 records</option>
            <option value={50}>50 records</option>
            <option value={100}>100 records</option>
            <option value={250}>250 records</option>
            <option value={500}>500 records</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <span>❌</span> {error}
        </div>
      )}

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{history.length}</span>
          <span style={styles.statLabel}>Total Records</span>
        </div>
        <div style={{ ...styles.statCard, ...styles.dangerCard }}>
          <span style={styles.statValue}>{phishingCount}</span>
          <span style={styles.statLabel}>Phishing</span>
        </div>
        <div style={{ ...styles.statCard, ...styles.successCard }}>
          <span style={styles.statValue}>{legitimateCount}</span>
          <span style={styles.statLabel}>Legitimate</span>
        </div>
      </div>

      <div style={styles.tableCard}>
        <Table
          columns={columns}
          data={history}
          emptyMessage="No prediction history available"
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
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
  limitSelector: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  limitLabel: {
    fontSize: "14px",
    color: "#64748b",
  },
  limitSelect: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    backgroundColor: "#fff",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    padding: "16px 20px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: "8px",
    fontSize: "14px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginBottom: "25px",
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  successCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  dangerCard: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "5px",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "5px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
};

export default PredictionHistory;
