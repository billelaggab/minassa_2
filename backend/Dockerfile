# ==========================================
# FastAPI Production Dockerfile for Ubuntu
# Offline / Air-Gapped Friendly with WeasyPrint
# ==========================================
FROM python:3.11-slim-bookworm AS base

# Prevent Python from writing .pyc files & enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies for WeasyPrint & PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-noto-core \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    fonts-dejavu-core \
    fonts-liberation \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies in virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ==========================================
# Final Production Stage
# ==========================================
FROM python:3.11-slim-bookworm AS final

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    STORAGE_DIR="/app/storage"

WORKDIR /app

# Copy runtime libs and fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libpq5 \
    shared-mime-info \
    fonts-noto-core \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from base
COPY --from=base /opt/venv /opt/venv

# Create unprivileged investigative user for security isolation
RUN useradd -u 1001 -m -s /bin/bash investigator && \
    mkdir -p /app/storage/uploads /app/templates && \
    chown -R investigator:investigator /app

# Copy application files
COPY --chown=investigator:investigator . /app

USER investigator

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
