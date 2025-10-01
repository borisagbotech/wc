'use client';

import { useMemo, useState, useEffect } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import KpiCard from "@/app/components/KpiCard";
import ChartPlaceholder from "@/app/components/ChartPlaceholder";
import RecentActivity from "@/app/components/RecentActivity";
import CampaignTable from "@/app/components/CampaignTable";

const initialCampaigns = [
  { name: "Campagne Premium Q4", status: "Active", sends: 5200, conversion: "7.2%", revenue: "€8,560" },
  { name: "Promotion Entreprise", status: "Active", sends: 3850, conversion: "6.1%", revenue: "€5,230" },
  { name: "Abonnement Annuel", status: "Terminé", sends: 12120, conversion: "8.4%", revenue: "€12,870" },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("30 derniers jours");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [kpis, setKpis] = useState({ 
    activeClients: 0, 
    activeCampaigns: 0, 
    totalMessages: 0, 
    monthlyQuota: 100000, 
    sent30: 0, 
    usage: 0 
  });

  useEffect(() => {
    // Simuler un chargement des données
    setKpis({
      activeClients: 185,
      activeCampaigns: 24,
      totalMessages: 1245789,
      monthlyQuota: 1000000,
      sent30: 250000,
      usage: 25
    });
  }, []);

  const kpiData = [
    { 
      title: 'Clients Actifs', 
      value: kpis.activeClients.toLocaleString(),
      change: '+12.3%', 
      trend: 'up', 
      icon: '👥' 
    },
    { 
      title: 'Campagnes Actives', 
      value: kpis.activeCampaigns.toString(),
      change: '+4.2%', 
      trend: 'up', 
      icon: '📊' 
    },
    { 
      title: 'Messages Envoyés (30j)', 
      value: kpis.sent30.toLocaleString(),
      change: '+18.1%', 
      trend: 'up', 
      icon: '✉️' 
    },
    { 
      title: 'Taux d\'Utilisation', 
      value: `${kpis.usage}%`, 
      change: '+2.5%', 
      trend: 'up', 
      icon: '📈' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        {/* Barre latérale d'administration */}

        {/* Contenu principal */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Barre supérieure */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <h1 className="text-xl font-semibold">Tableau de bord d'administration</h1>
              <div className="flex items-center gap-3">
                <select 
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option>7 derniers jours</option>
                  <option>30 derniers jours</option>
                  <option>Ce mois-ci</option>
                  <option>Cette année</option>
                </select>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-8 py-1.5"
                  />
                  <span className="absolute left-2.5 top-2.5 text-gray-400">
                    🔍
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu du tableau de bord */}
          <div className="flex-1 p-4 sm:p-6">
            {/* Cartes KPI */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {kpiData.map((kpi, index) => (
                <div key={index} className="bg-white p-5 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                      <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                      <p className="text-sm mt-1">
                        <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                          {kpi.change}
                        </span>{' '}
                        <span className="text-gray-500">vs. période précédente</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                      <span className="text-xl">{kpi.icon}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Graphiques et tableaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-5 rounded-lg shadow">
                <h2 className="font-medium mb-4">Activité récente</h2>
                <ChartPlaceholder />
              </div>
              <div className="bg-white p-5 rounded-lg shadow">
                <h2 className="font-medium mb-4">Statistiques des campagnes</h2>
                <ChartPlaceholder />
              </div>
            </div>

            {/* Tableau des campagnes */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center">
                <h2 className="font-medium">Campagnes récentes</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Voir tout
                </button>
              </div>
              <CampaignTable campaigns={campaigns} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
