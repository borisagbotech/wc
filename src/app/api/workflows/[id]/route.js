import { NextResponse } from "next/server";
import { dbHelpers } from "@/lib/db";

export async function PUT(req, { params }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  const body = await req.json();
  const { name, rule_json } = body || {};
  const current = await dbHelpers.get("SELECT * FROM workflows WHERE id=?", [id]);
  if (!current) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  await dbHelpers.run("UPDATE workflows SET name=?, rule_json=? WHERE id=?", [
    name !== undefined ? String(name) : current.name,
    rule_json !== undefined ? (typeof rule_json === 'string' ? rule_json : JSON.stringify(rule_json)) : current.rule_json,
    id,
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  await dbHelpers.run("DELETE FROM workflows WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
}
