import React, { useState, useEffect } from "react";
import { getDriftReport } from "../api/api";

const DriftReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await getDriftReport();
        setReport(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load drift report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading drift report...</div>;
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

  const features = Object.entries(report?.drift_report || {});
  const filteredFeatures = features.filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const driftDetectedCount = features.filter(
    ([, data]) => data.drift_status,
  ).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Data Drift Report</h2>
          <p style={styles.description}>
            Statistical analysis of feature distribution changes between
            training and validation data.
          </p>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{features.length}</span>
          <span style={styles.statLabel}>Total Features</span>
        </div>
        <div style={{ ...styles.statCard, ...styles.successCard }}>
          <span style={styles.statValue}>
            {features.length - driftDetectedCount}
          </span>
          <span style={styles.statLabel}>No Drift</span>
        </div>
        <div style={{ ...styles.statCard, ...styles.dangerCard }}>
          <span style={styles.statValue}>{driftDetectedCount}</span>
          <span style={styles.statLabel}>Drift Detected</span>
        </div>
      </div>

      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Feature Name</th>
              <th style={styles.th}>Drift Status</th>
              <th style={styles.th}>P-Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.map(([name, data]) => (
              <tr key={name} style={styles.tr}>
                <td style={styles.td}>
                  <code style={styles.featureName}>{name}</code>
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: data.drift_status
                        ? "#fef2f2"
                        : "#f0fdf4",
                      color: data.drift_status ? "#dc2626" : "#166534",
                    }}
                  >
                    {data.drift_status ? "⚠️ Drift Detected" : "✅ No Drift"}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={styles.pValue}>
                    {Number.isFinite(data.p_value)
                      ? data.p_value.toFixed(6)
                      : "N/A"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {report?.report_path && (
        <p style={styles.reportPath}>
          Report source: <code>{report.report_path}</code>
        </p>
      )}
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
    marginBottom: "25px",
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
  searchBox: {
    marginBottom: "20px",
  },
  searchInput: {
    width: "100%",
    maxWidth: "300px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 18px",
    backgroundColor: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
    fontWeight: "600",
    fontSize: "13px",
    color: "#475569",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "14px 18px",
  },
  featureName: {
    fontSize: "13px",
    backgroundColor: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "#334155",
  },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  pValue: {
    fontFamily: "monospace",
    fontSize: "13px",
    color: "#64748b",
  },
  reportPath: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#94a3b8",
  },
};

export default DriftReport;
