import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";

export async function POST() {
  const nowIso = new Date().toISOString();
  const due = await dbHelpers.all(
    "SELECT * FROM jobs WHERE status='pending' AND execute_at <= ? ORDER BY execute_at ASC LIMIT 100",
    [nowIso]
  );
  let processed = 0;
  for (const job of due) {
    try {
      const payload = JSON.parse(job.payload_json || "{}");
      // For now we simulate execution by marking as done; in a real system, we'd send reminders, etc.
      await dbHelpers.run(
        "UPDATE jobs SET status='done', attempts=attempts+1 WHERE id=?",
        [job.id]
      );
      // If job relates to a campaign, log it
      if (payload.campaign_id) {
        await dbHelpers.run(
          "INSERT INTO campaign_logs (campaign_id, at, level, message) VALUES (?,?,?,?)",
          [payload.campaign_id, new Date().toISOString(), 'info', `Job ${job.type} exécuté`]
        );
      }
      processed++;
    } catch (e) {
      await dbHelpers.run(
        "UPDATE jobs SET status='failed', attempts=attempts+1 WHERE id=?",
        [job.id]
      );
    }
  }
  return NextResponse.json({ processed });
}

export async function GET() {
  // Convenience endpoint to check queue size
  const pending = await dbHelpers.get(
    "SELECT COUNT(*) AS n FROM jobs WHERE status='pending'"
  );
  return NextResponse.json({ pending: pending?.n || 0 });
}
