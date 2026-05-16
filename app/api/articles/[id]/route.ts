import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findOne, updateRowById, deleteRowById, logActivity } from "@/lib/sheets";
import type { Article } from "@/types";
import { z } from "zod";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const a = await findOne<Article>("Articles", (x) => x.id === params.id);
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    session.user.role !== "admin" &&
    a.createdBy !== session.user.email &&
    a.assignedTo !== session.user.email
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(a);
}

const updateSchema = z.object({
  title: z.string().optional(),
  url: z.string().url().optional(),
  runId: z.string().optional(),
  personaName: z.string().optional(),
  status: z.enum(["Draft", "In Progress", "Under Review", "Published", "Indexed"]).optional(),
  assignedTo: z.string().email().optional().or(z.literal("")),
  publishDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const a = await findOne<Article>("Articles", (x) => x.id === params.id);
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    session.user.role !== "admin" &&
    a.createdBy !== session.user.email &&
    a.assignedTo !== session.user.email
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await updateRowById("Articles", params.id, parsed.data);
  await logActivity({
    userEmail: session.user.email,
    action: "update",
    entityType: "article",
    entityId: params.id,
    details: Object.keys(parsed.data).join(","),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") {
    const a = await findOne<Article>("Articles", (x) => x.id === params.id);
    if (!a || a.createdBy !== session.user.email)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await deleteRowById("Articles", params.id);
  await logActivity({
    userEmail: session.user.email,
    action: "delete",
    entityType: "article",
    entityId: params.id,
  });
  return NextResponse.json({ ok: true });
}