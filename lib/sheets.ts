import { google, sheets_v4 } from "googleapis";

const sheetId = process.env.GOOGLE_SHEET_ID!;

function getClient(): sheets_v4.Sheets {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export type SheetName = "Users" | "Articles" | "Tasks" | "ActivityLog";

const HEADERS: Record<SheetName, string[]> = {
  Users: ["id", "email", "passwordHash", "name", "role", "createdAt", "lastLogin"],
  Articles: [
    "id", "title", "url", "runId", "personaName", "status",
    "assignedTo", "createdBy", "createdAt", "publishDate", "notes",
    "gaPageviews", "gaSessions", "gaAvgDuration", "gaBounceRate", "gaLastSynced",
  ],
  Tasks: [
    "id", "title", "description", "articleId", "assignedTo", "assignedBy",
    "dueDate", "status", "createdAt", "completedAt",
  ],
  ActivityLog: ["timestamp", "userEmail", "action", "entityType", "entityId", "details"],
};

function rowToObject<T>(headers: string[], row: string[]): T {
  const obj: Record<string, string | number> = {};
  headers.forEach((h, i) => {
    const v = row[i] ?? "";
    // coerce numeric GA columns
    if (["gaPageviews", "gaSessions", "gaAvgDuration", "gaBounceRate"].includes(h)) {
      obj[h] = v === "" ? 0 : Number(v);
    } else {
      obj[h] = v;
    }
  });
  return obj as T;
}

function objectToRow(headers: string[], obj: Record<string, unknown>): (string | number)[] {
  return headers.map((h) => {
    const v = obj[h];
    if (v === undefined || v === null) return "";
    return typeof v === "number" ? v : String(v);
  });
}

export async function readAll<T>(sheet: SheetName): Promise<T[]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheet}!A2:Z`,
  });
  const rows = res.data.values || [];
  return rows
    .filter((r) => r[0]) // ignore empty rows
    .map((r) => rowToObject<T>(HEADERS[sheet], r));
}

export async function findOne<T extends { id?: string; email?: string }>(
  sheet: SheetName,
  predicate: (row: T) => boolean
): Promise<T | undefined> {
  const all = await readAll<T>(sheet);
  return all.find(predicate);
}

export async function appendRow(sheet: SheetName, obj: Record<string, unknown>) {
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheet}!A:Z`,
    valueInputOption: "RAW",
    requestBody: { values: [objectToRow(HEADERS[sheet], obj)] },
  });
}

export async function updateRowById(
  sheet: SheetName,
  id: string,
  updates: Record<string, unknown>
) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheet}!A2:Z`,
  });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error(`Row with id ${id} not found in ${sheet}`);
  const current = rowToObject<Record<string, unknown>>(HEADERS[sheet], rows[idx]);
  const merged = { ...current, ...updates };
  const newRow = objectToRow(HEADERS[sheet], merged);
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${sheet}!A${idx + 2}:Z${idx + 2}`, // +2 because data starts at row 2
    valueInputOption: "RAW",
    requestBody: { values: [newRow] },
  });
}

export async function deleteRowById(sheet: SheetName, id: string) {
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const tab = meta.data.sheets?.find((s) => s.properties?.title === sheet);
  const tabId = tab?.properties?.sheetId;
  if (tabId === undefined) throw new Error(`Tab ${sheet} not found`);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheet}!A2:A`,
  });
  const idx = (res.data.values || []).findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error(`Row with id ${id} not found in ${sheet}`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: tabId,
              dimension: "ROWS",
              startIndex: idx + 1, // header is row 0, data starts at index 1
              endIndex: idx + 2,
            },
          },
        },
      ],
    },
  });
}

export async function logActivity(entry: {
  userEmail: string;
  action: string;
  entityType: "article" | "task" | "user" | "auth";
  entityId: string;
  details?: string;
}) {
  await appendRow("ActivityLog", {
    timestamp: new Date().toISOString(),
    userEmail: entry.userEmail,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    details: entry.details || "",
  });
}