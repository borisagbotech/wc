import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { seedIfEmpty, dbHelpers } from "@/lib/db";

export async function GET() {
  await seedIfEmpty();
  const rows = await dbHelpers.all("SELECT key, value FROM settings");
  const obj = {};
  for (const r of rows) {
    try {
      obj[r.key] = JSON.parse(r.value);
    } catch {
      obj[r.key] = r.value;
    }
  }
  return NextResponse.json(obj);
}

export async function POST(req) {
  await seedIfEmpty();
  const body = await req.json();
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }
  await dbHelpers.transaction(async () => {
    for (const [k, v] of Object.entries(body)) {
      const key = String(k);
      const value = typeof v === "string" ? v : JSON.stringify(v);
      await dbHelpers.run(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        [key, value]
      );
    }
  });
  return NextResponse.json({ ok: true });
}
