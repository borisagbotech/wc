export default function RecentActivity() {
  return (
    <div className="bg-white border rounded-xl p-4">
      <h2 className="font-medium mb-4">Activité récente</h2>
      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <span>✅</span>
          <div>
            Nouvelle campagne « Rentrée 2025 » lancée
            <div className="text-xs text-gray-500">Il y a 2 heures</div>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span>✉️</span>
          <div>
            1 200 messages envoyés
            <div className="text-xs text-gray-500">Hier</div>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span>📈</span>
          <div>
            Taux de conversion en hausse de 0,4%
            <div className="text-xs text-gray-500">Cette semaine</div>
          </div>
        </li>
      </ul>
    </div>
  );
}
