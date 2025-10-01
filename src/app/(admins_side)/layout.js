import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="min-h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
