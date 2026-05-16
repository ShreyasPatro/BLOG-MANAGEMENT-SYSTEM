import { Badge } from "@/components/ui/badge";
import type { ArticleStatus } from "@/types";

const styles: Record<ArticleStatus, string> = {
  "Draft": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "Under Review": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  "Published": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "Indexed": "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
};

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return <Badge variant="secondary" className={styles[status]}>{status}</Badge>;
}