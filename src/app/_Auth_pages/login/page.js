"use client";
import { useState } from "react";

export default function LoginPage({ searchParams }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Échec de la connexion");
      }
      const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      window.location.href = next || "/";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Connexion</h1>
        <p className="text-sm text-gray-600 mb-4">Identifiants initiaux: utilisateur <b>admin</b> et mot de passe <b>admin</b>.</p>
        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email ou nom d’utilisateur</label>
            <input value={identifier} onChange={e=>setIdentifier(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="admin" />
          </div>
          <div>
            <label className="block text-sm mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="••••••" />
          </div>
          <button disabled={loading} className={`w-full rounded-md px-3 py-2 text-sm font-medium ${loading?"bg-gray-300 text-gray-600":"bg-gray-900 text-white hover:bg-black"}`}>{loading?"Connexion...":"Se connecter"}</button>
        </form>
        <div className="mt-4 text-sm">
          <a href="/forgot-password" className="text-gray-700 hover:underline">Mot de passe oublié ?</a>
        </div>
      </div>
    </div>
  );
}
