import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readAll, appendRow, logActivity } from "@/lib/sheets";
import { newId } from "@/lib/utils";
import type { Article } from "@/types";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const all = await readAll<Article>("Articles");
  // Writers see articles they created OR are assigned to; admins see all
  const filtered =
    session.user.role === "admin"
      ? all
      : all.filter(
          (a) =>
            a.createdBy === session.user.email ||
            a.assignedTo === session.user.email
        );
  return NextResponse.json(filtered);
}

const createSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  runId: z.string().optional().default(""),
  personaName: z.string().optional().default(""),
  status: z.enum(["Draft", "In Progress", "Under Review", "Published", "Indexed"]),
  assignedTo: z.string().email().optional().or(z.literal("")),
  publishDate: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const article: Article = {
    id: newId(),
    title: parsed.data.title,
    url: parsed.data.url,
    runId: parsed.data.runId,
    personaName: parsed.data.personaName,
    status: parsed.data.status,
    assignedTo: parsed.data.assignedTo || session.user.email,
    createdBy: session.user.email,
    createdAt: new Date().toISOString(),
    publishDate: parsed.data.publishDate,
    notes: parsed.data.notes,
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