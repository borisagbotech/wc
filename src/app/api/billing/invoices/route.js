import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers, seedIfEmpty } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req) {
  await seedIfEmpty();
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const rows = await dbHelpers.all("SELECT i.*, p.name AS plan_name FROM invoices i LEFT JOIN plans p ON p.code = i.plan_code WHERE i.user_id = ? ORDER BY i.created_at DESC", [payload.uid]);
  return NextResponse.json(rows);
}

export async function POST(req) {
  await seedIfEmpty();
  // Admin can create invoice for current user based on selected plan
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const me = await dbHelpers.get("SELECT role FROM users WHERE id=?", [payload.uid]);
  if (!me || me.role !== 'Admin') return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
  const body = await req.json();
  const { user_id = payload.uid, plan_code, period_start, period_end } = body || {};
  if (!plan_code) return NextResponse.json({ error: "Plan requis" }, { status: 400 });
  const plan = await dbHelpers.get("SELECT * FROM plans WHERE code=?", [plan_code]);
  if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  const now = new Date().toISOString();
  const ps = period_start || now;
  const pe = period_end || new Date(Date.now() + 30*24*3600*1000).toISOString();
  const res = await dbHelpers.run(
    "INSERT INTO invoices (user_id, plan_code, period_start, period_end, amount_cents, status, created_at) VALUES (?,?,?,?,?, 'unpaid',?)",
    [Number(user_id), plan_code, ps, pe, plan.price_cents, now]
  );
  return NextResponse.json({ id: res.lastID });
}
