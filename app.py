import io
import json
import os
import sys
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

import certifi
import pandas as pd
import pymongo
import yaml
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from fastapi.templating import Jinja2Templates
from uvicorn import run as app_run

from networksecurity.constant import training_pipeline as pipeline_constants
from networksecurity.constant.training_pipeline import (
    DATA_INGESTION_COLLECTION_NAME,
    DATA_INGESTION_DATABASE_NAME,
    TARGET_COLUMN,
)
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.pipeline.training_pipeline import TrainingPipeline
from networksecurity.utils.main_utils.utils import load_object, read_yaml_file
from networksecurity.utils.ml_utils.model.estimator import NetworkModel

from networksecurity.constant.training_pipeline import TRAINING_BUCKET_NAME
from networksecurity.cloud.s3_syncer import S3Sync

ca = certifi.where()
load_dotenv()

mongo_db_url = os.getenv("MONGO_DB_URL")
client = pymongo.MongoClient(mongo_db_url, tlsCAFile=ca)

database = client[DATA_INGESTION_DATABASE_NAME]
collection = database[DATA_INGESTION_COLLECTION_NAME]
prediction_collection = database["Prediction_History"]

app = FastAPI()
templates = Jinja2Templates(directory="./templates")

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB limit for CSV uploads

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _to_python_scalar(value: Any) -> Any:
    return value.item() if hasattr(value, "item") else value


def _ensure_model_input(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        raise ValueError("Input data is empty.")
    if TARGET_COLUMN in df.columns:
        return df.drop(columns=[TARGET_COLUMN])
    return df.copy()

def download_from_s3():
    """Pull final_model/ from S3 into the container at startup."""
    try:
        model_s3_path = f"s3://{TRAINING_BUCKET_NAME}/final_model/latest"

        logging.info(f"Syncing model from {model_s3_path} → final_model/")
        os.makedirs("final_model", exist_ok=True)

        result = os.system(f"aws s3 sync {model_s3_path} final_model/ --no-progress")
        if result != 0:
            raise RuntimeError(
                f"aws s3 sync failed with exit code {result}. "
                f"Check bucket name, IAM permissions, and S3 path: {model_s3_path}"
            )

        required = ["final_model/model.pkl", "final_model/preprocessor.pkl"]
        for f in required:
            if not os.path.exists(f):
                raise RuntimeError(
                    f"{f} not found after S3 sync — "
                    f"check that it exists at {model_s3_path}/"
                )

        logging.info("Model files downloaded from S3 successfully.")

    except Exception as e:
        raise NetworkSecurityException(e, sys)
    

@lru_cache(maxsize=1)
def _get_network_model() -> NetworkModel:
    download_from_s3()  # ← no argument now, pulls from latest/

    preprocessor = load_object(file_path="final_model/preprocessor.pkl")
    final_model = load_object(file_path="final_model/model.pkl")
    return NetworkModel(preprocessor=preprocessor, model=final_model)


def _predict_dataframe(df: pd.DataFrame):
    network_model = _get_network_model()
    return network_model.predict(df)


def _store_prediction_records(records: List[Dict[str, Any]]) -> None:
    if not records:
        return
    prediction_collection.insert_many(records)


def _build_prediction_records(df: pd.DataFrame, predictions, source: str) -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    timestamp = datetime.now(timezone.utc)
    input_rows = df.to_dict(orient="records")

    for row, pred in zip(input_rows, predictions):
        records.append(
            {
                "source": source,
                "input_data": {k: _to_python_scalar(v) for k, v in row.items()},
                "prediction_result": _to_python_scalar(pred),
                "timestamp": timestamp,
            }
        )
    return records


def _serialize_history_document(document: Dict[str, Any]) -> Dict[str, Any]:
    serialized = {
        "id": str(document.get("_id")),
        "source": document.get("source"),
        "input_data": document.get("input_data"),
        "prediction_result": document.get("prediction_result"),
        "timestamp": document.get("timestamp"),
    }
    if isinstance(serialized["timestamp"], datetime):
        serialized["timestamp"] = serialized["timestamp"].isoformat()
    return serialized

def _load_metrics() -> Dict[str, Any]:
    metrics_path = Path("final_model") / "metrics.json"
    if not metrics_path.exists():
        raise HTTPException(status_code=404, detail="Metrics file not found at final_model/metrics.json")
    try:
        with metrics_path.open("r", encoding="utf-8") as metrics_file:
            return json.load(metrics_file)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail="Metrics file is not valid JSON") from exc


def _find_drift_report_path() -> Path:
    candidate_paths = [
        Path("final_model") / "drift_report.yaml",
        Path("final_model") / "report.yaml",
    ]

    artifacts_root = Path(pipeline_constants.ARTIFACT_DIR)
    if artifacts_root.exists():
        candidate_paths.extend(
            sorted(
                artifacts_root.glob("*/data_validation/drift_report/report.yaml"),
                key=lambda path: path.stat().st_mtime,
                reverse=True,
            )
        )

    for path in candidate_paths:
        if path.exists():
            return path

    raise HTTPException(status_code=404, detail="Drift report YAML not found")


