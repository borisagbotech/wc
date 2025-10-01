"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (href) => {
    const isActive = pathname === href;
    return [
      "flex items-center gap-3 px-3 py-2 rounded-lg",
      isActive ? "bg-green-600 text-white" : "hover:bg-gray-100 text-gray-800",
    ].join(" ");
  };

  return (
    <aside className="flex w-16 md:w-64 flex-col bg-white border-r">
      <div className="px-2 md:px-6 py-5 border-b">
        <div className="text-base md:text-xl font-bold tracking-tight">WC</div>
        <div className="hidden md:block text-xs text-gray-500">Tableau de bord</div>
      </div>
      <nav className="flex-1 px-1 md:px-3 py-4 space-y-1">
        <Link className={linkClass("/")} href="/" aria-label="Tableau de bord">
          <span>🏠</span>
          <span className="hidden md:inline">Tableau de bord</span>
        </Link>
        <Link className={linkClass("/campagnes")} href="/campagnes" aria-label="Campagnes">
          <span>🎯</span>
          <span className="hidden md:inline">Campagnes</span>
        </Link>
        <Link className={linkClass("/_clients_side/contacts")} href="/contacts" aria-label="Contacts">
          <span>👥</span>
          <span className="hidden md:inline">Contacts</span>
        </Link>
        <Link className={linkClass("/analyses")} href="/analyses" aria-label="Rapports">
          <span>📈</span>
          <span className="hidden md:inline">Rapports</span>
        </Link>
        <Link className={linkClass("/automatisations")} href="/automatisations" aria-label="Automatisation">
          <span>🔁</span>
          <span className="hidden md:inline">Automatisation</span>
        </Link>
        <Link className={linkClass("/parametres")} href="/parametres" aria-label="Paramètres">
          <span>⚙️</span>
          <span className="hidden md:inline">Paramètres</span>
        </Link>
      </nav>
      <div className="px-2 md:px-4 py-3 border-t">
        <button
          onClick={async ()=>{ try { await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login'; } catch(e){} }}
          className="w-full text-left text-xs md:text-sm px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">
          Se déconnecter
        </button>
        <div className="mt-2 text-[10px] md:text-xs text-gray-500">v1.0.0</div>
      </div>
    </aside>
  );
}
