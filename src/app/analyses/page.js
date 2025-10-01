"use client";
import Sidebar from "../components/Sidebar";

import { useEffect, useMemo, useState } from "react";

export default function AnalysesPage() {
  const [stats, setStats] = useState({ totals: null, series: [] });
  const [period, setPeriod] = useState("7j");

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => setStats({ totals: null, series: [] }));
  }, []);

  const totals = stats.totals || { sent: 0, delivered: 0, read: 0, clicked: 0, replied: 0, failed: 0, optouts: 0 };

  const rate = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(1) + "%" : "0%");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Analyses</h1>
              <select value={period} onChange={(e)=>setPeriod(e.target.value)} className="text-sm border rounded-md px-2 py-2 bg-white">
                <option value="7j">7 derniers jours</option>
              </select>
            </div>
          </header>
          <div className="p-4 sm:p-6 space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border rounded-xl p-4"><div className="text-sm text-gray-500">Envoyés</div><div className="mt-2 text-2xl font-semibold">{totals.sent.toLocaleString("fr-FR")}</div></div>
              <div className="bg-white border rounded-xl p-4"><div className="text-sm text-gray-500">Livrés</div><div className="mt-2 text-2xl font-semibold">{totals.delivered.toLocaleString("fr-FR")}</div><div className="text-xs text-gray-500">Taux de délivrabilité: {rate(totals.delivered, totals.sent)}</div></div>
              <div className="bg-white border rounded-xl p-4"><div className="text-sm text-gray-500">Lu</div><div className="mt-2 text-2xl font-semibold">{totals.read.toLocaleString("fr-FR")}</div><div className="text-xs text-gray-500">Taux de lecture: {rate(totals.read, totals.delivered)}</div></div>
              <div className="bg-white border rounded-xl p-4"><div className="text-sm text-gray-500">Cliqués</div><div className="mt-2 text-2xl font-semibold">{totals.clicked.toLocaleString("fr-FR")}</div><div className="text-xs text-gray-500">CTR: {rate(totals.clicked, totals.read)}</div></div>
            </section>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border rounded-xl p-4"><div className="text-sm text-gray-500">Répondus</div><div className="mt-2 text-2xl font-semibold">{totals.replied.toLocaleString("fr-FR")}</div><div className="text-xs text-gray-500">Taux de réponse: {rate(totals.replied, totals.read)}</div></div>
              <div className="bg-white border rounded-xl p-4"><div className="text-sm text-gray-500">Échecs</div><div className="mt-2 text-2xl font-semibold">{totals.failed.toLocaleString("fr-FR")}</div><div className="text-xs text-gray-500">{rate(totals.failed, totals.sent)} des envois</div></div>
              <div className="bg-white border rounded-xl p-4"><div className="text-sm text-gray-500">Désabonnements</div><div className="mt-2 text-2xl font-semibold">{totals.optouts.toLocaleString("fr-FR")}</div></div>
            </section>
            <section className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">Tendance quotidienne</h2>
                <div className="text-xs text-gray-500">Envoyés vs. lus</div>
              </div>
              <div className="h-56 flex items-end gap-2 overflow-x-auto px-1">
                {stats.series.map((d) => {
                  const max = Math.max(1, ...stats.series.map(x=>x.sent));
                  const h1 = Math.round((d.sent / max) * 200);
                  const h2 = Math.round((d.read / max) * 200);
                  return (
                    <div key={d.date} className="flex flex-col items-center min-w-[36px]">
                      <div className="flex items-end gap-1 h-[200px]">
                        <div className="w-3 bg-gray-200 rounded-sm" style={{height: h1}} />
                        <div className="w-3 bg-green-500 rounded-sm" style={{height: h2}} />
                      </div>
                      <div className="mt-1 text-[10px] text-gray-500">{d.date.slice(5)}</div>
                    </div>
                  );
                })}
                {stats.series.length === 0 && (
                  <div className="grid place-items-center w-full text-sm text-gray-500">Aucune donnée</div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
