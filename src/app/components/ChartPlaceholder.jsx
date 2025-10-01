export default function ChartPlaceholder({ period }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">Performance des campagnes</h2>
        <div className="text-xs text-gray-500">Période: {period}</div>
      </div>
      <div className="h-48 grid place-items-center text-sm text-gray-500">
        Graphique à venir
      </div>
    </div>
  );
}
