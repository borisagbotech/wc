"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const initial = {
  whatsapp_access_token: "",
  phone_number_id: "",
  waba_id: "",
  webhook_verify_token: "",
  company_name: "",
  sender_name: "",
  profile_description: "",
  website: "",
  address: "",
  subscription_plan: "",
  renewal_date: "",
};

export default function ParametresPage() {
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // User account state
  const [user, setUser] = useState({ name: "", email: "" });
  const [userSaving, setUserSaving] = useState(false);
  const [userMsg, setUserMsg] = useState("");
  const [userErr, setUserErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [resSettings, resMe] = await Promise.all([
          fetch("/api/settings", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);
        const data = resSettings.ok ? await resSettings.json() : {};
        const me = resMe.ok ? await resMe.json() : { user: null };
        if (!mounted) return;
        setValues(v => ({ ...v, ...data }));
        if (me?.user) setUser({ name: me.user.name || "", email: me.user.email || "" });
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function setField(k, v) {
    setValues(prev => ({ ...prev, [k]: v }));
  }

  async function handleSave(e) {
    e?.preventDefault?.();
    setMessage("");
    setError("");
    // Basic validation for WhatsApp config
    if (!values.whatsapp_access_token.trim() || !values.phone_number_id.trim()) {
      setError("Le token d’accès et le Phone Number ID sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Échec de l’enregistrement");
      setMessage("Paramètres enregistrés avec succès.");
    } catch (e) {
      setError(e.message || "Erreur lors de l’enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function handleUserSave(e) {
    e?.preventDefault?.();
    setUserMsg("");
    setUserErr("");
    setUserSaving(true);
    const payload = { name: user.name, email: user.email };
    const pwd = document.getElementById("newPasswordInput")?.value || "";
    if (pwd) payload.password = pwd;
    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(j.error || "Échec de la mise à jour");
      setUserMsg("Compte mis à jour.");
      if (pwd) document.getElementById("newPasswordInput").value = "";
    } catch (e) {
      setUserErr(e.message);
    } finally {
      setUserSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Paramètres</h1>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${saving || loading ? "bg-gray-300 text-gray-600" : "bg-gray-900 text-white hover:bg-black"}`}
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </header>
          <div className="p-4 sm:p-6 max-w-4xl">
            {loading ? (
              <div className="text-sm text-gray-600">Chargement...</div>
            ) : (
              <form className="space-y-8" onSubmit={handleSave}>
                {message && <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">{message}</div>}
                {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

                {/* Compte utilisateur */}
                <section className="bg-white border rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg font-semibold mb-4">Compte utilisateur</h2>
                  {userMsg && <div className="mb-3 p-2 text-sm rounded bg-green-50 text-green-700 border border-green-200">{userMsg}</div>}
                  {userErr && <div className="mb-3 p-2 text-sm rounded bg-red-50 text-red-700 border border-red-200">{userErr}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom d’utilisateur</label>
                      <input type="text" value={user.name} onChange={e=>setUser(u=>({ ...u, name: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="text" value={user.email} onChange={e=>setUser(u=>({ ...u, email: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                      <input id="newPasswordInput" type="password" placeholder="Laisser vide pour ne pas changer" className="w-full rounded-md border px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button type="button" onClick={handleUserSave} disabled={userSaving} className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${userSaving ? "bg-gray-300 text-gray-600" : "bg-gray-900 text-white hover:bg-black"}`}>{userSaving?"Sauvegarde...":"Mettre à jour"}</button>
                  </div>
                </section>

                <section className="bg-white border rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg font-semibold mb-4">Configuration API WhatsApp</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium mb-1">Token d’accès</label>
                      <input
                        type="password"
                        autoComplete="off"
                        value={values.whatsapp_access_token}
                        onChange={(e) => setField("whatsapp_access_token", e.target.value)}
                        placeholder="EAAB..."
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Depuis Meta WhatsApp Business (long-lived token)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                      <input
                        type="text"
                        value={values.phone_number_id}
                        onChange={(e) => setField("phone_number_id", e.target.value)}
                        placeholder="Ex: 123456789012345"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">WABA ID</label>
                      <input
                        type="text"
                        value={values.waba_id}
                        onChange={(e) => setField("waba_id", e.target.value)}
                        placeholder="Ex: 987654321098765"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1">Webhook Verify Token</label>
                      <input
                        type="text"
                        value={values.webhook_verify_token}
                        onChange={(e) => setField("webhook_verify_token", e.target.value)}
                        placeholder="Votre token de vérification webhook"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white border rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg font-semibold mb-4">Profil / Abonné</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom de l’entreprise</label>
                      <input
                        type="text"
                        value={values.company_name}
                        onChange={(e) => setField("company_name", e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom d’expéditeur</label>
                      <input
                        type="text"
                        value={values.sender_name}
                        onChange={(e) => setField("sender_name", e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={values.profile_description}
                        onChange={(e) => setField("profile_description", e.target.value)}
                        rows={3}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Site web</label>
                      <input
                        type="url"
                        value={values.website}
                        onChange={(e) => setField("website", e.target.value)}
                        placeholder="https://exemple.com"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Adresse</label>
                      <input
                        type="text"
                        value={values.address}
                        onChange={(e) => setField("address", e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Plan d’abonnement</label>
                      <select
                        value={values.subscription_plan}
                        onChange={(e) => setField("subscription_plan", e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      >
                        <option value="">— Sélectionner —</option>
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Renouvellement</label>
                      <input
                        type="date"
                        value={values.renewal_date}
                        onChange={(e) => setField("renewal_date", e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </section>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${saving ? "bg-gray-300 text-gray-600" : "bg-gray-900 text-white hover:bg-black"}`}
                  >
                    {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
