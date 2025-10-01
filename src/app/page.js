"use client";

import { useMemo, useState , useEffect} from "react";
import Sidebar from "./components/Sidebar";
import KpiCard from "./components/KpiCard";
import ChartPlaceholder from "./components/ChartPlaceholder";
import RecentActivity from "./components/RecentActivity";
import CampaignTable from "./components/CampaignTable";

const initialCampaigns = [
  { name: "Lancement produit Q4", status: "Active", sends: 3200, conversion: "5.2%", revenue: "€4 560" },
  { name: "Promo rentrée", status: "En pause", sends: 1850, conversion: "3.9%", revenue: "€1 230" },
  { name: "Soldes d'été", status: "Terminé", sends: 9120, conversion: "4.4%", revenue: "€6 870" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("30 derniers jours");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [kpis, setKpis] = useState({ activeClients: 0, activeCampaigns: 0, totalMessages: 0, monthlyQuota: 10000, sent30: 0, usage: 0 });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/kpis", { cache: "no-store" });
        const j = await res.json();
        if (res.ok) setKpis(j);
      } catch {}
    })();
  }, []);

  function addCampaign() {
    const id = campaigns.length + 1;
    setCampaigns(prev => [
      { name: `Nouvelle campagne ${id}` , status: "Active", sends: 0, conversion: "0.0%", revenue: "€0" },
      ...prev,
    ]);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Tableau de bord</h1>
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
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="text-sm border rounded-md px-2 py-2 bg-white"
                >
                  <option>30 derniers jours</option>
                  <option>7 derniers jours</option>
                  <option>Cette année</option>
                </select>
                <a
                  href="/campagnes/nouveau"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-3 py-2 text-sm font-medium hover:bg-green-700"
                >
                  + Nouvelle campagne
                </a>
              </div>
            </div>
          </header>

          {/* Content sections */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* KPI cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Clients actifs" value={kpis.activeClients.toLocaleString('fr-FR')} sublabel="Tag Client" />
              <KpiCard label="Campagnes actives" value={kpis.activeCampaigns.toLocaleString('fr-FR')} />
              <KpiCard label="Messages envoyés" value={kpis.totalMessages.toLocaleString('fr-FR')} />
              <KpiCard label="Quota utilisé" value={`${kpis.usage}%`} sublabel={`Sur ${kpis.monthlyQuota.toLocaleString('fr-FR')} / 30j`} />
            </section>

            {/* Chart + Activity */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartPlaceholder period={period} />
              </div>
              <RecentActivity />
            </section>

            {/* Recent campaigns table */}
            <CampaignTable campaigns={campaigns} search={search} />
          </div>
        </main>
      </div>
    </div>
  );
}
