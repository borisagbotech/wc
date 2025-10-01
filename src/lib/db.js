import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

let db;

function init() {
  if (db) return db;
  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  const dbPath = path.join(dataDir, "app.db");
  const sqlite = sqlite3.verbose();
  db = new sqlite.Database(dbPath);
  return db;
}

export function getDb() {
  return init();
}

function run(sql, params = []) {
  const d = getDb();
  return new Promise((resolve, reject) => {
    d.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  const d = getDb();
  return new Promise((resolve, reject) => {
    d.get(sql, params, function (err, row) {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  const d = getDb();
  return new Promise((resolve, reject) => {
    d.all(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function exec(sql) {
  const d = getDb();
  return new Promise((resolve, reject) => {
    d.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

export async function getAllTags() {
  const rows = await all("SELECT DISTINCT tag FROM contact_tags ORDER BY tag");
  return rows.map((r) => r.tag);
}

export async function getAudienceTags() {
  const rows = await all("SELECT DISTINCT tag FROM audience_tags ORDER BY tag");
  return rows.map((r) => r.tag);
}

export async function transaction(fn) {
  try {
    await run("BEGIN");
    const res = await fn();
    await run("COMMIT");
    return res;
  } catch (e) {
    try { await run("ROLLBACK"); } catch {}
    throw e;
  }
}

export async function seedIfEmpty() {
  init();
  // Ensure schema
  await exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      flagged INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS contact_tags (
      contact_id INTEGER NOT NULL,
      tag TEXT NOT NULL,
      UNIQUE(contact_id, tag)
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Brouillon',
      message TEXT NOT NULL,
      mediaUrl TEXT,
      variables TEXT,
      schedule TEXT NOT NULL,
      sends INTEGER NOT NULL DEFAULT 0,
      conversion REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS campaign_tags (
      campaign_id INTEGER NOT NULL,
      tag TEXT NOT NULL,
      UNIQUE(campaign_id, tag)
    );
    CREATE TABLE IF NOT EXISTS campaign_media (
      campaign_id INTEGER NOT NULL,
      url TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stats_daily (
      date TEXT PRIMARY KEY,
      sent INTEGER DEFAULT 0,
      delivered INTEGER DEFAULT 0,
      read INTEGER DEFAULT 0,
      clicked INTEGER DEFAULT 0,
      replied INTEGER DEFAULT 0,
      failed INTEGER DEFAULT 0,
      optouts INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS chatbot_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      match_type TEXT NOT NULL DEFAULT 'contains',
      reply TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rule_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS campaign_workflows (
      campaign_id INTEGER NOT NULL,
      workflow_id INTEGER NOT NULL,
      UNIQUE(campaign_id, workflow_id)
    );
    -- Minimal auth tables
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Admin'
    );
    CREATE TABLE IF NOT EXISTS email_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
    -- Simple background jobs table
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      execute_at TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0
    );
    -- FAQ for platform help chatbot
    CREATE TABLE IF NOT EXISTS platform_faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS campaign_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      at TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'info',
      message TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      monthly_quota INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_code TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      ref TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Pending', 'Running', 'Completed', 'Failed', 'Paused')),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaign_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      recipient TEXT NOT NULL,
      message_status TEXT NOT NULL CHECK(message_status IN ('Queued', 'Sent', 'Delivered', 'Read', 'Failed')),
      error_reason TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
    );

    CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign_id ON campaign_logs(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
    CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

    CREATE TABLE IF NOT EXISTS audience_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure users.role column exists for migrated databases
  try {
    const cols = await all("PRAGMA table_info(users)");
    const hasRole = Array.isArray(cols) && cols.some(c => c.name === 'role');
    if (!hasRole) {
      await run("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'Admin'");
    }
  } catch {}

  const row = await get("SELECT COUNT(*) AS c FROM contacts");
  const cnt = row?.c || 0;
  if (cnt > 0) return;

  await transaction(async () => {
    const c1 = (await run("INSERT INTO contacts (name, email, phone, flagged) VALUES (?,?,?,?)", [
      "Alice Martin",
      "alice@example.com",
      "+33 6 12 34 56 78",
      1,
    ])).lastID;
    const c2 = (await run("INSERT INTO contacts (name, email, phone, flagged) VALUES (?,?,?,?)", [
      "Bruno Lambert",
      "bruno@example.com",
      "+33 7 11 22 33 44",
      0,
    ])).lastID;
    const c3 = (await run("INSERT INTO contacts (name, email, phone, flagged) VALUES (?,?,?,?)", [
      "Camille Durand",
      "camille@example.com",
      "+33 6 55 66 77 88",
      0,
    ])).lastID;

    for (const t of ["VIP", "Newsletter"]) await run("INSERT INTO contact_tags (contact_id, tag) VALUES (?,?)", [c1, t]);
    for (const t of ["Prospect"]) await run("INSERT INTO contact_tags (contact_id, tag) VALUES (?,?)", [c2, t]);
    for (const t of ["Client", "Paris"]) await run("INSERT INTO contact_tags (contact_id, tag) VALUES (?,?)", [c3, t]);

    const camp1 = (await run(
      "INSERT INTO campaigns (name,status,message,mediaUrl,variables,schedule,sends,conversion) VALUES (?,?,?,?,?,?,?,?)",
      [
        "Lancement Q4",
        "Brouillon",
        "Bonjour {{prenom}}",
        "",
        "prenom",
        "2025-10-01T09:00",
        0,
        0,
      ]
    )).lastID;
    const camp2 = (await run(
      "INSERT INTO campaigns (name,status,message,mediaUrl,variables,schedule,sends,conversion) VALUES (?,?,?,?,?,?,?,?)",
      [
        "Promo rentrée",
        "En pause",
        "-20% cette semaine",
        "",
        "",
        "2025-10-01T09:00",
        1200,
        4.1,
      ]
    )).lastID;
    const camp3 = (await run(
      "INSERT INTO campaigns (name,status,message,mediaUrl,variables,schedule,sends,conversion) VALUES (?,?,?,?,?,?,?,?)",
      [
        "Soldes été",
        "Active",
        "Dernier jour des soldes!",
        "https://example.com/visuel.jpg",
        "",
        "2025-10-02T11:00",
        9120,
        4.4,
      ]
    )).lastID;

    // Seed tags
    for (const t of ["VIP", "Client"]) await run("INSERT INTO campaign_tags (campaign_id, tag) VALUES (?,?)", [camp1, t]);
    for (const t of ["Prospect"]) await run("INSERT INTO campaign_tags (campaign_id, tag) VALUES (?,?)", [camp2, t]);
    for (const t of ["Client"]) await run("INSERT INTO campaign_tags (campaign_id, tag) VALUES (?,?)", [camp3, t]);

    // Seed campaign_media from existing mediaUrl values
    const medias = await all("SELECT id, mediaUrl FROM campaigns WHERE mediaUrl IS NOT NULL AND mediaUrl != ''");
    for (const m of medias) {
      await run("INSERT INTO campaign_media (campaign_id, url) VALUES (?,?)", [m.id, m.mediaUrl]);
    }

    // Seed stats_daily for the last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const iso = d.toISOString().slice(0,10);
      const sent = Math.floor(500 + Math.random()*1500);
      const delivered = Math.floor(sent * 0.95);
      const read = Math.floor(sent * (0.75 + Math.random()*0.15));
      const clicked = Math.floor(read * (0.08 + Math.random()*0.07));
      const replied = Math.floor(read * (0.03 + Math.random()*0.04));
      const failed = sent - delivered;
      const optouts = Math.floor(sent * (0.002 + Math.random()*0.003));
      await run("INSERT OR IGNORE INTO stats_daily (date,sent,delivered,read,clicked,replied,failed,optouts) VALUES (?,?,?,?,?,?,?,?)",
        [iso, sent, delivered, read, clicked, replied, failed, optouts]);
    }

    // Seed chatbot rules (legacy user auto-replies; kept for compatibility)
    await run("INSERT INTO chatbot_rules (keyword, match_type, reply) VALUES (?,?,?)", ["bonjour", "contains", "Bonjour. Comment puis-je vous aider ?"]);
    await run("INSERT INTO chatbot_rules (keyword, match_type, reply) VALUES (?,?,?)", ["prix", "contains", "Nos tarifs dépendent de votre besoin. Voulez-vous recevoir notre grille tarifaire ?"]);

    // Seed a sample workflow
    const sampleWorkflow = { type: "no_reply_reminder", delayHours: 24, message: "Petit rappel: avez-vous eu le temps de voir notre offre?" };
    await run("INSERT INTO workflows (name, rule_json) VALUES (?,?)", ["Rappel 24h sans réponse", JSON.stringify(sampleWorkflow)]);

    // Seed FAQ for platform help chatbot if empty
    const faqCount = (await get("SELECT COUNT(*) AS c FROM platform_faq"))?.c || 0;
    if (faqCount === 0) {
      const faqs = [
        ["Comment connecter WhatsApp Business ?", "Renseignez votre WhatsApp Access Token et Phone Number ID dans Paramètres > Intégrations, puis validez le webhook."],
        ["Comment créer une campagne ?", "Allez dans Campagnes, cliquez sur \"Nouvelle campagne\", complétez le message, les médias, les tags cibles et la date d’envoi (obligatoire)."],
        ["Importer des contacts", "Sur la page Contacts, utilisez \"Importer\" et chargez un CSV ou Excel avec les colonnes name, email, phone, tags, flagged."],
        ["Tags et audience", "Assignez des tags aux contacts. Les campagnes actives sélectionnent strictement les destinataires qui possèdent les tags choisis."],
        ["Automatisations", "Créez des workflows (ex: rappel si pas de réponse). Vous pouvez les lier à une campagne lors de l’édition."],
        ["Support", "Contactez l’équipe via support@example.com."]
      ];
      for (const [q, a] of faqs) await run("INSERT INTO platform_faq (question, answer) VALUES (?,?)", [q, a]);
    }
  });

  const hasAudienceTags = (await get("SELECT 1 FROM audience_tags LIMIT 1")) !== undefined;
  if (!hasAudienceTags) {
    const defaultTags = [
      'clients-fideles',
      'nouveaux-clients',
      'abonnes-newsletter',
      'panier-abandonne',
      'achat-recent',
      'categorie-1',
      'categorie-2'
    ];
    
    for (const tag of defaultTags) {
      try {
        await run("INSERT INTO audience_tags (tag) VALUES (?)", [tag]);
      } catch (e) {
        // Ignorer les erreurs de doublons
        if (!e.message.includes('UNIQUE constraint failed')) {
          throw e;
        }
      }
    }
  }
}

export const dbHelpers = { run, get, all, exec, transaction };
