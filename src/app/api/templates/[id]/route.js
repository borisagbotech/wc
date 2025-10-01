import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireAuth(req) {
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return null;
  return payload;
}

export async function PUT(req, { params }) {
  const me = await requireAuth(req);
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  const body = await req.json();
  const { name, category, body: content } = body || {};
  const current = await dbHelpers.get("SELECT * FROM templates WHERE id=?", [id]);
  if (!current) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  await dbHelpers.run("UPDATE templates SET name=?, category=?, body=? WHERE id=?", [
    name !== undefined ? String(name) : current.name,
    category !== undefined ? String(category) : current.category,
    content !== undefined ? String(content) : current.body,
    id,
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const me = await requireAuth(req);
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  await dbHelpers.run("DELETE FROM templates WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
}
