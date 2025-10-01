import { NextResponse } from "next/server";
import { getAudienceTags } from "@/lib/db";

export async function GET() {
  try {
    const tags = await getAudienceTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching audience tags:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tags d'audience" },
      { status: 500 }
    );
  }
}
