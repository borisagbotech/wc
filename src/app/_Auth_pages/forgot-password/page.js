"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Erreur lors de la demande");
      setSent(true);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Mot de passe oublié</h1>
        {sent ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
            Si un compte existe pour cet email, un lien de réinitialisation a été envoyé. Consultez votre boîte mail.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="vous@exemple.com" />
            </div>
            <button className="w-full rounded-md px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-black">Envoyer le lien</button>
          </form>
        )}
        <div className="mt-4 text-sm">
          <a href="/login" className="text-gray-700 hover:underline">Retour à la connexion</a>
        </div>
      </div>
    </div>
  );
}
