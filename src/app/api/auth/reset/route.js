import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  const row = await dbHelpers.get(
    "SELECT * FROM email_tokens WHERE token = ? AND type = 'reset' AND used = 0",
    [token]
  );
  if (!row) return NextResponse.json({ error: "Token invalide" }, { status: 400 });
  if (new Date(row.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "Token expiré" }, { status: 400 });
  const hash = await auth.hashPassword(password);
  await dbHelpers.transaction(async () => {
    await dbHelpers.run("UPDATE users SET password_hash = ? WHERE id = ?", [hash, row.user_id]);
    await dbHelpers.run("UPDATE email_tokens SET used = 1 WHERE id = ?", [row.id]);
  });
  return NextResponse.json({ ok: true });
}
