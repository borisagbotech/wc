"use client";
import { useEffect, useMemo, useState } from "react";

export default function AudienceTagSelector({ value = [], onChange, label = "Tags d'audience" }) {
  const [allTags, setAllTags] = useState([]);
  const [tagCounts, setTagCounts] = useState({});
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Récupérer les tags avec le nombre de contacts
        const response = await fetch("/api/audience/tags/counts");
        if (!response.ok) throw new Error("Erreur lors du chargement des tags");
        const data = await response.json();
        
        setAllTags(data.tags);
        setTagCounts(data.counts);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de charger les tags d'audience");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
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

  if (loading) return <div className="text-sm text-gray-500">Chargement des tags d'audience...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">
        {label} 
        <span className="text-gray-400 ml-1">
          ({value.length} sélectionné{value.length > 1 ? 's' : ''})
        </span>
      </label>
      <div className="border rounded-md px-2 py-1">
        <div className="flex flex-wrap gap-1">
          {value.map(t => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
              #{t} <span className="text-blue-500 text-[10px]">({tagCounts[t] || 0})</span>
              <button 
                className="hover:text-blue-900 text-blue-500 ml-0.5" 
                onClick={(e) => {
                  e.preventDefault();
                  remove(t);
                }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder={value.length ? "Ajouter un tag" : "Sélectionnez des tags d'audience"}
            className="flex-1 min-w-[120px] px-2 py-1 text-sm outline-none"
          />
        </div>
      </div>
      {open && filtered.length > 0 && (
        <div className="mt-1 border rounded-md bg-white shadow-sm max-h-60 overflow-auto">
          {filtered.map((tag) => (
            <div
              key={tag}
              className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              onMouseDown={(e) => {
                e.preventDefault();
                add(tag);
              }}
            >
              <span>#{tag}</span>
              <span className="text-xs text-gray-500">{tagCounts[tag] || 0} contact{tagCounts[tag] !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
