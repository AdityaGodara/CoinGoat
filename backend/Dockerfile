FROM python:3.12-slim AS builder

WORKDIR /build
COPY pyproject.toml ./
COPY app ./app
COPY worker ./worker

RUN python -m venv /venv \
    && /venv/bin/pip install --no-cache-dir --upgrade pip \
    && /venv/bin/pip install --no-cache-dir .


FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /bin/bash appuser

COPY --from=builder /venv /venv
WORKDIR /app

COPY app ./app
COPY worker ./worker
COPY scripts ./scripts
COPY alembic.ini ./
COPY alembic ./alembic

RUN chown -R appuser:appuser /app

ENV PATH="/venv/bin:$PATH"
USER appuser

EXPOSE 8000

# `exec` replaces the shell as PID 1 so uvicorn receives SIGTERM directly for
# graceful shutdown (plain shell-form CMD would swallow it). ${PORT} expands
# via the shell — Render assigns its own port per service via $PORT;
# docker-compose never sets it, so the ":-8000" fallback keeps local
# `docker compose up` behavior unchanged.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
