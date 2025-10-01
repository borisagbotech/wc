import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers, seedIfEmpty } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireAuth(req) {
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return null;
  return payload;
}

export async function GET(req) {
  await seedIfEmpty();
  const me = await requireAuth(req);
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const rows = await dbHelpers.all("SELECT * FROM templates ORDER BY id DESC");
  return NextResponse.json(rows);
}

export async function POST(req) {
  await seedIfEmpty();
  const me = await requireAuth(req);
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const { name, category = "", body: content } = body || {};
  if (!name || !content) return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  const now = new Date().toISOString();
  const res = await dbHelpers.run("INSERT INTO templates (name, category, body, created_at) VALUES (?,?,?,?)", [String(name).trim(), String(category).trim(), String(content), now]);
  return NextResponse.json({ id: res.lastID });
}
