import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { seedIfEmpty, dbHelpers } from "@/lib/db";

export async function GET() {
  await seedIfEmpty();
  const contacts = await dbHelpers.all("SELECT * FROM contacts ORDER BY id DESC");
  const tagRows = await dbHelpers.all("SELECT contact_id, tag FROM contact_tags");
  const tagMap = new Map();
  for (const r of tagRows) {
    if (!tagMap.has(r.contact_id)) tagMap.set(r.contact_id, []);
    tagMap.get(r.contact_id).push(r.tag);
  }
  const result = contacts.map(c => ({
    ...c,
    flagged: !!c.flagged,
    tags: tagMap.get(c.id) || []
  }));
  return NextResponse.json(result);
}

export async function POST(req) {
  await seedIfEmpty();
  const body = await req.json();
  const { name, email = "", phone = "", tags = [], flagged = false } = body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nom obligatoire" }, { status: 400 });
  }
  const id = await dbHelpers.transaction(async () => {
    const res = await dbHelpers.run(
      "INSERT INTO contacts (name, email, phone, flagged) VALUES (?,?,?,?)",
      [name.trim(), email.trim(), phone.trim(), flagged ? 1 : 0]
    );
    const newId = res.lastID;
    for (const t of (Array.isArray(tags) ? tags : [])) {
      const tag = String(t).trim();
      if (tag) await dbHelpers.run("INSERT OR IGNORE INTO contact_tags (contact_id, tag) VALUES (?,?)", [newId, tag]);
    }
    return newId;
  });
  return NextResponse.json({ id });
}
