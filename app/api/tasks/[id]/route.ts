import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateRowById, findOne, deleteRowById, logActivity } from "@/lib/sheets";
import type { Task } from "@/types";
import { z } from "zod";

type Ctx = { params: { id: string } };

const schema = z.object({
  status: z.enum(["Open", "In Progress", "Done", "Cancelled"]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const task = await findOne<Task>("Tasks", (t) => t.id === params.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role !== "admin" && task.assignedTo !== session.user.email)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "Done") updates.completedAt = new Date().toISOString();
  await updateRowById("Tasks", params.id, updates);
  await logActivity({
    userEmail: session.user.email,
    action: "update-task",
    entityType: "task",
    entityId: params.id,
    details: parsed.data.status || "",
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await deleteRowById("Tasks", params.id);
  return NextResponse.json({ ok: true });
}