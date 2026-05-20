import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const healthCheck = () => apiClient.get("/health");

export const getMetrics = () => apiClient.get("/metrics");

export const getModelInfo = () => apiClient.get("/model_info");

export const getDriftReport = () => apiClient.get("/drift_report");

export const getPredictionHistory = (limit = 100) =>
  apiClient.get("/prediction_history", { params: { limit } });

export const predictSingle = (payload) =>
  apiClient.post("/predict_single", payload);

export const predictCSV = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post("/predict", formData, {
    headers: { "Content-Type": undefined },
  });
};

export default apiClient;
