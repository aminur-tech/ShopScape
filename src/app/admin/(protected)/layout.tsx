import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          <AdminSidebar />

          <main className="min-w-0 flex-1 overflow-x-hidden">
            <div className="w-full p-3 sm:p-5 lg:p-6 xl:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
