"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Plus, ExternalLink, Search, RefreshCw } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import type { Article } from "@/types";
import { motion } from "framer-motion";

export default function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/articles");
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = items.filter((a) =>
    [a.title, a.url, a.runId, a.personaName, a.status].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground">{items.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          </Button>
          <Link href="/dashboard/articles/new" className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
  <Plus className="size-4" />New article
</Link>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search title, URL, run ID..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      <Card className="overflow-hidden">
        <TableBody>
  {filtered.map((a, i) => (
    <TableRow
      key={a.id}
      className="border-b hover:bg-accent/40 cursor-pointer"
      onClick={() => window.location.href = `/dashboard/articles/${a.id}`}
    >
      <TableCell className="font-medium max-w-xs truncate">
        <Link href={`/dashboard/articles/${a.id}`} className="hover:text-primary">{a.title}</Link>
      </TableCell>
      <TableCell><StatusBadge status={a.status} /></TableCell>
      <TableCell className="text-sm text-muted-foreground">{a.personaName || "—"}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{a.runId || "—"}</TableCell>
      <TableCell className="text-sm">{a.assignedTo}</TableCell>
      <TableCell className="text-right tabular-nums">{a.gaPageviews.toLocaleString()}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatRelative(a.gaLastSynced || a.createdAt)}</TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <a href={a.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
          <ExternalLink className="size-4" />
        </a>
      </TableCell>
    </TableRow>
  ))}
  {!loading && filtered.length === 0 && (
    <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No articles yet. Click "New article" to add one.</TableCell></TableRow>
  )}
</TableBody>
      </Card>
    </div>
  );
}