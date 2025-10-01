import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { auth } from "@/lib/auth";
import { dbHelpers } from "@/lib/db";

export async function GET(req) {
  const token = req.cookies.get(auth.cookieName)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });
  const payload = auth.verifySessionToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 200 });
  const user = await dbHelpers.get("SELECT id, name, email, email_verified FROM users WHERE id = ?", [payload.uid]);
  return NextResponse.json({ user });
}
