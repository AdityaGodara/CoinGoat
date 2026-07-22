import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Configure a Sanity webhook (Project settings -> API -> Webhooks) to POST
 * here on publish, with this exact value as a header named
 * `sanity-webhook-secret` — this is the only thing standing between the
 * public internet and an on-demand cache bust, so it must be set before
 * relying on this for anything beyond local testing. Falls back to time-
 * based ISR (60s, see revalidate exports across the app) if never
 * configured, so this route is optional, not load-bearing. */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SANITY_REVALIDATE_SECRET is not configured" }, { status: 501 });
  }

  if (request.headers.get("sanity-webhook-secret") !== secret) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
