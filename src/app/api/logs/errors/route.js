import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";

export async function GET() {
  const rows = await dbHelpers.all("SELECT campaign_id, at, message FROM campaign_logs WHERE level='error' ORDER BY at DESC LIMIT 100");
  return NextResponse.json(rows);
}
