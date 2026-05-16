"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { FileText, CheckSquare, Eye, Users2 } from "lucide-react";
import { motion } from "framer-motion";

type Stats = {
  totalArticles: number; published: number; openTasks: number;
  totalViews: number; totalSessions: number;
  byStatus: Record<string, number>;
  top: { name: string; views: number; sessions: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  "Draft": "#94a3b8",
  "In Progress": "#f59e0b",
  "Under Review": "#3b82f6",
  "Published": "#10b981",
  "Indexed": "#8b5cf6",
};

export default function DashboardHome() {
  const { data: session } = useSession();
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setS);
  }, []);

  const pieData = s ? Object.entries(s.byStatus).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">Live snapshot of the blog & SEO pipeline.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Stat title="Articles" value={s?.totalArticles ?? "—"} icon={FileText} accent="from-blue-500 to-cyan-500" />
        <Stat title="Published" value={s?.published ?? "—"} icon={FileText} accent="from-emerald-500 to-teal-500" />
        <Stat title="Total pageviews" value={s?.totalViews.toLocaleString() ?? "—"} icon={Eye} accent="from-purple-500 to-pink-500" />
        <Stat title="Open tasks" value={s?.openTasks ?? "—"} icon={CheckSquare} accent="from-amber-500 to-orange-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top 5 articles by pageviews</CardTitle></CardHeader>
          <CardContent>
            {s && s.top.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={s.top} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                  <Tooltip cursor={{ fill: "hsl(var(--accent))" }}
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}/>
                  <Bar dataKey="views" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">Once articles get traffic, they'll show up here.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Status breakdown</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.name] || "#94a3b8"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No data yet.</p>
            )}
            <div className="mt-2 space-y-1">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: STATUS_COLORS[d.name] }} />
                    {d.name}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ title, value, icon: Icon, accent }: { title: string; value: number | string; icon: React.ElementType; accent: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 size-24 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${accent}`} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{title}</div>
            <div className={`size-8 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white`}>
              <Icon className="size-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold tabular-nums">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}