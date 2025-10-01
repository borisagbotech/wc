import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";
import crypto from "crypto";

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });
  const user = await dbHelpers.get("SELECT * FROM users WHERE email = ?", [email]);
  // To avoid user enumeration, always respond ok
  if (user) {
    const token = crypto.randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    await dbHelpers.run(
      "INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES (?,?,?,?)",
      [user.id, token, "reset", expires]
    );
    const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset?token=${token}`;
    // Store last reset link in settings (for development/testing)
    await dbHelpers.run(
      "INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      ["last_reset_link", JSON.stringify({ email, link, at: new Date().toISOString() })]
    );
    console.log("Password reset link:", link);
  }
  return NextResponse.json({ ok: true });
}
