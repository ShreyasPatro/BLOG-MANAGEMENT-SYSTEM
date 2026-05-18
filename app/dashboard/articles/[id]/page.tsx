"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { ArrowLeft, ExternalLink, Save, Trash2, RefreshCw, Eye, Users2, Clock, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { formatRelative } from "@/lib/utils";
import type { Article } from "@/types";

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [a, setA] = useState<Article | null>(null);
  const [draft, setDraft] = useState<Partial<Article>>({});
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    const r = await fetch(`/api/articles/${id}`);
    if (r.ok) { const data = await r.json(); setA(data); setDraft(data); }
  }
  useEffect(() => { load(); }, [id]);

  async function save() {
    setSaving(true);
    const r = await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSaving(false);
    if (!r.ok) { toast.error("Save failed"); return; }
    toast.success("Saved");
    load();
  }

  async function del() {
    if (!confirm("Delete this article?")) return;
    const r = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("Deleted"); router.push("/dashboard/articles"); }
  }

  async function syncGA() {
    setSyncing(true);
    const r = await fetch(`/api/analytics/${id}`, { method: "POST" });
    setSyncing(false);
    if (r.ok) { toast.success("Analytics refreshed"); load(); }
    else toast.error("GA sync failed");
  }

  if (!a) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/dashboard/articles" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4 mr-1" />Back
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">{a.title}</h1>
          <a href={a.url} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-1">
            {a.url} <ExternalLink className="size-3" />
          </a>
        </div>
        <div className="flex gap-2 items-center">
          <StatusBadge status={a.status} />
          <Button variant="outline" size="sm" onClick={syncGA} disabled={syncing}>
            <RefreshCw className={syncing ? "size-4 mr-1 animate-spin" : "size-4 mr-1"} />Sync GA4
          </Button>
        </div>
      </div>

      {/* GA4 metrics row */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
  <Metric icon={Eye} label="Pageviews" value={(a.gaPageviews || 0).toLocaleString()} />
  <Metric icon={Users2} label="Sessions" value={(a.gaSessions || 0).toLocaleString()} />
  <Metric icon={Clock} label="Avg engagement" value={`${(a.gaAvgDuration || 0).toFixed(0)}s`} />
  <Metric icon={TrendingDown} label="Bounce rate" value={`${((a.gaBounceRate || 0) * 100).toFixed(1)}%`} />
</div>
      <Card>
        <CardHeader><CardTitle>Edit details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input value={draft.url || ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Run ID</Label>
              <Input value={draft.runId || ""} onChange={(e) => setDraft({ ...draft, runId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Persona</Label>
              <Input value={draft.personaName || ""} onChange={(e) => setDraft({ ...draft, personaName: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as Article["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Draft", "In Progress", "Under Review", "Published", "Indexed"].map((s) =>
                    <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Publish date</Label>
              <Input type="date" value={draft.publishDate || ""} onChange={(e) => setDraft({ ...draft, publishDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assigned to</Label>
            <Input value={draft.assignedTo || ""} onChange={(e) => setDraft({ ...draft, assignedTo: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={4} value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="destructive" onClick={del}><Trash2 className="size-4 mr-1" />Delete</Button>
            <Button onClick={save} disabled={saving}><Save className="size-4 mr-1" />{saving ? "Saving..." : "Save changes"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Icon className="size-3.5" />{label}
        </div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}