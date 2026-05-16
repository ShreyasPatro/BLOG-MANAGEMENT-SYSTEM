const { google } = require("googleapis");
require("dotenv").config({ path: ".env.local" });

async function test() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Users!A1:G2",
    });

    console.log("✅ SUCCESS! Data from Sheet:");
    console.log(res.data.values);
  } catch (e) {
    console.error("❌ ERROR:", e.message);
  }
}

test();