"use client";
import { useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import AudienceTagSelector from "../../components/AudienceTagSelector";
import TimeField from "../../components/TimeField";
import WhatsAppPreview from "../../components/WhatsAppPreview";
import Link from "next/link";

const templates = [
  { id: 1, name: "Annonce produit", message: "Bonjour {{prenom}}, découvrez notre nouveau produit 🚀", mediaUrls: [] },
  { id: 2, name: "Promotion", message: "-20% jusqu'à dimanche ! Utilisez le code PROMO20.", mediaUrls: [] },
  { id: 3, name: "Relance panier", message: "Votre panier vous attend. Besoin d'aide ?", mediaUrls: [] },
];

export default function CampaignWizardPage() {
  const [step, setStep] = useState(1);
  const [audienceTags, setAudienceTags] = useState([]);
  const [tplId, setTplId] = useState(templates[0].id);
  const [message, setMessage] = useState(templates[0].message);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [schedule, setSchedule] = useState("");
  const [timeErr, setTimeErr] = useState("");

  const tpl = useMemo(() => templates.find(t => t.id === tplId) || templates[0], [tplId]);

  function next() {
    if (step === 1 && audienceTags.length === 0) { alert("Sélectionnez au moins un tag d'audience."); return; }
    if (step === 2 && !message.trim()) { alert("Le message est obligatoire."); return; }
    if (step === 3 && (timeErr || !schedule)) { alert("Veuillez choisir une date/heure valide."); return; }
    setStep(s => Math.min(4, s + 1));
  }
  function back() { setStep(s => Math.max(1, s - 1)); }

  async function submit() {
    try {
      await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: tpl.name,
        status: "Brouillon",
        message,
        mediaUrls,
        variables: "prenom",
        schedule,
        audienceTags,
      })});
      alert("Campagne créée !");
    } catch {
      alert("Erreur lors de la création");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Nouvelle campagne</h1>
                <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">Assistant</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Link href="/campagnes" className="px-3 py-2 rounded-md border hover:bg-gray-50">Annuler</Link>
                {step > 1 && <button onClick={back} className="px-3 py-2 rounded-md border hover:bg-gray-50">Retour</button>}
                {step < 4 ? (
                  <button onClick={next} className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">Continuer</button>
                ) : (
                  <button onClick={submit} className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">Créer la campagne</button>
                )}
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 space-y-6">
            <Stepper step={step} />

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Sélection de l'audience</h2>
                
                <AudienceTagSelector
                  value={audienceTags}
                  onChange={setAudienceTags}
                  label="Tags d'audience"
                />
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={next}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white border rounded-xl p-4 space-y-4">
                  <h2 className="font-medium">2. Sélectionner un template</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templates.map(t => (
                      <button key={t.id} onClick={() => { setTplId(t.id); setMessage(t.message); }} className={`text-left rounded-lg border p-3 hover:bg-gray-50 ${tplId===t.id?"ring-2 ring-green-600 border-green-600":""}`}>
                        <div className="font-medium mb-1">{t.name}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{t.message}</div>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Message</label>
                    <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} className="w-full rounded-md border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Médias (image/vidéo)</label>
                    <input type="url" placeholder="URL du média (optionnel)" onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); const v=e.currentTarget.value.trim(); if(v){ setMediaUrls(u=>Array.from(new Set([...u, v]))); e.currentTarget.value=''; }}}} className="w-full rounded-md border px-3 py-2 text-sm" />
                    {mediaUrls.length>0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mediaUrls.map(u=> (
                          <div key={u} className="relative">
                            <img src={u} alt="media" className="h-20 w-28 object-cover rounded-md border" />
                            <button onClick={()=>setMediaUrls(list=>list.filter(x=>x!==u))} className="absolute -top-2 -right-2 bg-white border rounded-full px-1 text-xs">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white border rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-2">Aperçu</div>
                  <WhatsAppPreview senderName={tpl.name} message={message} mediaUrls={mediaUrls} />
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="bg-white border rounded-xl p-4">
                <h2 className="font-medium mb-3">3. Programmer l'envoi</h2>
                <div className="max-w-md">
                  <TimeField value={schedule} onChange={setSchedule} error={timeErr} setError={setTimeErr} />
                </div>
                <p className="mt-2 text-xs text-gray-500">Planifiez l'envoi pour maximiser l'engagement.</p>
              </section>
            )}

            {step === 4 && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white border rounded-xl p-4 space-y-2 lg:col-span-2">
                  <h2 className="font-medium">4. Relecture</h2>
                  <SummaryRow label="Audience" value={audienceTags.length ? audienceTags.join(', ') : '—'} />
                  <SummaryRow label="Template" value={tpl.name} />
                  <SummaryRow label="Programmation" value={schedule ? new Date(schedule).toLocaleString() : '—'} />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Message</div>
                    <div className="bg-gray-50 border rounded-md p-3 text-sm whitespace-pre-wrap">{message}</div>
                  </div>
                </div>
                <div className="bg-white border rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-2">Aperçu</div>
                  <WhatsAppPreview senderName={tpl.name} message={message} mediaUrls={mediaUrls} time={schedule || new Date()} />
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const items = [
    { id: 1, label: "Audience" },
    { id: 2, label: "Template" },
    { id: 3, label: "Programmation" },
    { id: 4, label: "Relecture & Envoi" },
  ];
  return (
    <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(it => (
        <li key={it.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${step>=it.id?"bg-green-50 border-green-200":"bg-white"}`}>
          <span className={`h-6 w-6 inline-flex items-center justify-center rounded-full text-xs font-medium ${step>=it.id?"bg-green-600 text-white":"bg-gray-200 text-gray-700"}`}>{it.id}</span>
          <span className="truncate">{it.label}</span>
        </li>
      ))}
    </ol>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  );
}
