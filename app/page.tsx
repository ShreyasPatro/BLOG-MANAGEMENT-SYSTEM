"use client";
import { useSession } from "next-auth/react";

export default function DashboardHome() {
  const { data: session } = useSession();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome back, {session?.user?.name?.split(" ")[0]} 👋
      </h1>
      <p className="text-muted-foreground mt-1">
        Here&apos;s what&apos;s happening with the blog today.
      </p>
    </div>
  );
}