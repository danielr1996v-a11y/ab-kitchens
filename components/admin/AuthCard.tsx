import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";

/** מסגרת משותפת למסכי הכניסה וההגדרה - מיושרת למעלה, לא ממורכזת אנכית (המפרט §6) */
export default function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-sm px-4 pt-[12vh]">
      <p className="mb-6 text-sm font-medium text-muted-foreground">א. בית המטבחים · ניהול</p>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
