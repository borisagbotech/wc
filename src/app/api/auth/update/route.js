import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { auth } from "@/lib/auth";
import { dbHelpers } from "@/lib/db";

export async function POST(req) {
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const { name, email, password } = body || {};
  if (!name && !email && !password) return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });

  // Validate
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email !== "admin") {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const updates = [];
  const params = [];
  if (name) { updates.push("name = ?"); params.push(name); }
  if (email) { updates.push("email = ?"); params.push(email); }
  if (password) {
    const hash = await auth.hashPassword(password);
    updates.push("password_hash = ?"); params.push(hash);
  }
  params.push(payload.uid);

  try {
    await dbHelpers.run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
  } catch (e) {
    if (String(e?.message||"").includes("UNIQUE")) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}
