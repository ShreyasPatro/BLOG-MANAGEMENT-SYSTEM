require("dotenv").config({ path: ".env.local" });
const { google } = require("googleapis");

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

async function test() {
  try {
    const response = await analyticsData.properties.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [{ name: "screenPageViews" }],
        dimensions: [{ name: "pagePath" }],
        limit: 5,
      },
    });
    console.log("✅ GA4 connected! Top pages:");
    response.data.rows?.forEach(row => {
      console.log(row.dimensionValues?.[0]?.value, "→", row.metricValues?.[0]?.value, "views");
    });
  } catch (e) {
    console.error("❌ GA4 Error:", e.message);
  }
}

test();