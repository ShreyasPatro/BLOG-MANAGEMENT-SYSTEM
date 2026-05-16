import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readAll } from "@/lib/sheets";
import type { Article, Task } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [articles, tasks] = await Promise.all([
    readAll<Article>("Articles"),
    readAll<Task>("Tasks"),
  ]);
  const mine = session.user.role === "admin"
    ? articles
    : articles.filter((a) => a.createdBy === session.user.email || a.assignedTo === session.user.email);

  const byStatus = mine.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const totalViews = mine.reduce((s, a) => s + (a.gaPageviews || 0), 0);
  const totalSessions = mine.reduce((s, a) => s + (a.gaSessions || 0), 0);
  const published = mine.filter((a) => ["Published", "Indexed"].includes(a.status)).length;
  const openTasks = tasks.filter((t) =>
    (session.user.role === "admin" || t.assignedTo === session.user.email) &&
    ["Open", "In Progress"].includes(t.status)
  ).length;

  const top = [...mine].sort((a, b) => b.gaPageviews - a.gaPageviews).slice(0, 5)
    .map((a) => ({ name: a.title.slice(0, 30), views: a.gaPageviews, sessions: a.gaSessions }));

  return NextResponse.json({
    totalArticles: mine.length,
    published,
    openTasks,
    totalViews,
    totalSessions,
    byStatus,
    top,
  });
}