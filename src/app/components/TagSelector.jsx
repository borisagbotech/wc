"use client";
import { useEffect, useMemo, useState } from "react";

export default function TagSelector({ value = [], onChange, label = "Tags cibles" }) {
  const [allTags, setAllTags] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/contacts/tags").then(r => r.json()).then(setAllTags).catch(() => setAllTags([]));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const available = allTags.filter(t => !value.includes(t));
    return s ? available.filter(t => t.toLowerCase().includes(s)) : available;
  }, [q, allTags, value]);

  function add(tag) {
    if (!tag) return;
    if (!value.includes(tag)) onChange?.([...value, tag]);
    setQ("");
    setOpen(false);
  }
  function remove(tag) {
    onChange?.(value.filter(t => t !== tag));
  }

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className="border rounded-md px-2 py-1">
        <div className="flex flex-wrap gap-1">
          {value.map(t => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
              #{t}
              <button className="hover:text-gray-900" onClick={() => remove(t)}>×</button>
            </span>
          ))}
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={value.length ? "Ajouter un tag" : "Choisir des tags"}
            className="flex-1 min-w-[120px] px-2 py-1 text-sm outline-none"
          />
        </div>
      </div>
      {open && filtered.length > 0 && (
        <div className="mt-1 border rounded-md bg-white shadow-sm max-h-40 overflow-auto">
          {filtered.map(t => (
            <button key={t} onClick={() => add(t)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">#{t}</button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="mt-1 text-xs text-gray-500">Aucun tag correspondant</div>
      )}
    </div>
  );
}
