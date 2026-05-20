import React from "react";

const Table = ({ columns = [], data, emptyMessage = "No data available" }) => {
  const safeColumns = columns || [];

  if (!data || data.length === 0 || safeColumns.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}>📭</span>
        <p style={styles.emptyText}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            {safeColumns.map((col) => (
              <th key={col.key} style={styles.th}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} style={styles.tr}>
              {safeColumns.map((col) => (
                <td key={col.key} style={styles.td}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  tableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
    fontWeight: "600",
    color: "#475569",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "12px 16px",
    color: "#1e293b",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
  },
  emptyIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "15px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },
};

export default Table;
