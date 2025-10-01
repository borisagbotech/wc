import { NextResponse } from "next/server";
import { getAllTags, seedIfEmpty } from "@/lib/db";

export async function GET() {
  await seedIfEmpty();
  const tags = await getAllTags();
  return NextResponse.json(tags);
}
