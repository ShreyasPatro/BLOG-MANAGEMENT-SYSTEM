import { NextResponse } from "next/server";
import { readAll, updateRowById } from "@/lib/sheets";
import { fetchMetricsForUrl } from "@/lib/ga4";
import type { Article } from "@/types";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const articles = await readAll<Article>("Articles");
  // Only sync Published / Indexed articles to save quota
  const targets = articles.filter((a) => ["Published", "Indexed"].includes(a.status));

  let ok = 0;
  let failed = 0;
  for (const a of targets) {
    try {
      const m = await fetchMetricsForUrl(a.url);
      await updateRowById("Articles", a.id, {
        gaPageviews: m.pageviews,
        gaSessions: m.sessions,
        gaAvgDuration: m.avgEngagement,
        gaBounceRate: m.bounceRate,
        gaLastSynced: new Date().toISOString(),
      });
      ok++;
    } catch (e) {
      console.error("Sync failed for", a.url, e);
      failed++;
    }
  }
  return NextResponse.json({ ok, failed, total: targets.length });
}

// Allow POST too in case the cron service uses it
export const POST = GET;