import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";
import { auth } from "@/lib/auth";

async function ensureAdmin(req) {
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return { status: 401, err: "Non autorisé" };
  const me = await dbHelpers.get("SELECT role FROM users WHERE id=?", [payload.uid]);
  if (!me || me.role !== 'Admin') return { status: 403, err: "Réservé aux administrateurs" };
  return { ok: true };
}

export async function PUT(req, { params }) {
  const guard = await ensureAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.err }, { status: guard.status });
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  const body = await req.json();
  const { name, email, role, password } = body || {};
  const current = await dbHelpers.get("SELECT * FROM users WHERE id=?", [id]);
  if (!current) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  const updates = [];
  const paramsArr = [];
  if (name !== undefined) { updates.push("name=?"); paramsArr.push(String(name)); }
  if (email !== undefined) { updates.push("email=?"); paramsArr.push(String(email)); }
  if (role !== undefined) { updates.push("role=?"); paramsArr.push(String(role)); }
  if (password) {
    const hash = await (await import("@/lib/auth")).auth.hashPassword(password);
    updates.push("password_hash=?"); paramsArr.push(hash);
  }
  if (!updates.length) return NextResponse.json({ ok: true });
  paramsArr.push(id);
  try {
    await dbHelpers.run(`UPDATE users SET ${updates.join(",")} WHERE id=?`, paramsArr);
  } catch (e) {
    if (String(e?.message||"").includes("UNIQUE")) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }
    throw e;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const guard = await ensureAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.err }, { status: guard.status });
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  await dbHelpers.run("DELETE FROM users WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
}
