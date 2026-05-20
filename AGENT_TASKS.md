# AGENT TASKS

## Project Goal

Build a React dashboard that connects to the existing FastAPI ML backend to let users:

- Submit prediction/inference requests
- View model outputs and relevant metadata
- Monitor backend health and basic system status

## Constraints

- Do not modify existing backend training pipeline code, except for small, well-scoped additions (e.g., exporting metrics in `model_trainer.py`).
- Only add new FastAPI endpoints and frontend code.
- Keep new backend work isolated to API/router/service layers that do not change training logic.

## Backend Tasks (FastAPI)

- Add a dedicated dashboard API router (e.g., `/api/dashboard/*`).
- Add endpoint for model/inference request submission.
- Add endpoint for fetching recent prediction results/history.
- Add endpoint for backend health and model readiness status.
- Add request/response schemas with Pydantic models.
- Add API-level error handling and consistent response format.
- Add/update API docs (OpenAPI tags, endpoint descriptions).

## Frontend Tasks (React)

- Scaffold dashboard app/pages/components for:
  - Overview
  - Inference form
  - Results/history table
  - Health/status panel
- Create API client layer for FastAPI integration.
- Implement loading, success, empty, and error states.
- Add form validation and user-friendly feedback.
- Add basic styling/layout for desktop and mobile responsiveness.

## Integration Tasks

- Configure frontend environment variables for backend base URL.
- Enable CORS configuration on FastAPI for dashboard origin(s).
- Wire frontend actions to new backend endpoints.
- Validate end-to-end flow: submit input -> receive prediction -> render result/history.
- Add smoke tests/manual test checklist for core user paths.

## Status Table

| Area        | Task                                                        | Owner (Codex/Claude) | Status    | Notes                                                                                          |
| ----------- | ----------------------------------------------------------- | -------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| Goal        | Define dashboard scope and success criteria                 | Shared               | TODO      | Finalize metrics and MVP boundaries                                                            |
| Backend     | Create dashboard router and endpoint skeletons              | Codex                | COMPLETED | Implemented in `app.py` without touching training pipeline                                     |
| Backend     | Add inference endpoint + schemas                            | Codex                | COMPLETED | Added `/predict_single` and upgraded `/predict` logging flow                                   |
| Backend     | Update `/predict_single` response format with label mapping | Codex                | COMPLETED | Returns `prediction` and mapped label (`1 -> Phishing Website`, `0 -> Legitimate Website`)     |
| Backend     | Add `GET /model_info` endpoint                              | Codex                | COMPLETED | Returns model metadata + metrics loaded from `final_model/metrics.json`                          |
| Backend     | Add history/status endpoints                                | Codex                | COMPLETED | Added `/health`, `/metrics`, `/drift_report`, `/prediction_history`                            |
| Backend     | Save training metrics to `final_model/metrics.json`         | Codex                | COMPLETED | Added JSON export for f1_score, precision, and recall after classification metrics computation |
| Frontend    | Bootstrap dashboard structure and routing                   | Claude               | COMPLETED | Created React app in `frontend/` with Sidebar + Navbar layout, react-router-dom routing        |
| Frontend    | Build inference form + validation                           | Claude               | COMPLETED | SinglePredict page with all 30 feature fields, UploadCSV page with drag-drop FileUpload       |
| Frontend    | Build results table + status widgets                        | Claude               | COMPLETED | Table component, ChartCard with Chart.js, Dashboard stats, PredictionHistory page              |
| Frontend    | Create API client layer                                     | Claude               | COMPLETED | Axios client in `frontend/src/api/client.js` with all backend endpoints                        |
| Frontend    | Build Metrics and DriftReport pages                         | Claude               | COMPLETED | Metrics visualization with bar charts, DriftReport with searchable feature table               |
| Integration | Configure CORS and API base URL                             | Shared               | COMPLETED | Frontend uses `REACT_APP_API_URL` env var, defaults to `http://localhost:8000`                 |
| Integration | End-to-end validation and bug fixes                         | Shared               | TODO      | Test full user flow before merge                                                               |
