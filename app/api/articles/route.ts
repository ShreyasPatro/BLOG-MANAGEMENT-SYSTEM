import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readAll, appendRow, logActivity } from "@/lib/sheets";
import { newId } from "@/lib/utils";
import type { Article } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const all = await readAll<Article>("Articles");
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const article: Article = {
    id: newId(),
    title: body.title || "",
    url: body.url || "",
    runId: body.runId || "",
    personaName: body.personaName || "",
    status: body.status || "Draft",
    assignedTo: body.assignedTo || session.user.email,
    createdBy: session.user.email,
    createdAt: new Date().toISOString(),
    publishDate: body.publishDate || "",
    notes: body.notes || "",
    gaPageviews: 0,
    gaSessions: 0,
    gaAvgDuration: 0,
    gaBounceRate: 0,
    gaLastSynced: "",
  };

  await appendRow("Articles", article as unknown as Record<string, unknown>);
  await logActivity({
    userEmail: session.user.email,
    action: "create",
    entityType: "article",
    entityId: article.id,
    details: article.title,
  });
  return NextResponse.json(article, { status: 201 });
}