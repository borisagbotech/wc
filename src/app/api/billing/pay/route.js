import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req) {
  const token = req.cookies.get(auth.cookieName)?.value;
  const payload = token ? auth.verifySessionToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const { invoice_id, provider = 'mock' } = body || {};
  const invoice = await dbHelpers.get("SELECT * FROM invoices WHERE id=? AND user_id=?", [Number(invoice_id), payload.uid]);
  if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  if (invoice.status === 'paid') return NextResponse.json({ ok: true });
  const now = new Date().toISOString();
  const ref = `PAY-${Date.now()}`;
  await dbHelpers.transaction(async () => {
    await dbHelpers.run("INSERT INTO payments (invoice_id, provider, ref, amount_cents, status, created_at) VALUES (?,?,?,?,?,?)",
      [invoice.id, provider, ref, invoice.amount_cents, 'succeeded', now]);
    await dbHelpers.run("UPDATE invoices SET status='paid' WHERE id=?", [invoice.id]);
    // Optional: update settings monthly_quota based on plan
    const plan = await dbHelpers.get("SELECT monthly_quota FROM plans WHERE code=?", [invoice.plan_code]);
    if (plan) {
      await dbHelpers.run("INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        ['monthly_quota', String(plan.monthly_quota)]);
    }
  });
  return NextResponse.json({ ok: true, ref });
}
