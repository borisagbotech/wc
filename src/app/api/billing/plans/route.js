import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers, seedIfEmpty } from "@/lib/db";
import { auth } from "@/lib/auth";

async function ensureAdmin(req) {
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return false;
  const me = await dbHelpers.get("SELECT role FROM users WHERE id=?", [payload.uid]);
  return me && me.role === 'Admin';
}

export async function GET() {
  await seedIfEmpty();
  const rows = await dbHelpers.all("SELECT code, name, price_cents, monthly_quota FROM plans ORDER BY price_cents ASC");
  return NextResponse.json(rows);
}

export async function POST(req) {
  await seedIfEmpty();
  const isAdmin = await ensureAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
  const body = await req.json();
  const { code, name, price_cents, monthly_quota } = body || {};
  if (!code || !name || !Number.isFinite(Number(price_cents)) || !Number.isFinite(Number(monthly_quota))) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }
  try {
    await dbHelpers.run("INSERT INTO plans (code,name,price_cents,monthly_quota) VALUES (?,?,?,?)", [String(code), String(name), Number(price_cents), Number(monthly_quota)]);
  } catch (e) {
    if (String(e?.message||"").includes("UNIQUE")) return NextResponse.json({ error: "Code déjà existant" }, { status: 400 });
    throw e;
  }
  return NextResponse.json({ ok: true });
}
