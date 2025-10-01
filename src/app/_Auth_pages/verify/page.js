"use client";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    async function run() {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token||"")}`);
        const j = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(j.error || "Échec de la vérification");
        setStatus("ok");
        setMessage("Votre email a été vérifié avec succès. Vous pouvez vous connecter.");
      } catch (e) {
        setStatus("error");
        setMessage(e.message);
      }
    }
    if (token) run(); else { setStatus("error"); setMessage("Token manquant"); }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Vérification de l’email</h1>
        <div className={`text-sm rounded p-3 ${status==="ok"?"text-green-700 bg-green-50 border border-green-200":status==="error"?"text-red-700 bg-red-50 border border-red-200":"text-gray-700 bg-gray-50 border"}`}>
          {message}
        </div>
        <div className="mt-4 text-sm">
          <a href="/login" className="text-gray-700 hover:underline">Aller à la connexion</a>
        </div>
      </div>
    </div>
  );
}
