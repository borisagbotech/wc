"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
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
        <div className="text-base md:text-xl font-bold tracking-tight">WC Admin</div>
        <div className="hidden md:block text-xs text-gray-500">Tableau d'administration</div>
      </div>
      <nav className="flex-1 px-1 md:px-3 py-4 space-y-1">
        <Link className={linkClass("/dashboard")} href="/dashboard" aria-label="Tableau de bord">
          <span>📊</span>
          <span className="hidden md:inline">Tableau de bord</span>
        </Link>
        <Link className={linkClass("/utilisateurs")} href="/clients" aria-label="Gestion des utilisateurs">
          <span>👥</span>
          <span className="hidden md:inline">Utilisateurs</span>
        </Link>
          <Link className={linkClass("/usermanager")} href="/use_manager" aria-label="Gestion des utilisateurs">
              <span>👥</span>
              <span className="hidden md:inline">User Manager</span>
          </Link>
          <Link className={linkClass("/campaign_monitoring")} href="/campaign_monitoring" aria-label="Suivi des campagnes">
              <span>📢</span>
              <span className="hidden md:inline">Campagnes</span>
          </Link>
        <Link className={linkClass("/abonnements")} href="/abonnements" aria-label="Gestion des abonnements">
          <span>💳</span>
          <span className="hidden md:inline">Abonnements</span>
        </Link>
        <Link className={linkClass("/rapports")} href="/rapports" aria-label="Rapports">
          <span>📈</span>
          <span className="hidden md:inline">Rapports</span>
        </Link>
        <Link className={linkClass("/parametres")} href="/parametres" aria-label="Paramètres">
          <span>⚙️</span>
          <span className="hidden md:inline">Paramètres</span>
        </Link>
      </nav>
      <div className="px-2 md:px-4 py-3 border-t">
        <button
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            } catch(e) {}
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <span>🚪</span>
          <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
