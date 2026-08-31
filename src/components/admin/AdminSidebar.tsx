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

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <>
      {/* =====================================================
          DESKTOP STICKY SIDEBAR
      ===================================================== */}
      <aside
        className="
          hidden lg:flex
          sticky top-0
          h-screen
          w-60 xl:w-64
          shrink-0
          flex-col
          border-r border-gray-200
          bg-white
          z-40
        "
      >
        {/* ===================================================
            BRAND
        =================================================== */}
        <div className="shrink-0 border-b border-gray-100 px-5 py-5">
          <Link href="/" className="block">
            <p className="text-lg font-bold text-brand-600">
              ShopScape
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
              অ্যাডমিন প্যানেল
            </p>
          </Link>
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {LINKS.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "group relative flex items-center gap-3",
                    "rounded-xl px-3.5 py-3",
                    "text-sm font-medium",
                    "transition-all duration-200",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  ].join(" ")}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
                  )}

                  {/* Icon */}
                  <span
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center",
                      "rounded-lg text-base",
                      "transition-colors",
                      active
                        ? "bg-white shadow-sm"
                        : "bg-gray-50 group-hover:bg-white",
                    ].join(" ")}
                  >
                    {link.icon}
                  </span>

                  {/* Label */}
                  <span className="truncate">
                    {link.label}
                  </span>

                  {/* Active dot */}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ===================================================
            USER SECTION
        =================================================== */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="mb-1 text-[11px] text-gray-400">
              লগইন করা হয়েছে
            </p>

            <p className="truncate text-sm font-medium text-gray-700">
              {user?.email ?? "Admin"}
            </p>

            <button
              type="button"
              onClick={logout}
              className="
                mt-3 w-full
                rounded-lg
                border border-red-100
                bg-white
                px-3 py-2
                text-sm font-medium text-red-600
                transition
                hover:bg-red-50
                active:scale-[0.98]
              "
            >
              লগ আউট
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MOBILE FIXED BOTTOM NAV
      ===================================================== */}
      <nav
        className="
          fixed inset-x-0 bottom-0 z-50
          lg:hidden
          border-t border-gray-200
          bg-white/95
          shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
          backdrop-blur-md
          pb-[env(safe-area-inset-bottom)]
        "
      >
        <div className="flex min-h-16 overflow-x-auto">
          {LINKS.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "relative flex min-w-[72px] flex-1",
                  "flex-col items-center justify-center",
                  "gap-1 px-1",
                  "text-[10px] font-medium",
                  "transition-colors",
                  active
                    ? "text-brand-600"
                    : "text-gray-500 hover:text-gray-900",
                ].join(" ")}
              >
                {active && (
                  <span
                    className="
                      absolute top-0
                      left-1/2
                      h-0.5 w-8
                      -translate-x-1/2
                      rounded-full
                      bg-brand-500
                    "
                  />
                )}

                <span className="text-base leading-none">
                  {link.icon}
                </span>

                <span className="max-w-[64px] truncate">
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="
              flex min-w-[72px] flex-1
              flex-col items-center justify-center
              gap-1 px-1
              text-[10px] font-medium
              text-red-500
              transition-colors
              hover:text-red-600
            "
          >
            <span className="text-base leading-none">
              🚪
            </span>

            <span>লগ আউট</span>
          </button>
        </div>
      </nav>
    </>
  );
}