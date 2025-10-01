import { NextResponse } from "next/server";
import { seedIfEmpty, dbHelpers } from "@/lib/db";

export async function GET() {
  await seedIfEmpty();
  const rows = await dbHelpers.all("SELECT * FROM workflows ORDER BY id DESC");
  return NextResponse.json(rows);
}

export async function POST(req) {
  await seedIfEmpty();
  const body = await req.json();
  const { name, rule_json } = body || {};
  if (!name || !rule_json) return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  const res = await dbHelpers.run("INSERT INTO workflows (name, rule_json) VALUES (?,?)", [String(name).trim(), typeof rule_json === 'string' ? rule_json : JSON.stringify(rule_json)]);
  return NextResponse.json({ id: res.lastID });
}
