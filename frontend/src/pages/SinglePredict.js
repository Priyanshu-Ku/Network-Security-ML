import React, { useState } from "react";
import { predictSingle } from "../api/api";

const featureFields = [
  {
    name: "having_IP_Address",
    label: "Having IP Address",
    type: "select",
    options: [-1, 0, 1],
  },
  {
    name: "URL_Length",
    label: "URL Length",
    type: "select",
    options: [-1, 0, 1],
  },
  {
    name: "Shortining_Service",
    label: "Shortening Service",
    type: "select",
    options: [-1, 1],
  },
  {
    name: "having_At_Symbol",
    label: "Having @ Symbol",
    type: "select",
    options: [-1, 1],
  },
  {
    name: "double_slash_redirecting",
    label: "Double Slash Redirecting",
    type: "select",
    options: [-1, 1],
  },
  {
    name: "Prefix_Suffix",
    label: "Prefix/Suffix",
    type: "select",
    options: [-1, 1],
  },
  {
    name: "having_Sub_Domain",
    label: "Having Sub Domain",
    type: "select",
    options: [-1, 0, 1],
  },
  {
    name: "SSLfinal_State",
    label: "SSL Final State",
    type: "select",
    options: [-1, 0, 1],
  },
  {
    name: "Domain_registeration_length",
    label: "Domain Registration Length",
    type: "select",
    options: [-1, 1],
  },
  { name: "Favicon", label: "Favicon", type: "select", options: [-1, 1] },
  { name: "port", label: "Port", type: "select", options: [-1, 1] },
  {
    name: "HTTPS_token",
    label: "HTTPS Token",
    type: "select",
    options: [-1, 1],
  },
  {
    name: "Request_URL",
    label: "Request URL",
    type: "select",
    options: [-1, 0, 1],
  },
  {
    name: "URL_of_Anchor",
    label: "URL of Anchor",
    type: "select",
    options: [-1, 0, 1],
  },
  {
    name: "Links_in_tags",
    label: "Links in Tags",
    type: "select",
    options: [-1, 0, 1],
  },
  { name: "SFH", label: "SFH", type: "select", options: [-1, 0, 1] },
  {
    name: "Submitting_to_email",
    label: "Submitting to Email",
    type: "select",
    options: [-1, 1],
  },
  {
    name: "Abnormal_URL",
    label: "Abnormal URL",
    type: "select",
    options: [-1, 1],
  },
  { name: "Redirect", label: "Redirect", type: "select", options: [0, 1] },
  {
    name: "on_mouseover",
    label: "On Mouseover",
    type: "select",
    options: [-1, 1],
  },
  {
    name: "RightClick",
    label: "Right Click",
    type: "select",
    options: [-1, 1],
  },
  {
    name: "popUpWidnow",
    label: "Popup Window",
    type: "select",
    options: [-1, 1],
  },
  { name: "Iframe", label: "Iframe", type: "select", options: [-1, 1] },
  {
    name: "age_of_domain",
    label: "Age of Domain",
    type: "select",
    options: [-1, 1],
  },
  { name: "DNSRecord", label: "DNS Record", type: "select", options: [-1, 1] },
  {
    name: "web_traffic",
    label: "Web Traffic",
    type: "select",
    options: [-1, 0, 1],
  },
  { name: "Page_Rank", label: "Page Rank", type: "select", options: [-1, 1] },
  {
    name: "Google_Index",
    label: "Google Index",
    type: "select",
    options: [-1, 1],
  },
  {
    name: "Links_pointing_to_page",
    label: "Links Pointing to Page",
    type: "select",
    options: [-1, 0, 1],
  },
  {
    name: "Statistical_report",
    label: "Statistical Report",
    type: "select",
    options: [-1, 1],
  },
];

const SinglePredict = () => {
  const [formData, setFormData] = useState(
    featureFields.reduce(
      (acc, field) => ({ ...acc, [field.name]: field.options[0] }),
      {},
    ),
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await predictSingle(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(
      featureFields.reduce(
        (acc, field) => ({ ...acc, [field.name]: field.options[0] }),
        {},
      ),
    );
    setResult(null);
    setError(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Single URL Prediction</h2>
        <p style={styles.description}>
          Enter feature values for a single URL to classify it as phishing or
          legitimate.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            {featureFields.map((field) => (
              <div key={field.name} style={styles.formGroup}>
                <label style={styles.label}>{field.label}</label>
                <select
                  value={formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={styles.select}
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>❌</span> {error}
            </div>
          )}

          <div style={styles.actions}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Predicting..." : "Predict"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Reset
            </button>
          </div>
        </form>

        {result && (
          <div
            style={{
              ...styles.resultBox,
              backgroundColor: result.prediction === 1 ? "#fef2f2" : "#f0fdf4",
              borderColor: result.prediction === 1 ? "#fecaca" : "#bbf7d0",
            }}
          >
            <div style={styles.resultIcon}>
              {result.prediction === 1 ? "⚠️" : "✅"}
            </div>
            <h3
              style={{
                ...styles.resultTitle,
                color: result.prediction === 1 ? "#dc2626" : "#166534",
              }}
            >
              {result.label}
            </h3>
            <p style={styles.resultText}>
              Prediction Value: {result.prediction}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
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
    marginBottom: "25px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: "8px",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "25px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
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
  resultBox: {
    marginTop: "30px",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid",
    textAlign: "center",
  },
  resultIcon: {
    fontSize: "48px",
    marginBottom: "10px",
  },
  resultTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 8px",
  },
  resultText: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
};

export default SinglePredict;
