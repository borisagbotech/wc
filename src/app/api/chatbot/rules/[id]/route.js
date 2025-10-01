import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";

export async function PUT(req, { params }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  const body = await req.json();
  const { keyword, match_type, reply } = body || {};
  const current = await dbHelpers.get("SELECT * FROM chatbot_rules WHERE id=?", [id]);
  if (!current) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  await dbHelpers.run("UPDATE chatbot_rules SET keyword=?, match_type=?, reply=? WHERE id=?", [
    keyword !== undefined ? String(keyword) : current.keyword,
    match_type !== undefined ? String(match_type) : current.match_type,
    reply !== undefined ? String(reply) : current.reply,
    id,
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  await dbHelpers.run("DELETE FROM chatbot_rules WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
}
