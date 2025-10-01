import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(auth.cookieName, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return res;
}
