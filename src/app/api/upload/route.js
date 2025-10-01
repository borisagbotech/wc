import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const form = await req.formData();
    const files = form.getAll("files");
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }
    const pubDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

    const urls = [];
    for (const file of files) {
      if (!file || !file.name) continue;
      const type = file.type || "";
      if (!(type.startsWith("image/") || type.startsWith("video/"))) {
        return NextResponse.json({ error: `Type non supporté: ${type}` }, { status: 400 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const ts = Date.now();
      const filename = `${ts}-${safeName}`;
      const full = path.join(pubDir, filename);
      fs.writeFileSync(full, buf);
      urls.push(`/uploads/${filename}`);
    }
    return NextResponse.json({ urls });
  } catch (e) {
    return NextResponse.json({ error: "Upload échoué" }, { status: 500 });
  }
}
