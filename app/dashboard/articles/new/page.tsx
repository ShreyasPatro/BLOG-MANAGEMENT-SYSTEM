"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    url: "",
    runId: "",
    personaName: "",
    status: "Draft",
    assignedTo: "",
    publishDate: "",
    notes: "",
  });

  async function save() {
    setLoading(true);
    const r = await fetch("/api/articles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!r.ok) { toast.error("Could not save"); return; }
    toast.success("Article added");
    router.push("/dashboard/articles");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/dashboard/articles" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4 mr-1" />Back to articles
      </Link>
      <Card>
        <CardHeader><CardTitle>New article</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Title" v={form.title} on={(v) => setForm({ ...form, title: v })} />
          <Field label="URL" v={form.url} on={(v) => setForm({ ...form, url: v })} placeholder="https://blog.iqol.com/..." />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Run ID" v={form.runId} on={(v) => setForm({ ...form, runId: v })} />
            <Field label="Persona name" v={form.personaName} on={(v) => setForm({ ...form, personaName: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v ?? "Draft" })}
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Draft", "In Progress", "Under Review", "Published", "Indexed"].map((s) =>
                    <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Field label="Publish date" v={form.publishDate} on={(v) => setForm({ ...form, publishDate: v })} type="date" />
          </div>
          <Field label="Assign to (email — optional)" v={form.assignedTo} on={(v) => setForm({ ...form, assignedTo: v })} placeholder="writer@iqol.com" />
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <Button onClick={save} disabled={loading || !form.title || !form.url} className="w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Save article"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, v, on, ...rest }: { label: string; v: string; on: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} {...rest} />
    </div>
  );
}