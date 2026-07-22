# CoinGoat backend — CoinDesk RSS ingestion pipeline

Celery Beat polls the CoinDesk RSS feed every 30 seconds, normalizes entries,
upserts them into Postgres, and warms Redis. FastAPI serves reads with a
cache-aside fallback to Postgres on a cache miss.

This is a backend-only pipeline. Nothing under the repo's `src/` (the Next.js
frontend) depends on or is changed by this service yet.

## Local development

```bash
cd backend
cp .env.example .env      # adjust POSTGRES_PASSWORD etc. if you like
docker compose up --build
```

This starts `postgres`, `redis`, a one-shot `migrate` job (`alembic upgrade
head`), the `api` (FastAPI, published on host port 8001 — the container
itself listens on 8000, but 8001 is used on the host side to avoid clashing
with other local projects that already bind 8000), `worker` (Celery worker),
and `beat` (Celery beat scheduler). If port 8001 is also taken on your
machine, change the left-hand side of the `api` service's `ports:` mapping in
`docker-compose.yml`.

Check it's alive:

```bash
curl http://localhost:8001/healthz
curl http://localhost:8001/articles?limit=5
```

Watch ingestion happen:

```bash
docker compose logs -f worker beat
```

## Database migrations

Schema changes go through Alembic. To generate a new migration after changing
`app/models/article.py`:

```bash
docker compose run --rm migrate alembic revision --autogenerate -m "describe the change"
docker compose run --rm migrate alembic upgrade head
```

## Tests

```bash
pip install -e ".[dev]"
pytest
```

Only `worker/normalize.py` — the pure RSS-entry-to-schema mapping — is unit
tested. It's the one piece of genuinely pure logic in the pipeline; DB/Redis
integration and API behavior are exercised via `docker compose` + `curl`
above rather than an integration test suite, since none exists elsewhere in
this repo yet.
