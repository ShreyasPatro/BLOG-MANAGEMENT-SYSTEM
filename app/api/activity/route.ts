import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readAll } from "@/lib/sheets";
import type { ActivityEntry } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const all = await readAll<ActivityEntry>("ActivityLog");
  return NextResponse.json(all);
}