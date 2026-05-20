# FROM python:3.10-slim
# WORKDIR /app
# COPY . /app

# RUN apt update -y && apt install awscli -y

# RUN apt-get update && pip install -r requirements.txt
# CMD ["python3","app.py"]

FROM python:3.10-slim
WORKDIR /app
# Install system dependencies in one layer (including AWS CLI)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        awscli \
        gcc \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
# Copy requirements first for better Docker layer caching
# (dependencies only reinstall if requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copy the rest of the application code
COPY . .
# Expose the port FastAPI/Uvicorn listens on
EXPOSE 8000
# Run the FastAPI app
CMD ["python3", "app.py"]