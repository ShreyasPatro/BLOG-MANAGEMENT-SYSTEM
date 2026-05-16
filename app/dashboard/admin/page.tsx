"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, ListTodo, Activity } from "lucide-react";
import { toast } from "sonner";
import { formatRelative } from "@/lib/utils";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") router.replace("/dashboard");
  }, [status, session, router]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">Manage users, assign tasks, view activity</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="size-4 mr-2" />Users</TabsTrigger>
          <TabsTrigger value="assign"><ListTodo className="size-4 mr-2" />Assign task</TabsTrigger>
          <TabsTrigger value="activity"><Activity className="size-4 mr-2" />Activity log</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
        <TabsContent value="assign" className="mt-4"><AssignTab /></TabsContent>
        <TabsContent value="activity" className="mt-4"><ActivityTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<{ id: string; email: string; name: string; role: string; createdAt: string; lastLogin: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "writer" });

  async function load() {
    const r = await fetch("/api/users");
    if (r.ok) setUsers(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const r = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) { toast.error((await r.json()).error?.toString() || "Failed"); return; }
    toast.success("User created");
    setForm({ email: "", name: "", password: "", role: "writer" });
    setOpen(false);
    load();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team members</CardTitle>
        <Button size="sm" onClick={() => setOpen(!open)}><Plus className="size-4 mr-1" />Add user</Button>
      </CardHeader>
      <CardContent>
        {open && (
          <div className="border rounded-lg p-4 mb-4 grid md:grid-cols-2 gap-3 bg-muted/30">
            <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1"><Label>Password (min 8)</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-1"><Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="writer">Writer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={add}>Create</Button>
            </div>
          </div>
        )}
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Last login</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell><Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.lastLogin ? formatRelative(u.lastLogin) : "never"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AssignTab() {
  const [users, setUsers] = useState<{ email: string; name: string; role: string }[]>([]);
  const [articles, setArticles] = useState<{ id: string; title: string }[]>([]);
  const [form, setForm] = useState({ title: "", description: "", articleId: "", assignedTo: "", dueDate: "" });

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then((u) => setUsers(u.filter((x: { role: string }) => x.role === "writer")));
    fetch("/api/articles").then((r) => r.json()).then(setArticles);
  }, []);

  async function submit() {
    const r = await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) { toast.error("Failed"); return; }
    toast.success("Task assigned");
    setForm({ title: "", description: "", articleId: "", assignedTo: "", dueDate: "" });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Assign a task</CardTitle></CardHeader>
      <CardContent className="space-y-4 max-w-2xl">
        <div className="space-y-2"><Label>Task title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Write article on AI in retail" />
        </div>
        <div className="space-y-2"><Label>Description</Label>
          <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Assign to</Label>
            <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
              <SelectTrigger><SelectValue placeholder="Select writer" /></SelectTrigger>
              <SelectContent>{users.map((u) => <SelectItem key={u.email} value={u.email}>{u.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Due date</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2"><Label>Related article (optional)</Label>
          <Select value={form.articleId} onValueChange={(v) => setForm({ ...form, articleId: v })}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>{articles.map((a) => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={submit} disabled={!form.title || !form.assignedTo}>Assign task</Button>
      </CardContent>
    </Card>
  );
}

function ActivityTab() {
  const [items, setItems] = useState<{ timestamp: string; userEmail: string; action: string; entityType: string; details: string }[]>([]);
  useEffect(() => {
    fetch("/api/activity").then((r) => r.json()).then(setItems);
  }, []);
  return (
    <Card>
      <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>When</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Type</TableHead><TableHead>Details</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.slice(-50).reverse().map((a, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm text-muted-foreground">{formatRelative(a.timestamp)}</TableCell>
                <TableCell className="text-sm">{a.userEmail}</TableCell>
                <TableCell><Badge variant="secondary">{a.action}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground capitalize">{a.entityType}</TableCell>
                <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{a.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}