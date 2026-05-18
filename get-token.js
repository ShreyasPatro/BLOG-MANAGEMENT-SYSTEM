const { google } = require("googleapis");
const http = require("http");
const url = require("url");
const open = require("open");

const oauth2Client = new google.auth.OAuth2(
  "YOUR_CLIENT_ID",
  "YOUR_CLIENT_SECRET", 
  "http://localhost:8080"
);