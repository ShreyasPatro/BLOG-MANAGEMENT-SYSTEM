import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findOne, updateRowById } from "@/lib/sheets";
import { fetchMetricsForUrl } from "@/lib/ga4";
import type { Article } from "@/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const a = await findOne<Article>("Articles", (x) => x.id === id);
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const m = await fetchMetricsForUrl(a.url);
    await updateRowById("Articles", a.id, {
      gaPageviews: m.pageviews,
      gaSessions: m.sessions,
      gaAvgDuration: m.avgEngagement,
      gaBounceRate: m.bounceRate,
      gaLastSynced: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, metrics: m });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("GA4 sync error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}