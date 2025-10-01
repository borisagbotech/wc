import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireAuth(req) {
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  return payload || null;
}

export async function GET(req, { params }) {
  const me = await requireAuth(req);
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  const rows = await dbHelpers.all("SELECT id, at, level, message FROM campaign_logs WHERE campaign_id=? ORDER BY at DESC, id DESC LIMIT 200", [id]);
  return NextResponse.json(rows);
}

export async function POST(req, { params }) {
  const me = await requireAuth(req);
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  const body = await req.json();
  const { level = 'info', message } = body || {};
  if (!message) return NextResponse.json({ error: "Message requis" }, { status: 400 });
  const now = new Date().toISOString();
  await dbHelpers.run("INSERT INTO campaign_logs (campaign_id, at, level, message) VALUES (?,?,?,?)", [id, now, String(level), String(message)]);
  return NextResponse.json({ ok: true });
}
