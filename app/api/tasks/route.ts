import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readAll } from "@/lib/sheets";
import type { Task } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const all = await readAll<Task>("Tasks");
  
  // Admin sees all tasks, writers see only their own
  const filtered = session.user.role === "admin"
    ? all
    : all.filter((t) => t.assignedTo === session.user.email);
  
  return NextResponse.json(filtered);
}