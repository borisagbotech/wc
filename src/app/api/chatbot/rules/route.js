import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { seedIfEmpty, dbHelpers } from "@/lib/db";

export async function GET() {
  await seedIfEmpty();
  const rows = await dbHelpers.all("SELECT * FROM chatbot_rules ORDER BY id DESC");
  return NextResponse.json(rows);
}

export async function POST(req) {
  await seedIfEmpty();
  const body = await req.json();
  const { keyword, match_type = "contains", reply } = body || {};
  if (!keyword || !reply) return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  const res = await dbHelpers.run("INSERT INTO chatbot_rules (keyword, match_type, reply) VALUES (?,?,?)", [String(keyword).trim(), String(match_type).trim(), String(reply).trim()]);
  return NextResponse.json({ id: res.lastID });
}
