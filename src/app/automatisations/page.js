"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function AutomatisationsPage() {
  const [flows, setFlows] = useState([]);
  const [form, setForm] = useState({ name: "Rappel sans réponse", delayHours: 24, message: "Petit rappel" });

  async function refresh() {
    try {
      const r = await fetch("/api/workflows");
      setFlows(await r.json());
    } catch {}
  }
  useEffect(() => { refresh(); }, []);

  async function addFlow(e) {
    e.preventDefault();
    const rule = { type: "no_reply_reminder", delayHours: Number(form.delayHours)||24, message: form.message };
    await fetch("/api/workflows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, rule_json: rule }) });
    setForm({ name: "Rappel sans réponse", delayHours: 24, message: "Petit rappel" });
    await refresh();
  }
  async function removeFlow(id) {
    if (!confirm("Supprimer ce workflow ?")) return;
    await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Automatisations</h1>
            </div>
          </header>
          <div className="p-4 sm:p-6 space-y-6">
            <section className="bg-white border rounded-xl p-4">
              <h2 className="font-medium mb-3">Créer un workflow</h2>
              <form onSubmit={addFlow} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} placeholder="Nom du workflow" className="rounded-md border px-3 py-2 text-sm" />
                <input type="number" value={form.delayHours} onChange={e=>setForm(f=>({...f, delayHours:e.target.value}))} className="rounded-md border px-3 py-2 text-sm" placeholder="Délai (heures)" />
                <input value={form.message} onChange={e=>setForm(f=>({...f, message:e.target.value}))} placeholder="Message de rappel" className="rounded-md border px-3 py-2 text-sm" />
                <button className="rounded-md px-3 py-2 text-sm bg-gray-900 text-white hover:bg-black">Ajouter</button>
              </form>
            </section>

            <section className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="font-medium">Workflows</h2>
                <span className="text-xs text-gray-500">{flows.length} workflow(s)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left font-medium px-4 py-2">Nom</th>
                      <th className="text-left font-medium px-4 py-2">Règle</th>
                      <th className="text-right font-medium px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {flows.map(w => {
                      let rule;
                      try { rule = JSON.parse(w.rule_json); } catch { rule = w.rule_json; }
                      return (
                        <tr key={w.id}>
                          <td className="px-4 py-2">{w.name}</td>
                          <td className="px-4 py-2 text-xs text-gray-700">{typeof rule === 'object' ? `Si pas de réponse en ${rule.delayHours}h → envoyer "${rule.message}"` : String(rule)}</td>
                          <td className="px-4 py-2 text-right">
                            <button onClick={() => removeFlow(w.id)} className="text-xs px-2 py-1 rounded-md border text-red-600 hover:bg-red-50">Supprimer</button>
                          </td>
                        </tr>
                      );
                    })}
                    {flows.length === 0 && (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Aucun workflow.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}