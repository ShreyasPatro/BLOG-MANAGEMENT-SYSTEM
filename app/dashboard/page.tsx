import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome back, {session?.user?.name?.split(" ")[0]}
      </h1>
      <p className="text-muted-foreground mt-1">
        Here&apos;s what&apos;s happening with the blog today.
      </p>
    </div>
  );
}