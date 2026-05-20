import React, { useState, useEffect } from "react";
import { healthCheck } from "../api/api";

const Navbar = ({ title }) => {
  const [health, setHealth] = useState({
    status: "checking",
    model_loaded: false,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthCheck();
        setHealth({ status: response.data.status || "running", model_loaded: response.data.model_loaded ?? false });
      } catch (error) {
        setHealth({ status: "offline", model_loaded: false });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColor =
    health.status === "running"
      ? "#22c55e"
      : health.status === "checking"
        ? "#f59e0b"
        : "#ef4444";

  return (
    <header style={styles.navbar}>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.statusContainer}>
        <div style={styles.statusItem}>
          <span
            style={{ ...styles.statusDot, backgroundColor: statusColor }}
          ></span>
          <span style={styles.statusText}>API: {health.status}</span>
        </div>
        <div style={styles.statusItem}>
          <span
            style={{
              ...styles.statusDot,
              backgroundColor: health.model_loaded ? "#22c55e" : "#ef4444",
            }}
          ></span>
          <span style={styles.statusText}>
            Model: {health.model_loaded ? "Loaded" : "Not Loaded"}
          </span>
        </div>
      </div>
    </header>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  statusContainer: {
    display: "flex",
    gap: "20px",
  },
  statusItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  statusText: {
    fontSize: "14px",
    color: "#64748b",
  },
};

export default Navbar;