@app.get("/", tags=["authentication"])
async def index():
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health_route():
    model_path = Path("final_model") / "model.pkl"
    model_loaded = model_path.exists()
    return {"status": "running", "model_loaded": model_loaded}


@app.get("/train")
async def train_route():
    try:
        train_pipeline = TrainingPipeline()
        train_pipeline.run_pipeline()
        return Response("Training is successful")
    except Exception as e:
        raise NetworkSecurityException(e, sys)

from fastapi.responses import HTMLResponse

@app.post("/predict")
async def predict_route(request: Request, file: UploadFile = File(...)):
    # Check Content-Length header first if available
    content_length = request.headers.get("content-length")
    if content_length is not None:
        if int(content_length) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum allowed size is {MAX_UPLOAD_BYTES} bytes.",
            )
    else:
        # Measure file size by seeking to end
        file.file.seek(0, io.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        if file_size > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum allowed size is {MAX_UPLOAD_BYTES} bytes.",
            )

    try:
        df = pd.read_csv(file.file)
        model_input_df = _ensure_model_input(df)
        y_pred = _predict_dataframe(model_input_df)

        df["predicted_column"] = y_pred
        records = _build_prediction_records(model_input_df, y_pred, source="predict_batch")
        _store_prediction_records(records)

        os.makedirs("prediction_output", exist_ok=True)
        df.to_csv("prediction_output/output.csv", index=False)
        table_html = df.to_html(classes="table table-striped", index=False)

        # return templates.TemplateResponse("table.html", {"request": request, "table": table_html})
        # 🔥 REPLACE TEMPLATE WITH THIS
        html_content = f"""
        <html>
        <head>
            <style>
                table {{ width: 100%; border-collapse: collapse; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; }}
                th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <h2>Predicted Data</h2>
            {table_html}
        </body>
        </html>
        """
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise NetworkSecurityException(e, sys)


@app.post("/predict_single")
async def predict_single_route(payload: Dict[str, Any]):
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Input payload cannot be empty")

        input_df = pd.DataFrame([payload])
        model_input_df = _ensure_model_input(input_df)
        prediction = _to_python_scalar(_predict_dataframe(model_input_df)[0])
        prediction_value = int(prediction)
        label = "Phishing Website" if prediction_value == 1 else "Legitimate Website"

        record = _build_prediction_records(model_input_df, [prediction], source="predict_single")
        _store_prediction_records(record)

        return {
            "prediction": prediction_value,
            "label": label,
            "input_data": payload,
            "prediction_result": prediction_value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logging.error(f"Error during single prediction: {exc}")
        raise HTTPException(status_code=500, detail="Unable to generate single prediction") from exc


@app.get("/metrics")
async def metrics_route():
    return _load_metrics()


@app.get("/model_info")
async def model_info_route():
    model_path = Path("final_model") / "model.pkl"
    if not model_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model file not found at final_model/model.pkl")

    try:
        model_stat = model_path.stat()
        trained_on = datetime.fromtimestamp(model_stat.st_mtime, tz=timezone.utc).isoformat()
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model file not found at final_model/model.pkl")

    metrics = _load_metrics()
    return {
        "model_name": "Random Forest",
        "version": "1.0",
        "trained_on": trained_on,
        "number_of_features": 30,
        "metrics": {
            "f1_score": metrics.get("f1_score"),
            "precision": metrics.get("precision"),
            "recall": metrics.get("recall"),
        },
    }


@app.get("/drift_report")
async def drift_report_route():
    drift_report_path = _find_drift_report_path()
    try:
        report_data = read_yaml_file(str(drift_report_path))
    except FileNotFoundError as exc:
        logging.error(f"Drift report file not found at {drift_report_path}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drift report file not found: {drift_report_path}",
        ) from exc
    except yaml.YAMLError as exc:
        logging.error(f"Invalid YAML in drift report at {drift_report_path}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Drift report contains invalid YAML: {exc}",
        ) from exc
    return {
        "report_path": str(drift_report_path),
        "drift_report": report_data,
    }


@app.get("/prediction_history")
async def prediction_history_route(limit: int = Query(default=100, ge=1, le=1000)):
    try:
        cursor = prediction_collection.find().sort("timestamp", pymongo.DESCENDING).limit(limit)
        history = [_serialize_history_document(document) for document in cursor]
        return {"count": len(history), "history": history}
    except Exception as exc:
        logging.error(f"Error while fetching prediction history: {exc}")
        raise HTTPException(status_code=500, detail="Unable to fetch prediction history") from exc


if __name__ == "__main__":
    app_run(app, host="0.0.0.0", port=8000)
