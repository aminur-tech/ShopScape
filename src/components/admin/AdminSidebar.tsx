"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: "📊" },
  { href: "/admin/banners", label: "ব্যানার", icon: "🖼️" },
  { href: "/admin/products", label: "প্রোডাক্ট", icon: "📦" },
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: "🗂️" },
  { href: "/admin/orders", label: "অর্ডার", icon: "🧾" },
  { href: "/admin/customers", label: "কাস্টমার", icon: "👥" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-100 min-h-screen flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="font-bold text-brand-600">ShopScape</p>
        <p className="text-xs text-gray-400">অ্যাডমিন প্যানেল</p>
      </div>
      <nav className="flex-1 py-2">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm ${
                active ? "bg-brand-50 text-brand-700 font-medium border-r-2 border-brand-500" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        <button onClick={logout} className="text-sm text-sale mt-1">লগ আউট</button>
      </div>
    </aside>
  );
}
