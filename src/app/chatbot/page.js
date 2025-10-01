"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function ChatbotPage() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ keyword: "", match_type: "contains", reply: "" });
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
      const r = await fetch("/api/chatbot/rules");
      setRules(await r.json());
    } catch {}
  }
  useEffect(() => { refresh(); }, []);

  async function addRule(e) {
    e.preventDefault();
    if (!form.keyword.trim() || !form.reply.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/chatbot/rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setForm({ keyword: "", match_type: "contains", reply: "" });
      await refresh();
    } finally { setLoading(false); }
  }

  async function updateRule(id, patch) {
    await fetch(`/api/chatbot/rules/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    await refresh();
  }
  async function removeRule(id) {
    if (!confirm("Supprimer cette règle ?")) return;
    await fetch(`/api/chatbot/rules/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Chatbot</h1>
            </div>
          </header>
          <div className="p-4 sm:p-6 space-y-6">
            <section className="bg-white border rounded-xl p-4">
              <h2 className="font-medium mb-3">Ajouter une règle</h2>
              <form onSubmit={addRule} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input value={form.keyword} onChange={e=>setForm(f=>({...f, keyword:e.target.value}))} placeholder="Mot-clé" className="rounded-md border px-3 py-2 text-sm" />
                <select value={form.match_type} onChange={e=>setForm(f=>({...f, match_type:e.target.value}))} className="rounded-md border px-3 py-2 text-sm">
                  <option value="contains">Contient</option>
                  <option value="equals">Égal à</option>
                  <option value="starts">Commence par</option>
                </select>
                <input value={form.reply} onChange={e=>setForm(f=>({...f, reply:e.target.value}))} placeholder="Réponse automatique" className="rounded-md border px-3 py-2 text-sm" />
                <button disabled={loading} className={`rounded-md px-3 py-2 text-sm ${loading?"bg-gray-300 text-gray-600":"bg-gray-900 text-white hover:bg-black"}`}>Ajouter</button>
              </form>
            </section>

            <section className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="font-medium">Règles</h2>
                <span className="text-xs text-gray-500">{rules.length} règle(s)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left font-medium px-4 py-2">Mot-clé</th>
                      <th className="text-left font-medium px-4 py-2">Type</th>
                      <th className="text-left font-medium px-4 py-2">Réponse</th>
                      <th className="text-right font-medium px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rules.map(r => (
                      <tr key={r.id}>
                        <td className="px-4 py-2">{r.keyword}</td>
                        <td className="px-4 py-2">{r.match_type}</td>
                        <td className="px-4 py-2">{r.reply}</td>
                        <td className="px-4 py-2 text-right">
                          <div className="inline-flex gap-2">
                            <button onClick={() => {
                              const reply = prompt("Nouvelle réponse", r.reply);
                              if (reply !== null) updateRule(r.id, { reply });
                            }} className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50">Éditer</button>
                            <button onClick={() => removeRule(r.id)} className="text-xs px-2 py-1 rounded-md border text-red-600 hover:bg-red-50">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rules.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Aucune règle.</td></tr>
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