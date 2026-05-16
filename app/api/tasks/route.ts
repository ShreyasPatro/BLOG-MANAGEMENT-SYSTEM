import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readAll, appendRow, logActivity } from "@/lib/sheets";
import { newId } from "@/lib/utils";
import type { Task } from "@/types";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const all = await readAll<Task>("Tasks");
  const filtered = session.user.role === "admin"
    ? all
    : all.filter((t) => t.assignedTo === session.user.email);
  return NextResponse.json(filtered);
}

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  articleId: z.string().optional().default(""),
  assignedTo: z.string().email(),
  dueDate: z.string().optional().default(""),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const task: Task = {
    id: newId(),
    title: parsed.data.title,
    description: parsed.data.description,
    articleId: parsed.data.articleId,
    assignedTo: parsed.data.assignedTo,
    assignedBy: session.user.email,
    dueDate: parsed.data.dueDate,
    status: "Open",
    createdAt: new Date().toISOString(),
    completedAt: "",
  };
  await appendRow("Tasks", task as unknown as Record<string, unknown>);
  await logActivity({
    userEmail: session.user.email,
    action: "assign-task",
    entityType: "task",
    entityId: task.id,
    details: `${task.title} → ${task.assignedTo}`,
  });
  return NextResponse.json(task, { status: 201 });
}