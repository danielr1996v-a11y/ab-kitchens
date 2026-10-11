import { Card, CardContent } from "@/components/admin/ui/card";

/** מצב ריק: הסבר, ובהמשך גם כפתור פעולה (המפרט §6). מיושר למעלה.
    title רק כשהוא שונה משם המסך - אחרת הוא חוזר פעמיים מתחת ל-h1. */
export default function EmptyView({
  title,
  text,
  note,
  action,
}: {
  title?: string;
  text: string;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="max-w-xl">
      <CardContent className="grid gap-2">
        {title && <h2 className="text-base font-bold">{title}</h2>}
        <p className="text-sm text-muted-foreground">{text}</p>
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
