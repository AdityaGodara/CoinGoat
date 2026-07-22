# CoinGoat backend — multi-source RSS ingestion pipeline

A fixed 60-second Celery Beat tick asks Postgres which `news_sources` are due
(active, and past their own `fetch_interval_seconds`), fetches all of them
concurrently, normalizes entries, deduplicates against existing articles
(by source guid, then canonical URL, then a conservative fuzzy-title match),
and upserts into Postgres. Redis is refreshed for the homepage/latest/
featured/trending/touched-category views only — not per article. FastAPI
serves reads with cache-aside fallback to Postgres on a miss.

This is a backend-only pipeline. Nothing under the repo's `src/` (the Next.js
frontend) depends on or is changed by this service yet.

Sources are database rows (`news_sources` table), not hardcoded — adding a
new feed is an `INSERT`, not a code change. Seeded today: CoinDesk,
Cointelegraph, Decrypt, Bitcoin Magazine, Ethereum Foundation, Solana,
Arbitrum (Offchain Labs), and Kraken Blog — the 8 sources with a verified,
currently-working public RSS feed at the time this was built. (Binance,
Coinbase, Polygon, and Chainlink were evaluated but have no working public
feed today; add them the same way — an `INSERT` into `news_sources` — if
they ever ship one.)

The frontend never learns which source an article came from — `article_sources`
(per-source guid/URL/raw payload, supporting multi-publisher attribution of
the same story) is purely an internal dedup mechanism and is never serialized
in an API response.

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
curl http://localhost:8001/api/homepage
curl http://localhost:8001/api/latest?limit=5
curl http://localhost:8001/api/category/bitcoin
curl http://localhost:8001/api/search?q=bitcoin
```

Watch ingestion happen (expect several sources fetched per tick, with
per-source `inserted`/`updated`/`attached_as_source` counts):

```bash
docker compose logs -f worker beat
```

Check which sources have been fetched:

```sql
SELECT name, is_active, fetch_interval_seconds, last_fetched_at FROM news_sources;
```

## Database migrations

Schema changes go through Alembic. `0002_expand_multi_source_schema` and
`0003_drop_legacy_article_columns` are an intentional **expand/contract**
pair: 0002 adds the new tables/columns and backfills existing data without
removing anything; 0003 (which drops the now-unused `guid`/`link`/`source`/
`fetched_at`/`content_html`/`raw_payload` columns from `articles`) is meant to
ship as a **separate, later** deploy, once the app has run against the
expanded schema for a while. Don't run 0003 immediately after 0002 in the same
release.

To generate a new migration after changing a model:

```bash
docker compose run --rm migrate alembic revision --autogenerate -m "describe the change"
docker compose run --rm migrate alembic upgrade head
```

## Tests

```bash
pip install -e ".[dev]"
pytest
```

Pure-unit coverage only, matching this repo's existing precedent (no
integration test infra — fakeredis, a test-Postgres fixture — exists yet):
`worker/normalize.py` (RSS-entry-to-schema mapping), `app/services/
category_normalizer.py` (keyword classification), `app/services/slug_generator.py`
(slug generation), and `app/services/deduplication.py`'s pure matching
functions (`normalize_url`, `titles_match`, `is_richer`). `DeduplicationService`
itself (the DB-touching orchestration) is intentionally not unit tested —
exercised via `docker compose` + `curl`/SQL above instead.
