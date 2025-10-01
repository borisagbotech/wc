"use client";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import * as XLSX from "xlsx";

function Tag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 mr-1 mb-1">
      <span>{label}</span>
      {onRemove && (
        <button onClick={onRemove} className="hover:text-gray-900" aria-label={`Supprimer le tag ${label}`}>×</button>
      )}
    </span>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Alice Martin", email: "alice@example.com", phone: "+33 6 12 34 56 78", tags: ["VIP", "Newsletter"], flagged: true },
    { id: 2, name: "Bruno Lambert", email: "bruno@example.com", phone: "+33 7 11 22 33 44", tags: ["Prospect"], flagged: false },
    { id: 3, name: "Camille Durand", email: "camille@example.com", phone: "+33 6 55 66 77 88", tags: ["Client", "Paris"], flagged: false },
  ]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", tags: "" });
  // Filtres et import
  const [selectedTags, setSelectedTags] = useState([]); // multi-sélection
  const [flagOnly, setFlagOnly] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState("");

  async function refresh() {
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      if (Array.isArray(data)) setContacts(data);
    } catch {}
  }
  useEffect(() => { refresh(); }, []);

  const allTags = useMemo(() => Array.from(new Set(contacts.flatMap(c => c.tags || []))).sort(), [contacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = contacts;
    if (q) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length) {
      list = list.filter(c => (c.tags || []).some(t => selectedTags.includes(t)));
    }
    if (flagOnly) {
      list = list.filter(c => c.flagged);
    }
    return list;
  }, [contacts, search, selectedTags, flagOnly]);

  function resetForm() {
    setForm({ name: "", email: "", phone: "", tags: "" });
  }

  async function handleAddContact(e) {
    e?.preventDefault?.();
    if (!form.name.trim()) return;
    const tags = form.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
    try {
      await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), tags, flagged: false
      })});
      await refresh();
      resetForm();
      setIsModalOpen(false);
    } catch {
      alert("Erreur lors de l’ajout");
    }
  }

  async function toggleFlag(id) {
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    try {
      await fetch(`/api/contacts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flagged: !c.flagged }) });
      await refresh();
    } catch {}
  }

  async function addTag(id, tag) {
    const t = tag.trim();
    if (!t) return;
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    const nextTags = Array.from(new Set([...(c.tags||[]), t]));
    try {
      await fetch(`/api/contacts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: nextTags }) });
      await refresh();
    } catch {}
  }

  async function removeTag(id, tag) {
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    const nextTags = (c.tags||[]).filter(x => x !== tag);
    try {
      await fetch(`/api/contacts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: nextTags }) });
      await refresh();
    } catch {}
  }

  // --- Import CSV ---
  function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (lines.length === 0) return { rows: [], error: "Fichier vide" };
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const get = (arr, key) => arr[headers.indexOf(key)] ?? "";

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i];
      const cols = raw.split(",");
      if (!cols.length) continue;
      const name = get(cols, "name") || get(cols, "nom") || "";
      const email = get(cols, "email");
      const phone = get(cols, "phone") || get(cols, "tele") || get(cols, "téléphone") || get(cols, "telephone");
      const tagsRaw = get(cols, "tags");
      const flaggedRaw = (get(cols, "flagged") || get(cols, "flag") || "").toLowerCase();
      const flagged = ["true","1","yes","oui","y"].includes(flaggedRaw);
      const tags = tagsRaw
        ? tagsRaw.split(/[;|]/).map(t => t.trim()).filter(Boolean)
        : [];
      if (!name && !email && !phone) continue;
      rows.push({ name: name.trim(), email: (email||"").trim(), phone: (phone||"").trim(), tags, flagged });
    }
    return { rows, error: "" };
  }

  function handleImportFile(file) {
    setImportError("");
    setImportPreview([]);
    if (!file) return;
    const isXlsx = /\.xlsx$/i.test(file.name) || (file.type && file.type.includes("sheet"));
    if (isXlsx) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result);
          const wb = XLSX.read(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
          const lines = json.filter(r => r && r.length).map(r => r.map(c => String(c ?? "")));
          if (lines.length === 0) { setImportError("Fichier vide"); return; }
          const headers = lines[0].map(h => h.toLowerCase());
          const idx = (k) => headers.indexOf(k);
          const rows = [];
          for (let i = 1; i < lines.length; i++) {
            const arr = lines[i];
            const name = arr[idx("name")] || arr[idx("nom")] || "";
            const email = arr[idx("email")] || "";
            const phone = arr[idx("phone")] || arr[idx("tele")] || arr[idx("téléphone")] || arr[idx("telephone")] || "";
            const tagsRaw = arr[idx("tags")] || "";
            const flaggedRaw = String(arr[idx("flagged")] || arr[idx("flag")] || "").toLowerCase();
            const flagged = ["true","1","yes","oui","y"].includes(flaggedRaw);
            const tags = tagsRaw ? String(tagsRaw).split(/[;|,]/).map(t=>t.trim()).filter(Boolean) : [];
            if (!name && !email && !phone) continue;
            rows.push({ name: name.trim(), email: email.trim(), phone: phone.trim(), tags, flagged });
          }
          if (!rows.length) { setImportError("Aucune ligne valide trouvée."); return; }
          setImportPreview(rows);
        } catch (e) {
          setImportError("Erreur de parsing XLSX");
        }
      };
      reader.onerror = () => setImportError("Impossible de lire le fichier.");
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || "");
          const { rows, error } = parseCsv(text);
          if (error) {
            setImportError(error);
          } else if (!rows.length) {
            setImportError("Aucune ligne valide trouvée.");
          } else {
            setImportPreview(rows);
          }
        } catch (e) {
          setImportError("Erreur lors de la lecture du fichier.");
        }
      };
      reader.onerror = () => setImportError("Impossible de lire le fichier.");
      reader.readAsText(file);
    }
  }

  async function confirmImport() {
    if (!importPreview.length) return;
    try {
      for (const r of importPreview) {
        await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
      }
      await refresh();
      setIsImportOpen(false);
      setImportPreview([]);
      setImportError("");
    } catch {
      setImportError("Erreur lors de l’import");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Contacts</h1>
              <div className="flex items-center gap-2">
                <div className="relative w-40 sm:w-56">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  ⇪ Importer
                </button>
                <button
                  onClick={() => alert('Intégration CRM à venir (HubSpot, Pipedrive) — configurez vos clés API dans Paramètres).')}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  🔗 Connecter CRM
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-3 py-2 text-sm font-medium hover:bg-green-700"
                >
                  + Ajouter un contact
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Filtres */}
            <section className="bg-white border rounded-xl p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-sm text-gray-600">Filtrer par tags:</div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.length === 0 && (
                      <span className="text-xs text-gray-400">Aucun tag</span>
                    )}
                    {allTags.map(tag => (
                      <label key={tag} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs cursor-pointer ${selectedTags.includes(tag) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedTags.includes(tag)}
                          onChange={(e) => {
                            setSelectedTags(prev => e.target.checked ? [...prev, tag] : prev.filter(t => t !== tag));
                          }}
                        />
                        <span>#{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={flagOnly} onChange={(e) => setFlagOnly(e.target.checked)} />
                    <span>Seulement les contacts flaggés</span>
                  </label>
                  {(selectedTags.length > 0 || flagOnly) && (
                    <button onClick={() => { setSelectedTags([]); setFlagOnly(false); }} className="text-xs text-gray-600 underline">Réinitialiser les filtres</button>
                  )}
                </div>
              </div>
            </section>

            {/* Tableau */}
            <section className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="font-medium">Tous les contacts</h2>
                <span className="text-xs text-gray-500">{filtered.length} contact(s)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left font-medium px-4 py-2">Nom</th>
                      <th className="text-left font-medium px-4 py-2">Email</th>
                      <th className="text-left font-medium px-4 py-2">Téléphone</th>
                      <th className="text-left font-medium px-4 py-2">Tags</th>
                      <th className="text-center font-medium px-4 py-2">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((c) => (
                      <tr key={c.id} className="align-top">
                        <td className="px-4 py-3">
                          <div className="font-medium">{c.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-800">{c.email}</div>
                        </td>
                        <td className="px-4 py-3">{c.phone}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap">
                            {(c.tags||[]).map(tag => (
                              <Tag key={tag} label={tag} onRemove={() => removeTag(c.id, tag)} />
                            ))}
                          </div>
                          <AddTagInput onAdd={(t) => addTag(c.id, t)} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleFlag(c.id)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border ${c.flagged ? "bg-yellow-100 border-yellow-300 text-yellow-700" : "hover:bg-gray-100"}`}
                            title={c.flagged ? "Retirer le flag" : "Marquer"}
                            aria-label="Basculer le flag"
                          >
                            {c.flagged ? "★" : "☆"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                          Aucun contact ne correspond à votre recherche.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <AddContactModal
          form={form}
          setForm={setForm}
          onClose={() => { setIsModalOpen(false); }}
          onSave={handleAddContact}
        />
      )}

      {isImportOpen && (
        <ImportContactsModal
          error={importError}
          preview={importPreview}
          onClose={() => { setIsImportOpen(false); setImportPreview([]); setImportError(""); }}
          onFile={handleImportFile}
          onConfirm={confirmImport}
        />
      )}
    </div>
  );
}

