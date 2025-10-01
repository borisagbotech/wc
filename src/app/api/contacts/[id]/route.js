import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";

export async function PUT(req, { params }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  const body = await req.json();
  const { name, email, phone, flagged, tags } = body || {};
  try {
    await dbHelpers.transaction(async () => {
      if (name !== undefined || email !== undefined || phone !== undefined || flagged !== undefined) {
        const c = await dbHelpers.get("SELECT id FROM contacts WHERE id = ?", [id]);
        if (!c) throw new Error("NOT_FOUND");
        const current = await dbHelpers.get("SELECT * FROM contacts WHERE id = ?", [id]);
        await dbHelpers.run(
          "UPDATE contacts SET name=?, email=?, phone=?, flagged=? WHERE id=?",
          [
            name !== undefined ? String(name) : current.name,
            email !== undefined ? String(email) : current.email,
            phone !== undefined ? String(phone) : current.phone,
            flagged !== undefined ? (flagged ? 1 : 0) : current.flagged,
            id,
          ]
        );
      }
      if (Array.isArray(tags)) {
        await dbHelpers.run("DELETE FROM contact_tags WHERE contact_id = ?", [id]);
        for (const t of tags) {
          const tag = String(t).trim();
          if (tag) await dbHelpers.run("INSERT OR IGNORE INTO contact_tags (contact_id, tag) VALUES (?,?)", [id, tag]);
        }
      }
    });
  } catch (e) {
    if (e.message === "NOT_FOUND") return NextResponse.json({ error: "Contact introuvable" }, { status: 404 });
    throw e;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  await dbHelpers.transaction(async () => {
    await dbHelpers.run("DELETE FROM contact_tags WHERE contact_id = ?", [id]);
    await dbHelpers.run("DELETE FROM contacts WHERE id = ?", [id]);
  });
  return NextResponse.json({ ok: true });
}
