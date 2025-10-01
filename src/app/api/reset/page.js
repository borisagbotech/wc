"use client";
import { useEffect, useState } from "react";

export default function ResetPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (t) setToken(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères.");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas.");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Erreur lors de la réinitialisation");
      setMessage("Mot de passe réinitialisé. Vous pouvez maintenant vous connecter.");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Réinitialiser le mot de passe</h1>
        {message && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{message}</div>}
        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Nouveau mot de passe</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirmer</label>
            <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <button className="w-full rounded-md px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-black">Réinitialiser</button>
        </form>
        <div className="mt-4 text-sm">
          <a href="/login" className="text-gray-700 hover:underline">Retour à la connexion</a>
        </div>
      </div>
    </div>
  );
}
