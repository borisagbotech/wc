import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers, seedIfEmpty } from "@/lib/db";
import { auth } from "@/lib/auth";

function assertAdmin(payload) {
  if (!payload) return false;
  return true; // For brevity, we'll check role from DB below
}

export async function GET(req) {
  await seedIfEmpty();
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const me = await dbHelpers.get("SELECT role FROM users WHERE id=?", [payload.uid]);
  if (!me || me.role !== 'Admin') return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
  const users = await dbHelpers.all("SELECT id, name, email, email_verified, created_at, role FROM users ORDER BY id ASC");
  return NextResponse.json(users);
}

export async function POST(req) {
  await seedIfEmpty();
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const me = await dbHelpers.get("SELECT role FROM users WHERE id=?", [payload.uid]);
  if (!me || me.role !== 'Admin') return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
  const body = await req.json();
  const { name = "", email, password = "", role = "Operator" } = body || {};
  if (!email || !password) return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  const now = new Date().toISOString();
  const hash = await (await import("@/lib/auth")).auth.hashPassword(password);
  try {
    const res = await dbHelpers.run(
      "INSERT INTO users (name,email,password_hash,email_verified,created_at,role) VALUES (?,?,?,?,?,?)",
      [String(name||"").trim(), String(email).trim(), hash, 1, now, String(role)]
    );
    return NextResponse.json({ id: res.lastID });
  } catch (e) {
    if (String(e?.message||"").includes("UNIQUE")) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }
    throw e;
  }
}
