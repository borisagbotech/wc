import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { dbHelpers } from "@/lib/db";

async function countRecipientsByTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return 0;
  const placeholders = tags.map(() => "?").join(",");
  const sql = `
    SELECT COUNT(DISTINCT c.id) AS n
    FROM contacts c
    JOIN contact_tags t ON t.contact_id = c.id
    WHERE t.tag IN (${placeholders})
  `;
  const row = await dbHelpers.get(sql, tags);
  return row?.n || 0;
}

export async function PUT(req, { params }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  const body = await req.json();
  const { name, status, message, mediaUrl, mediaUrls, variables, schedule, audienceTags, workflowIds } = body || {};

  try {
    await dbHelpers.transaction(async () => {
      const exists = await dbHelpers.get("SELECT id FROM campaigns WHERE id = ?", [id]);
      if (!exists) throw new Error("NOT_FOUND");

      const current = await dbHelpers.get("SELECT * FROM campaigns WHERE id = ?", [id]);

      // Validate schedule if provided
      if (schedule !== undefined) {
        if (!schedule || isNaN(Date.parse(schedule))) throw new Error("BAD_SCHEDULE");
        const ts = Date.parse(schedule);
        if (ts < Date.now()) throw new Error("PAST_SCHEDULE");
      }

      // Determine primary media URL if provided
      const providedMedia = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrl !== undefined ? [String(mediaUrl)] : null);
      const primary = providedMedia ? (providedMedia[0] || "") : undefined;

      await dbHelpers.run(
        "UPDATE campaigns SET name=?, status=?, message=?, mediaUrl=?, variables=?, schedule=? WHERE id=?",
        [
          name !== undefined ? String(name) : current.name,
          status !== undefined ? String(status) : current.status,
          message !== undefined ? String(message) : current.message,
          primary !== undefined ? String(primary) : current.mediaUrl,
          variables !== undefined ? String(variables) : current.variables,
          schedule !== undefined ? String(schedule) : current.schedule,
          id,
        ]
      );

      if (Array.isArray(audienceTags)) {
        await dbHelpers.run("DELETE FROM campaign_tags WHERE campaign_id = ?", [id]);
        for (const t of audienceTags) {
          const tag = String(t).trim();
          if (tag) await dbHelpers.run("INSERT OR IGNORE INTO campaign_tags (campaign_id, tag) VALUES (?,?)", [id, tag]);
        }
      }

      // Update media URLs if provided
      if (providedMedia) {
        await dbHelpers.run("DELETE FROM campaign_media WHERE campaign_id = ?", [id]);
        for (const u of providedMedia) {
          const url = String(u || "").trim();
          if (url) await dbHelpers.run("INSERT INTO campaign_media (campaign_id, url) VALUES (?,?)", [id, url]);
        }
      }

      // Sync linked workflows if provided
      if (Array.isArray(workflowIds)) {
        await dbHelpers.run("DELETE FROM campaign_workflows WHERE campaign_id = ?", [id]);
        for (const wid of workflowIds) {
          const n = Number(wid);
          if (n) await dbHelpers.run("INSERT OR IGNORE INTO campaign_workflows (campaign_id, workflow_id) VALUES (?,?)", [id, n]);
        }
      }

      // If status becomes Active, recompute sends strictly by tags and enqueue jobs per linked workflows
      const newStatus = status !== undefined ? String(status) : current.status;
      if (newStatus === "Active") {
        const tags = (Array.isArray(audienceTags) ? audienceTags : undefined) ?? (await dbHelpers.all(
          "SELECT tag FROM campaign_tags WHERE campaign_id = ?",
          [id]
        )).map((r) => r.tag);
        const sends = await countRecipientsByTags(tags);
        await dbHelpers.run("UPDATE campaigns SET sends=? WHERE id=?", [sends, id]);
        // Log activation
        await dbHelpers.run("INSERT INTO campaign_logs (campaign_id, at, level, message) VALUES (?,?,?,?)", [id, new Date().toISOString(), 'info', `Campagne activée. Destinataires estimés: ${sends}`]);

        // Determine effective schedule
        const effSchedule = schedule !== undefined ? String(schedule) : current.schedule;
        const baseTs = Date.parse(effSchedule);
        if (isFinite(baseTs)) {
          // Get linked workflows (from provided ids or DB)
          let wids = Array.isArray(workflowIds) ? workflowIds.map(Number).filter(Boolean) : undefined;
          if (!wids) {
            const rows = await dbHelpers.all("SELECT workflow_id FROM campaign_workflows WHERE campaign_id=?", [id]);
            wids = rows.map(r => r.workflow_id);
          }
          if (wids && wids.length) {
            const placeholders = wids.map(()=>"?").join(",");
            const wfRows = await dbHelpers.all(`SELECT id, rule_json FROM workflows WHERE id IN (${placeholders})`, wids);
            for (const wf of wfRows) {
              try {
                const rule = JSON.parse(wf.rule_json || "{}");
                if (rule.type === "no_reply_reminder") {
                  const delayH = Number(rule.delayHours || 0);
                  const execAt = new Date(baseTs + delayH * 3600 * 1000).toISOString();
                  const payload = { campaign_id: id, workflow_id: wf.id, action: "send_reminder", message: rule.message || "" };
                  await dbHelpers.run(
                    "INSERT INTO jobs (type, execute_at, payload_json, status) VALUES (?,?,?, 'pending')",
                    ["workflow:no_reply_reminder", execAt, JSON.stringify(payload)]
                  );
                }
              } catch {}
            }
          }
        }
      }
    });
  } catch (e) {
    if (e.message === "NOT_FOUND") return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    if (e.message === "BAD_SCHEDULE") return NextResponse.json({ error: "Horaire invalide" }, { status: 400 });
    if (e.message === "PAST_SCHEDULE") return NextResponse.json({ error: "L’horaire doit être dans le futur" }, { status: 400 });
    throw e;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  await dbHelpers.transaction(async () => {
    await dbHelpers.run("DELETE FROM campaign_tags WHERE campaign_id = ?", [id]);
    await dbHelpers.run("DELETE FROM campaigns WHERE id = ?", [id]);
  });
  return NextResponse.json({ ok: true });
}
