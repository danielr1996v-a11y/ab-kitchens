import { Badge } from "@/components/admin/ui/badge";

/** סטטוס פריט כתגית. ⚠️ תגית היא לא כפתור (המפרט §6) */
export default function StatusBadge({ status, hasDraft }: { status: "publish" | "draft" | "trash"; hasDraft?: boolean }) {
  if (status === "trash") return <Badge variant="outline" className="text-muted-foreground">בסל המיחזור</Badge>;
  if (status === "draft") return <Badge variant="secondary" className="bg-amber-100 text-amber-900">טיוטה</Badge>;
  if (hasDraft) return <Badge variant="secondary" className="bg-sky-100 text-sky-900">שינויים שלא פורסמו</Badge>;
  return <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">מפורסם</Badge>;
}
