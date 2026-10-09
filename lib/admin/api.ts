/**
 * קריאה ל-/api/admin מהדפדפן. מחזיר את ה-JSON, או זורק Error עם
 * ההודעה בעברית מהשרת - כדי שהיא תוצג למשתמש כמו שהיא (המפרט §4).
 */
export async function adminApi<T = Record<string, unknown>>(
  path: string,
  init: { method?: "GET" | "POST" | "PATCH"; body?: unknown } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/admin/${path}`, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("אין חיבור לשרת. בדקו את האינטרנט ונסו שוב");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== "login" && path !== "setup") {
    /* פג תוקף באמצע עבודה - חזרה לכניסה, ואחר כך בחזרה לאותו מסך */
    window.location.href = `/admin/login?next=${encodeURIComponent(location.pathname + location.search)}`;
  }
  if (!res.ok) throw new Error(data.error || "משהו השתבש. נסו שוב");
  return data as T;
}
