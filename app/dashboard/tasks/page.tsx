"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import type { Task } from "@/types";

const statusIcon = {
  "Open": <Clock className="size-4" />,
  "In Progress": <Loader2 className="size-4" />,
  "Done": <CheckCircle2 className="size-4 text-emerald-600" />,
  "Cancelled": <XCircle className="size-4 text-muted-foreground" />,
};

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/tasks");
    if (r.ok) setTasks(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: Task["status"]) {
    const r = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) { toast.success("Updated"); load(); }
    else toast.error("Failed");
  }

  const grouped = {
    "Open": tasks.filter(t => t.status === "Open"),
    "In Progress": tasks.filter(t => t.status === "In Progress"),
    "Done": tasks.filter(t => t.status === "Done"),
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          {session?.user?.role === "admin" ? "Manage and assign tasks in the Admin panel" : "Your assignments"}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(["Open", "In Progress", "Done"] as const).map((col) => (
          <Card key={col} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">{col}</h3>
              <Badge variant="secondary">{grouped[col].length}</Badge>
            </div>
            <div className="space-y-2">
              {grouped[col].map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-lg border bg-background p-3 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    {statusIcon[t.status]}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{t.title}</div>
                      {t.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-muted-foreground truncate">
                      {t.assignedBy} → {t.assignedTo}
                    </span>
                    <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v as Task["status"])}>
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Open", "In Progress", "Done", "Cancelled"].map(s =>
                          <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              ))}
              {grouped[col].length === 0 && !loading && (
                <p className="text-xs text-muted-foreground text-center py-6">Nothing here</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}