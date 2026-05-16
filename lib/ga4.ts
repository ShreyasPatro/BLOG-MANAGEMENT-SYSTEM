import { BetaAnalyticsDataClient } from "@google-analytics/data";

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const property = `properties/${process.env.GA4_PROPERTY_ID}`;

export type GA4Metrics = {
  pageviews: number;
  sessions: number;
  avgEngagement: number; // seconds
  bounceRate: number;    // 0..1
};

/** Pull GA4 metrics for a single URL since the article was published (or last 90 days as fallback). */
export async function fetchMetricsForUrl(url: string): Promise<GA4Metrics> {
  // GA4 uses the pagePath (everything after the domain).
  let pagePath = "/";
  try {
    pagePath = new URL(url).pathname || "/";
  } catch {
    // not a valid URL — return zeros instead of crashing
    return { pageviews: 0, sessions: 0, avgEngagement: 0, bounceRate: 0 };
  }

  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: "90daysAgo", endDate: "today" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "sessions" },
      { name: "userEngagementDuration" },
      { name: "bounceRate" },
    ],
    dimensions: [{ name: "pagePath" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: { matchType: "EXACT", value: pagePath },
      },
    },
  });

  const row = response.rows?.[0];
  if (!row) return { pageviews: 0, sessions: 0, avgEngagement: 0, bounceRate: 0 };

  const v = (i: number) => Number(row.metricValues?.[i]?.value || 0);
  const pageviews = v(0);
  const sessions = v(1);
  return {
    pageviews,
    sessions,
    avgEngagement: sessions > 0 ? v(2) / sessions : 0,
    bounceRate: v(3),
  };
}