function AddTagInput({ onAdd }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onAdd(value); setValue(""); }}
      className="mt-2 flex items-center gap-2"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="text"
        placeholder="Ajouter un tag"
        className="w-40 rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
      <button className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50">Ajouter</button>
    </form>
  );
}

function AddContactModal({ form, setForm, onClose, onSave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-xl border shadow-lg">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Nouveau contact</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <form onSubmit={onSave} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Nom</label>
              <input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                type="text"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Téléphone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tags (séparés par des virgules)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border">Annuler</button>
            <button type="submit" className="px-3 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-black">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}


function ImportContactsModal({ error, preview, onClose, onFile, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-xl border shadow-lg">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Importer des contacts</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Fichier CSV</label>
            <input
              type="file"
              accept=".csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-black"
            />
            <div className="mt-2 text-xs text-gray-500">
              Colonnes supportées: name, email, phone, tags, flagged. Exemple: <code>name,email,phone,tags,flagged</code>
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</div>
          )}
          {preview.length > 0 && (
            <div className="bg-gray-50 border rounded-md p-3">
              <div className="font-medium mb-2">Aperçu: {preview.length} contact(s) détecté(s)</div>
              <ul className="list-disc pl-5 space-y-1">
                {preview.slice(0, 5).map((r, idx) => (
                  <li key={idx} className="text-gray-700">
                    <span className="font-medium">{r.name || (r.email || r.phone)}</span>
                    {r.tags?.length ? <span className="text-gray-500"> — tags: {r.tags.join(", ")}</span> : null}
                  </li>
                ))}
                {preview.length > 5 && (
                  <li className="text-gray-500">… et {preview.length - 5} de plus</li>
                )}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border">Annuler</button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={preview.length === 0}
              className={`px-3 py-2 text-sm rounded-md ${preview.length === 0 ? "bg-gray-300 text-gray-600" : "bg-gray-900 text-white hover:bg-black"}`}
            >
              Importer {preview.length > 0 ? `(${preview.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
