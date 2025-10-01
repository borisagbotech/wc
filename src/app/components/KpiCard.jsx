export default function KpiCard({ label, value, sublabel, sublabelClass = "text-gray-500" }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {sublabel && <div className={`mt-1 text-xs ${sublabelClass}`}>{sublabel}</div>}
    </div>
  );
}
