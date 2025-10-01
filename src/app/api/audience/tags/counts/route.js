import { NextResponse } from "next/server";
import { dbHelpers } from "@/lib/db";
const { all } = dbHelpers;

export async function GET() {
  try {
    // Récupérer tous les tags d'audience uniques
    const tags = await all("SELECT DISTINCT tag FROM audience_tags ORDER BY tag");
    const tagList = tags.map(t => t.tag);

    // Récupérer le nombre de contacts pour chaque tag
    const counts = {};
    for (const tag of tagList) {
      const result = await all(
        `SELECT COUNT(DISTINCT c.id) as count 
         FROM contacts c
         JOIN contact_tags ct ON c.id = ct.contact_id
         WHERE ct.tag = ?`,
        [tag]
      );
      counts[tag] = result[0]?.count || 0;
    }

    return NextResponse.json({
      tags: tagList,
      counts
    });

  } catch (error) {
    console.error("Error fetching tag counts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques des tags" },
      { status: 500 }
    );
  }
}
