# Multi-stage build, same shape as self_healing_cicd/Dockerfile and
# portfolio_website/backend/Dockerfile: build a venv with uv in one stage,
# run from a slim non-root image in the other.

FROM python:3.11-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /build
COPY requirements.txt .

RUN uv venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"
RUN uv pip install --no-cache -r requirements.txt


FROM python:3.11-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash --uid 1000 codex

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

COPY --chown=codex:codex app/ ./app/

# database_path (app/core/config.py) resolves to /app/contact_messages.db -
# WORKDIR /app itself, not just a data/ subdirectory - so codex needs write
# access to /app, not only to a chowned subdirectory of it.
RUN chown -R codex:codex /app

USER codex

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
