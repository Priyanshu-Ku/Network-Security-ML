import React, { useState } from "react";
import FileUpload from "../components/FileUpload";
import { predictCSV, API_BASE_URL } from "../api/api";

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  // Parse HTML table response into structured data
  const parseHtmlTable = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const table = doc.querySelector("table");

    if (!table) return { headers: [], rows: [] };

    const headers = Array.from(table.querySelectorAll("thead th")).map(
      (th) => th.textContent?.trim() || ""
    );

    const rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
      Array.from(tr.querySelectorAll("td")).map(
        (td) => td.textContent?.trim() || ""
      )
    );

    return { headers, rows };
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await predictCSV(file);

      // Parse the HTML response into table data
      const tableData = parseHtmlTable(response.data);
      const totalRows = tableData.rows.length;
      const phishingCount = tableData.rows.filter(
        (row) => row[row.length - 1] === "1"
      ).length;

      setResult({
        tableData,
        totalRows,
        phishingCount,
        legitimateCount: totalRows - phishingCount,
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process file");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleDownload = () => {
    window.open(`${API_BASE_URL}/prediction_output/output.csv`, "_blank");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Batch Prediction</h2>
        <p style={styles.description}>
          Upload a CSV file containing network traffic data for batch
          prediction. The file should include all 30 required feature columns.
        </p>

        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".csv"
          disabled={loading}
        />

        {file && !result && (
          <div style={styles.fileInfo}>
            <span style={styles.fileIcon}>📄</span>
            <div>
              <p style={styles.fileName}>{file.name}</p>
              <p style={styles.fileSize}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <span>❌</span> {error}
          </div>
        )}

        <div style={styles.actions}>
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: !file || loading ? 0.6 : 1,
              cursor: !file || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinnerSmall}></span>
                Processing...
              </>
            ) : (
              "Upload & Predict"
            )}
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Reset
          </button>
        </div>

        {result && (
          <div style={styles.resultSection}>
            {/* Success Banner */}
            <div style={styles.successBanner}>
              <span style={styles.successIcon}>✅</span>
              <div>
                <h3 style={styles.successTitle}>Prediction Complete!</h3>
                <p style={styles.successText}>
                  Results saved to <code>prediction_output/output.csv</code>
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{result.totalRows}</span>
                <span style={styles.statLabel}>Total Records</span>
              </div>
              <div style={{ ...styles.statCard, ...styles.dangerCard }}>
                <span style={styles.statValue}>{result.phishingCount}</span>
                <span style={styles.statLabel}>Phishing Detected</span>
              </div>
              <div style={{ ...styles.statCard, ...styles.successCard }}>
                <span style={styles.statValue}>{result.legitimateCount}</span>
                <span style={styles.statLabel}>Legitimate</span>
              </div>
            </div>

            {/* Results Table */}
            <div style={styles.tableSection}>
              <div style={styles.tableHeader}>
                <h4 style={styles.tableTitle}>
                  Prediction Results
                  <span style={styles.tableBadge}>
                    {result.totalRows} rows
                  </span>
                </h4>
                <button onClick={handleDownload} style={styles.downloadButton}>
                  📥 Download CSV
                </button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      {result.tableData.headers.map((header, i) => (
                        <th key={i} style={styles.th}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.tableData.rows.slice(0, 100).map((row, rowIndex) => {
                      const isPredicted = row[row.length - 1] === "1";
                      return (
                        <tr
                          key={rowIndex}
                          style={{
                            ...styles.tr,
                            backgroundColor: isPredicted
                              ? "#fef2f2"
                              : rowIndex % 2 === 0
                              ? "#fff"
                              : "#f8fafc",
                          }}
                        >
                          <td style={styles.td}>{rowIndex + 1}</td>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} style={styles.td}>
                              {cellIndex === row.length - 1 ? (
                                <span
                                  style={{
                                    ...styles.predictionBadge,
                                    backgroundColor: cell === "1" ? "#fef2f2" : "#f0fdf4",
                                    color: cell === "1" ? "#dc2626" : "#16a34a",
                                  }}
                                >
                                  {cell === "1" ? "Phishing" : "Legitimate"}
                                </span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {result.totalRows > 100 && (
                <p style={styles.tableFooter}>
                  Showing first 100 of {result.totalRows} rows. Download CSV for complete results.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px",
  },
  description: {
    fontSize: "15px",
    color: "#64748b",
    marginBottom: "28px",
    lineHeight: "1.6",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "20px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  fileIcon: {
    fontSize: "32px",
  },
  fileName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 4px",
  },
  fileSize: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
    padding: "14px 18px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: "10px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "28px",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "#fff",
  },
  secondaryButton: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
  },
  spinnerSmall: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  resultSection: {
    marginTop: "32px",
  },
  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px 24px",
    backgroundColor: "#f0fdf4",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
    marginBottom: "24px",
  },
  successIcon: {
    fontSize: "32px",
  },
  successTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#166534",
    margin: "0 0 4px",
  },
  successText: {
    fontSize: "14px",
    color: "#15803d",
    margin: 0,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
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
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "6px",
  },
  tableSection: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  tableTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  tableBadge: {
    fontSize: "12px",
    fontWeight: "500",
    padding: "4px 10px",
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    borderRadius: "12px",
  },
  downloadButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  tableContainer: {
    maxHeight: "500px",
    overflowY: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
    fontWeight: "600",
    color: "#475569",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "12px 16px",
    color: "#334155",
  },
  predictionBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  tableFooter: {
    padding: "14px 20px",
    fontSize: "13px",
    color: "#64748b",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    margin: 0,
    textAlign: "center",
  },
};

export default UploadCSV;
