const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:8001";

// Matches the backend's Celery Beat tick (60s) — no point re-fetching more
// often than the data can actually change, and this is the caching layer
// that keeps the frontend from hitting the backend on every request.
const REVALIDATE_SECONDS = 60;

export class BackendUnavailableError extends Error {}

async function request(path: string): Promise<Response> {
  return fetch(`${BACKEND_API_URL}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
}

export async function fetchFromBackend<T>(path: string): Promise<T> {
  const res = await request(path);
  if (!res.ok) {
    throw new BackendUnavailableError(`${path} returned ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** For single-resource lookups where a 404 is an expected, non-exceptional
 * outcome (e.g. an unknown article slug) — returns null instead of throwing. */
export async function fetchFromBackendOrNull<T>(path: string): Promise<T | null> {
  const res = await request(path);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new BackendUnavailableError(`${path} returned ${res.status}`);
  }
  return res.json() as Promise<T>;
}
