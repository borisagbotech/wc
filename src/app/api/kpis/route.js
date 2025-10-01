import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { seedIfEmpty, dbHelpers } from "@/lib/db";

export async function GET() {
  await seedIfEmpty();
  // Active clients: contacts tagged 'Client'
  const activeClients = (await dbHelpers.get(
    "SELECT COUNT(DISTINCT c.id) AS n FROM contacts c JOIN contact_tags t ON t.contact_id=c.id WHERE t.tag='Client'"
  ))?.n || 0;
  // Active campaigns by status
  const activeCampaigns = (await dbHelpers.get(
    "SELECT COUNT(*) AS n FROM campaigns WHERE status='Active'"
  ))?.n || 0;
  // Total messages sent
  const totalMessages = (await dbHelpers.get(
    "SELECT COALESCE(SUM(sends),0) AS n FROM campaigns"
  ))?.n || 0;
  // Quota usage: sum of last 30 days sent vs monthly_quota setting or default 10000
  const quotaRow = await dbHelpers.get("SELECT value FROM settings WHERE key='monthly_quota'");
  let monthlyQuota = 10000;
  try { if (quotaRow?.value) monthlyQuota = JSON.parse(quotaRow.value); } catch {}
  if (!Number.isFinite(Number(monthlyQuota))) monthlyQuota = 10000;
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString().slice(0,10);
  const sent30 = (await dbHelpers.get(
    "SELECT COALESCE(SUM(sent),0) AS n FROM stats_daily WHERE date >= ?",
    [sinceIso]
  ))?.n || 0;
  const usage = monthlyQuota ? Math.min(100, Math.round((sent30 / monthlyQuota) * 100)) : 0;
  return NextResponse.json({ activeClients, activeCampaigns, totalMessages, monthlyQuota, sent30, usage });
}
