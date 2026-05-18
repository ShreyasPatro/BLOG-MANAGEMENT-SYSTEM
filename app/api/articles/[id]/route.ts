import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findOne, updateRowById, deleteRowById, logActivity } from "@/lib/sheets";
import type { Article } from "@/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const a = await findOne<Article>("Articles", (x) => x.id === id);
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(a);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  await updateRowById("Articles", id, body);
  await logActivity({
    userEmail: session.user.email,
    action: "update",
    entityType: "article",
    entityId: id,
    details: Object.keys(body).join(","),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteRowById("Articles", id);
  await logActivity({
    userEmail: session.user.email,
    action: "delete",
    entityType: "article",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}