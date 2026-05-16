import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readAll, appendRow, findOne, logActivity } from "@/lib/sheets";
import { newId } from "@/lib/utils";
import type { User } from "@/types";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await readAll<User>("Users");
  // Never return password hashes
  const safe = users.map(({ passwordHash, ...rest }) => rest);
  return NextResponse.json(safe);
}

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(["admin", "writer"]).default("writer"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const existing = await findOne<User>("Users", (u) => u.email.toLowerCase() === parsed.data.email.toLowerCase());
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user: User = {
    id: newId(),
    email: parsed.data.email,
    passwordHash,
    name: parsed.data.name,
    role: parsed.data.role,
    createdAt: new Date().toISOString(),
    lastLogin: "",
  };
  await appendRow("Users", user as unknown as Record<string, unknown>);
  await logActivity({
    userEmail: session.user.email,
    action: "create-user",
    entityType: "user",
    entityId: user.id,
    details: user.email,
  });
  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}