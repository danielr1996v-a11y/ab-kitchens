import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";

/**
 * הכניסה לתצוגת טיוטה - ה-presentationTool ב-Studio קורא לכאן
 * כשפותחים את "עריכה על העמוד". next-sanity מאמת את הבקשה מול
 * הפרויקט, כך שרק מי שמחובר ל-Studio יכול להפעיל טיוטה.
 */
const handlers = client
  ? defineEnableDraftMode({
      client: client.withConfig({ token: process.env.SANITY_API_TOKEN }),
    })
  : {
      // לפני שהחשבון קיים - 404 פשוט במקום קריסה
      GET: () => NextResponse.json({ error: "Sanity לא מוגדר" }, { status: 404 }),
    };

export const { GET } = handlers;
