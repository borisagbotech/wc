import { NextResponse } from "next/server";
import { seedIfEmpty, dbHelpers } from "@/lib/db";

export async function GET() {
  await seedIfEmpty();
  const rows = await dbHelpers.all("SELECT id, question, answer FROM platform_faq ORDER BY id ASC");
  return NextResponse.json(rows);
}
