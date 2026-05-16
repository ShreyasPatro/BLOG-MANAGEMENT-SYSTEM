"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatRelative } from "@/lib/utils";
import type { Article } from "@/types";

export default function AnalyticsPage() {
  const [items, setItems] = useState<Article[]>([]);
  useEffect(() => { fetch("/api/articles").then(r => r.json()).then(setItems); }, []);

  const sorted = [...items].sort((a, b) => b.gaPageviews - a.gaPageviews).slice(0, 15);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="text-sm text-muted-foreground mb-6">Live GA4 data. Refreshes every 30 min.</p>

      <Card>
        <CardHeader><CardTitle>Top 15 articles by traffic</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={sorted.map(a => ({ name: a.title.slice(0, 20), views: a.gaPageviews, sessions: a.gaSessions }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}/>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>Article performance</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sorted.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{formatRelative(a.gaLastSynced)}</div>
                </div>
                <div className="flex gap-6 text-right text-sm tabular-nums">
                  <span><span className="text-muted-foreground">Views</span> {a.gaPageviews.toLocaleString()}</span>
                  <span><span className="text-muted-foreground">Bounce</span> {(a.gaBounceRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}