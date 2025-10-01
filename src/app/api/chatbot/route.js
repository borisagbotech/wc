import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { seedIfEmpty, dbHelpers } from "@/lib/db";

function score(q, text) {
  q = (q || "").toLowerCase().trim();
  text = (text || "").toLowerCase();
  if (!q) return 0;
  let s = 0;
  for (const token of q.split(/\s+/)) {
    if (token && text.includes(token)) s += 1;
  }
  return s;
}

export async function POST(req) {
  await seedIfEmpty();
  const { question } = await req.json();
  const q = String(question || "").trim();
  if (!q) return NextResponse.json({ answer: "Veuillez saisir une question." }, { status: 400 });
  const faqs = await dbHelpers.all("SELECT question, answer FROM platform_faq");
  let best = null;
  let bestScore = -1;
  for (const f of faqs) {
    const s = score(q, f.question + "\n" + f.answer);
    if (s > bestScore) { bestScore = s; best = f; }
  }
  if (!best) return NextResponse.json({ answer: "Je n'ai pas trouvé d'information à ce sujet. Consultez la documentation dans Paramètres." });
  return NextResponse.json({ answer: best.answer, matchedQuestion: best.question });
}
