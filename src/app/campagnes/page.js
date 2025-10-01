"use client";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import TagSelector from "../components/TagSelector";
import TimeField from "../components/TimeField";
import Modal from "../components/ui/Modal";
import WhatsAppPreview from "../components/WhatsAppPreview";
import Link from "next/link";

const initialCampaigns = [
  { id: 1, name: "Lancement Q4", status: "Brouillon", message: "Bonjour {{prenom}}, découvrez notre nouveau produit!", mediaUrl: "", variables: "prenom", audienceTags: ["VIP", "Client"], schedule: "", sends: 0, conversion: 0 },
  { id: 2, name: "Promo rentrée", status: "En pause", message: "-20% cette semaine", mediaUrl: "", variables: "", audienceTags: ["Prospect"], schedule: "2025-10-01T09:00", sends: 1200, conversion: 4.1 },
  { id: 3, name: "Soldes été", status: "Active", message: "Dernier jour des soldes!", mediaUrl: "https://example.com/visuel.jpg", variables: "", audienceTags: ["Client"], schedule: "", sends: 9120, conversion: 4.4 },
];

const statuses = ["Brouillon", "Active", "En pause", "Terminé"];

export default function CampagnesPage() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(null); // null | {id?...}
  const [details, setDetails] = useState(null); // null | {id?...}
  const [workflows, setWorkflows] = useState([]);

  async function refresh() {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : initialCampaigns);
    } catch {
      // keep existing
    }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { fetch('/api/workflows').then(r=>r.json()).then(setWorkflows).catch(()=>setWorkflows([])); }, []);

  const filtered = useMemo(() => {
    let list = campaigns;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.message.toLowerCase().includes(q));
    if (statusFilter) list = list.filter(c => c.status === statusFilter);
    return list;
  }, [campaigns, search, statusFilter]);

  function openNew() {
    const def = new Date(Date.now() + 60 * 60 * 1000);
    const isoLocal = new Date(def.getTime() - def.getTimezoneOffset()*60000).toISOString().slice(0,16);
    setEditing({ id: 0, name: "", status: "Brouillon", message: "", mediaUrl: "", mediaUrls: [], variables: "", audienceTags: [], workflowIds: [], schedule: isoLocal, sends: 0, conversion: 0 });
  }
  function openEdit(c) {
    setEditing({ ...c, audienceTags: [...(c.audienceTags||[])], workflowIds: [...(c.workflowIds||[])], mediaUrls: [...(c.mediaUrls|| (c.mediaUrl ? [c.mediaUrl] : []))] });
  }
  async function saveCampaign(data) {
    const errs = [];
    if (!data.name.trim()) errs.push("Nom obligatoire");
    if (!data.message.trim()) errs.push("Message obligatoire");
    if (!data.schedule) errs.push("Horaire obligatoire");
    const ts = Date.parse(data.schedule);
    if (!isFinite(ts) || ts < Date.now()) errs.push("Horaire invalide ou passé");
    if (errs.length) { alert(errs.join("\n")); return; }

    try {
      if (data.id && data.id !== 0) {
        await fetch(`/api/campaigns/${data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          name: data.name,
          status: data.status,
          message: data.message,
          mediaUrls: data.mediaUrls || (data.mediaUrl ? [data.mediaUrl] : []),
          variables: data.variables,
          schedule: data.schedule,
          audienceTags: data.audienceTags,
          workflowIds: data.workflowIds || [],
        }) });
      } else {
        await fetch(`/api/campaigns`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          name: data.name,
          status: data.status,
          message: data.message,
          mediaUrls: data.mediaUrls || (data.mediaUrl ? [data.mediaUrl] : []),
          variables: data.variables,
          schedule: data.schedule,
          audienceTags: data.audienceTags,
          workflowIds: data.workflowIds || [],
        }) });
      }
      await refresh();
      setEditing(null);
    } catch (e) {
      alert("Erreur lors de l’enregistrement");
    }
  }
  async function removeCampaign(id) {
    if (!confirm("Supprimer cette campagne ?")) return;
    try {
      await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      await refresh();
    } catch {
      alert("Suppression échouée");
    }
  }
  async function duplicateCampaign(c) {
    try {
      await fetch(`/api/campaigns`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: c.name + " (copie)",
        status: "Brouillon",
        message: c.message,
        mediaUrl: c.mediaUrl,
        variables: c.variables,
        schedule: c.schedule || new Date(Date.now()+3600000 - new Date().getTimezoneOffset()*60000).toISOString().slice(0,16),
        audienceTags: c.audienceTags || [],
      })});
      await refresh();
    } catch {
      alert("Duplication échouée");
    }
  }
  async function toggleStatus(c) {
    const next = c.status === "Active" ? "En pause" : c.status === "En pause" ? "Active" : c.status === "Brouillon" ? "Active" : "Terminé";
    try {
      await fetch(`/api/campaigns/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      await refresh();
    } catch {
      alert("Changement de statut échoué");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Campagnes</h1>
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
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border rounded-md px-2 py-2 bg-white">
                  <option value="">Tous statuts</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Link href="/campagnes/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-3 py-2 text-sm font-medium hover:bg-green-700">+ Nouvelle campagne</Link>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 space-y-4">
            <section className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="font-medium">Toutes les campagnes</h2>
                <span className="text-xs text-gray-500">{filtered.length} campagne(s)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left font-medium px-4 py-2">Nom</th>
                      <th className="text-left font-medium px-4 py-2">Statut</th>
                      <th className="text-left font-medium px-4 py-2">Tags cibles</th>
                      <th className="text-left font-medium px-4 py-2">Programmation</th>
                      <th className="text-right font-medium px-4 py-2">Envois</th>
                      <th className="text-right font-medium px-4 py-2">Conversion</th>
                      <th className="text-right font-medium px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map(c => (
                      <tr key={c.id}>
                        <td className="px-4 py-2">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{c.message}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            c.status === "Active" ? "bg-green-100 text-green-700" :
                            c.status === "En pause" ? "bg-yellow-100 text-yellow-700" :
                            c.status === "Brouillon" ? "bg-gray-100 text-gray-700" : "bg-gray-200 text-gray-700"
                          }`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-2">
                          {(c.audienceTags||[]).length ? (
                            <div className="flex flex-wrap gap-1">
                              {c.audienceTags.map(t => <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">#{t}</span>)}
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-700">{c.schedule ? new Date(c.schedule).toLocaleString() : "—"}</td>
                        <td className="px-4 py-2 text-right">{c.sends.toLocaleString("fr-FR")}</td>
                        <td className="px-4 py-2 text-right">{c.conversion.toFixed(1)}%</td>
                        <td className="px-4 py-2 text-right">
                          <div className="inline-flex gap-2">
                            <button onClick={() => setDetails(c)} className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50">Voir</button>
                            <button onClick={() => openEdit(c)} className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50">Éditer</button>
                            <button onClick={() => duplicateCampaign(c)} className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50">Dupliquer</button>
                            <button onClick={() => toggleStatus(c)} className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50">{c.status === "Active" ? "Pause" : "Démarrer"}</button>
                            <button onClick={() => removeCampaign(c.id)} className="text-xs px-2 py-1 rounded-md border text-red-600 hover:bg-red-50">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">Aucune campagne.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {editing && (
        <CampaignEditModal
          data={editing}
          setData={setEditing}
          onClose={() => setEditing(null)}
          onSave={saveCampaign}
          workflows={workflows}
        />
      )}

      {details && (
        <CampaignDetailsModal data={details} onClose={() => setDetails(null)} />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function WorkflowSelector({ all = [], value = [], onChange, label = "Automatisations" }) {
  const selected = new Set(value);
  function toggle(id) {
    const n = Number(id);
    if (!n) return;
    const next = new Set(selected);
    if (next.has(n)) next.delete(n); else next.add(n);
    onChange?.(Array.from(next));
  }
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className="border rounded-md px-2 py-2 space-y-1 max-h-40 overflow-auto">
        {all.length === 0 && (
          <div className="text-xs text-gray-500">Aucun workflow disponible</div>
        )}
        {all.map(w => (
          <label key={w.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={selected.has(w.id)} onChange={()=>toggle(w.id)} />
            <span className="truncate">{w.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CampaignEditModal({ data, setData, onClose, onSave, workflows }) {
  const [timeErr, setTimeErr] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-xl border shadow-lg">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">{data.id ? (data.id === 0 ? "Nouvelle campagne" : "Modifier la campagne") : "Nouvelle campagne"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom">
              <input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            </Field>
            <Field label="Statut">
              <select value={data.status} onChange={e => setData(d => ({ ...d, status: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <TagSelector value={data.audienceTags} onChange={(v) => setData(d => ({ ...d, audienceTags: v }))} />
            <TimeField value={data.schedule} onChange={(v) => setData(d => ({ ...d, schedule: v }))} required={true} error={timeErr} setError={setTimeErr} />
            <WorkflowSelector all={workflows} value={data.workflowIds || []} onChange={(v) => setData(d => ({ ...d, workflowIds: v }))} />
          </div>
          <Field label="Message WhatsApp">
            <textarea value={data.message} onChange={e => setData(d => ({ ...d, message: e.target.value }))} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Field label="Médias (photo/vidéo)">
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      const fd = new FormData();
                      for (const f of files) fd.append("files", f);
                      try {
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const json = await res.json();
                        if (!res.ok) throw new Error(json.error || "Upload failed");
                        const urls = json.urls || [];
                        setData(d => ({ ...d, mediaUrls: Array.from(new Set([...(d.mediaUrls||[]), ...urls])) }));
                      } catch (err) {
                        alert("Échec de l’upload");
                      }
                    }}
                    className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-black"
                  />
                  {(data.mediaUrls && data.mediaUrls.length > 0) ? (
                    <div className="flex flex-wrap gap-2">
                      {data.mediaUrls.map((u, i) => (
                        <div key={u + i} className="relative group">
                          {u.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={u} className="h-20 w-28 object-cover rounded-md border" controls />
                          ) : (
                            <img src={u} alt="media" className="h-20 w-28 object-cover rounded-md border" />
                          )}
                          <button
                            type="button"
                            onClick={() => setData(d => ({ ...d, mediaUrls: (d.mediaUrls||[]).filter(x => x !== u) }))}
                            className="absolute -top-2 -right-2 hidden group-hover:block bg-white border rounded-full px-1 text-xs"
                            aria-label="Supprimer"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Aucun média sélectionné</div>
                  )}
                </div>
              </Field>
              <Field label="Variables (ex: prenom,commande)">
                <input value={data.variables} onChange={e => setData(d => ({ ...d, variables: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </Field>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs text-gray-600 mb-1">Prévisualisation WhatsApp</label>
              <div className="flex-1 min-h-[280px]">
                <WhatsAppPreview senderName={data.name || "Campagne"} message={data.message} mediaUrls={data.mediaUrls || (data.mediaUrl ? [data.mediaUrl] : [])} time={data.schedule || new Date()} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border">Annuler</button>
            <button type="button" disabled={!!timeErr} onClick={() => onSave(data)} className={`px-3 py-2 text-sm rounded-md ${timeErr ? "bg-gray-300 text-gray-600" : "bg-gray-900 text-white hover:bg-black"}`}>Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignDetailsModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-xl border shadow-lg">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Détails de la campagne</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><div className="text-xs text-gray-500">Nom</div><div className="font-medium">{data.name}</div></div>
            <div><div className="text-xs text-gray-500">Statut</div><div>{data.status}</div></div>
            <div><div className="text-xs text-gray-500">Tags cibles</div><div>{(data.audienceTags||[]).join(", ") || "—"}</div></div>
            <div><div className="text-xs text-gray-500">Programmation</div><div>{data.schedule ? new Date(data.schedule).toLocaleString() : "—"}</div></div>
            <div><div className="text-xs text-gray-500">Envois</div><div>{data.sends.toLocaleString("fr-FR")}</div></div>
            <div><div className="text-xs text-gray-500">Conversion</div><div>{data.conversion.toFixed(1)}%</div></div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Message</div>
            <div className="whitespace-pre-wrap bg-gray-50 border rounded-md p-3">{data.message || "—"}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Médias</div>
              {(data.mediaUrls && data.mediaUrls.length) ? (
                <div className="flex flex-wrap gap-2">
                  {data.mediaUrls.map((u, i) => (
                    <a key={u + i} href={u} target="_blank" className="block">
                      {u.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={u} className="h-20 w-28 object-cover rounded-md border" />
                      ) : (
                        <img src={u} alt="media" className="h-20 w-28 object-cover rounded-md border" />
                      )}
                    </a>
                  ))}
                </div>
              ) : data.mediaUrl ? (
                <a href={data.mediaUrl} target="_blank" className="text-blue-600 underline break-all">{data.mediaUrl}</a>
              ) : <div className="text-gray-500">—</div>}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Variables</div>
              <div className="text-gray-700">{data.variables || "—"}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Prévisualisation WhatsApp</div>
            <WhatsAppPreview senderName={data.name || "Campagne"} message={data.message} mediaUrls={data.mediaUrls || (data.mediaUrl ? [data.mediaUrl] : [])} time={data.schedule || new Date()} />
          </div>
          <div className="flex items-center justify-end pt-2">
            <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
