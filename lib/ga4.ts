import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GA4_CLIENT_ID,
  process.env.GA4_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  access_token: process.env.GA4_ACCESS_TOKEN,
  refresh_token: process.env.GA4_REFRESH_TOKEN,
});

const analyticsData = google.analyticsdata({
  version: "v1beta",
  auth: oauth2Client,
});

export type GA4Metrics = {
  pageviews: number;
  sessions: number;
  avgEngagement: number;
  bounceRate: number;
};

export async function fetchMetricsForUrl(url: string): Promise<GA4Metrics> {
  let pagePath = "/";
  try {
    pagePath = new URL(url).pathname || "/";
  } catch {
    return { pageviews: 0, sessions: 0, avgEngagement: 0, bounceRate: 0 };
  }

  const response = await analyticsData.properties.runReport({
    property: `properties/${process.env.GA4_PROPERTY_ID}`,
    requestBody: {
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
    },
  });

  const row = response.data.rows?.[0];
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