"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, CheckSquare, Users, LogOut, Sparkles, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const initials = (session?.user?.name || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  const items = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/articles", label: "Articles", icon: FileText },
    { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ...(role === "admin"
      ? [{ href: "/dashboard/admin", label: "Admin", icon: Users }]
      : []),
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card/30 backdrop-blur">
      <div className="px-6 py-5 border-b border-border flex items-center gap-2">
        <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="size-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">IQOL</div>
          <div className="text-xs text-muted-foreground leading-tight">Blog & SEO</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3 space-y-2">
        <div className="flex items-center gap-2 px-2">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{session?.user?.name}</div>
            <div className="text-xs text-muted-foreground capitalize">{role}</div>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="size-4 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}