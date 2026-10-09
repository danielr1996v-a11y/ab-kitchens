"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { adminApi } from "@/lib/admin/api";
import { MIN_PASSWORD } from "@/lib/admin/limits";

const noop = () => () => {};
const readToken = () => new URLSearchParams(location.hash.slice(1)).get("t") ?? "";

export default function SetupForm() {
  const token = useSyncExternalStore(noop, readToken, () => null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (token === "") {
    return (
      <p role="alert" className="text-sm text-destructive">
        הקישור חסר או קטוע. פתחו אותו שוב מההודעה, בשלמותו.
      </p>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) {
      setError("שתי הסיסמאות לא זהות");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await adminApi("setup", { body: { token, password } });
      /* מוחקים את הטוקן מהכתובת, שלא יישאר בהיסטוריה של הדפדפן */
      history.replaceState(null, "", "/admin/setup");
      window.location.href = "/admin";
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="password">סיסמה חדשה</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" dir="ltr" minLength={MIN_PASSWORD} required />
        <p className="text-xs text-muted-foreground">לפחות {MIN_PASSWORD} תווים. משפט קצר שקל לזכור עדיף על סיסמה מסובכת.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm">שוב, לאימות</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" dir="ltr" required />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy || token === null}>
        {busy ? "שומרים…" : "שמירה וכניסה"}
      </Button>
    </form>
  );
}
