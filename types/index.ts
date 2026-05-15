export type Role = "admin" | "writer";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  createdAt: string;
  lastLogin: string;
};

export type ArticleStatus =
  | "Draft"
  | "In Progress"
  | "Under Review"
  | "Published"
  | "Indexed";

export type Article = {
  id: string;
  title: string;
  url: string;
  runId: string;
  personaName: string;
  status: ArticleStatus;
  assignedTo: string; // email
  createdBy: string;  // email
  createdAt: string;
  publishDate: string;
  notes: string;
  gaPageviews: number;
  gaSessions: number;
  gaAvgDuration: number;
  gaBounceRate: number;
  gaLastSynced: string;
};

export type TaskStatus = "Open" | "In Progress" | "Done" | "Cancelled";

export type Task = {
  id: string;
  title: string;
  description: string;
  articleId: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  completedAt: string;
};

export type ActivityEntry = {
  timestamp: string;
  userEmail: string;
  action: string;
  entityType: "article" | "task" | "user" | "auth";
  entityId: string;
  details: string;
};