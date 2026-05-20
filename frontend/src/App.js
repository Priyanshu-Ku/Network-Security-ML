import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import UploadCSV from "./pages/UploadCSV";
import SinglePredict from "./pages/SinglePredict";
import Metrics from "./pages/Metrics";
import DriftReport from "./pages/DriftReport";
import PredictionHistory from "./pages/PredictionHistory";

const pageTitles = {
  "/": "Dashboard",
  "/upload": "Upload CSV",
  "/predict": "Single Predict",
  "/metrics": "Model Metrics",
  "/drift": "Drift Report",
  "/history": "Prediction History",
};

const NotFound = () => (
  <div style={notFoundStyles.container}>
    <div style={notFoundStyles.content}>
      <h1 style={notFoundStyles.code}>404</h1>
      <h2 style={notFoundStyles.title}>Page Not Found</h2>
      <p style={notFoundStyles.message}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a href="/" style={notFoundStyles.link}>
        ← Back to Dashboard
      </a>
    </div>
  </div>
);

const notFoundStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
    padding: "20px",
  },
  content: {
    textAlign: "center",
  },
  code: {
    fontSize: "72px",
    fontWeight: "700",
    color: "#3b82f6",
    margin: "0 0 10px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 15px",
  },
  message: {
    fontSize: "16px",
    color: "#64748b",
    margin: "0 0 25px",
  },
  link: {
    fontSize: "14px",
    color: "#3b82f6",
    textDecoration: "none",
  },
};

function App() {
  return (
    <Router>
      <div style={styles.layout}>
        <Sidebar />
        <div style={styles.main}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar title={pageTitles["/"]} />
                  <Dashboard />
                </>
              }
            />
            <Route
              path="/upload"
              element={
                <>
                  <Navbar title={pageTitles["/upload"]} />
                  <UploadCSV />
                </>
              }
            />
            <Route
              path="/predict"
              element={
                <>
                  <Navbar title={pageTitles["/predict"]} />
                  <SinglePredict />
                </>
              }
            />
            <Route
              path="/metrics"
              element={
                <>
                  <Navbar title={pageTitles["/metrics"]} />
                  <Metrics />
                </>
              }
            />
            <Route
              path="/drift"
              element={
                <>
                  <Navbar title={pageTitles["/drift"]} />
                  <DriftReport />
                </>
              }
            />
            <Route
              path="/history"
              element={
                <>
                  <Navbar title={pageTitles["/history"]} />
                  <PredictionHistory />
                </>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <Navbar title="Not Found" />
                  <NotFound />
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
  },
  main: {
    flex: 1,
    marginLeft: "250px",
    display: "flex",
    flexDirection: "column",
  },
};

export default App;
