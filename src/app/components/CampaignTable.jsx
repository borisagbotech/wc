"use client";

export default function CampaignTable({ campaigns = [], search = '' }) {
  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <section className="bg-white border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="font-medium">Campagnes récentes</h2>
        <span className="text-xs text-gray-500">{filtered.length} affichée(s)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left font-medium px-4 py-2">Nom</th>
              <th className="text-left font-medium px-4 py-2">Statut</th>
              <th className="text-right font-medium px-4 py-2">Envois</th>
              <th className="text-right font-medium px-4 py-2">Conversion</th>
              <th className="text-right font-medium px-4 py-2">Revenus</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                    c.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : c.status === "En pause"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{c.sends.toLocaleString("fr-FR")}</td>
                <td className="px-4 py-2 text-right">{c.conversion}</td>
                <td className="px-4 py-2 text-right">{c.revenue}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Aucune campagne ne correspond à votre recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
