"use client";
import { useEffect, useState } from "react";

export default function TimeField({ value, onChange, label = "Date/heure d’envoi", required = true, error, setError }) {
  const [val, setVal] = useState(value || "");

  useEffect(() => setVal(value || ""), [value]);

  function validate(v) {
    if (required && !v) return "Horaire obligatoire";
    const ts = Date.parse(v);
    if (!isFinite(ts)) return "Format invalide";
    if (ts < Date.now()) return "L’horaire doit être dans le futur";
    return "";
  }

  function handleChange(e) {
    const v = e.target.value;
    setVal(v);
    const err = validate(v);
    setError?.(err);
    if (!err) onChange?.(v);
  }

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}{required ? " *" : ""}</label>
      <input type="datetime-local" value={val} onChange={handleChange} className={`w-full rounded-md border px-3 py-2 text-sm ${error ? "border-red-500" : "border-gray-300"}`} />
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}
