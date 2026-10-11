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
      {/* הלוגו הכהה של האתר - כמו בהדר הלבן */}
      {/* eslint-disable-next-line @next/next/no-img-element -- לוגו במסך הכניסה */}
      <img src="/logo-dark.png" alt="א. בית המטבחים" className="mb-8 h-auto w-44" />
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
