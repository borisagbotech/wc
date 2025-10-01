import { NextResponse } from "next/server";
import { seedIfEmpty, dbHelpers } from "@/lib/db";

export async function GET() {
  await seedIfEmpty();
  const series = await dbHelpers.all("SELECT * FROM stats_daily ORDER BY date ASC");
  const totals = {
    sent: 0,
    delivered: 0,
    read: 0,
    clicked: 0,
    replied: 0,
    failed: 0,
    optouts: 0,
  };
  for (const r of series) {
    totals.sent += r.sent || 0;
    totals.delivered += r.delivered || 0;
    totals.read += r.read || 0;
    totals.clicked += r.clicked || 0;
    totals.replied += r.replied || 0;
    totals.failed += r.failed || 0;
    totals.optouts += r.optouts || 0;
  }
  return NextResponse.json({ totals, series });
}
