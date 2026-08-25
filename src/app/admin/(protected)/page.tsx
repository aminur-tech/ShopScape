"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { formatBDT, STATUS_LABELS_BN } from "@/lib/format";

type DashboardData = {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  ordersByStatus: { status: string; count: number }[];
  lowStockProducts: { id: string; name: string; stock: number }[];
  recentOrders: { id: string; orderNumber: string; status: string; total: number; createdAt: string }[];
};

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (token) {
      apiFetch<DashboardData>("/admin/dashboard", { token }).then(setData).catch(() => {});
    }
  }, [token]);

  if (!data) return <p className="text-gray-500">লোড হচ্ছে...</p>;

  const cards = [
    { label: "মোট অর্ডার", value: data.totalOrders },
    { label: "মোট কাস্টমার", value: data.totalCustomers },
    { label: "মোট আয়", value: formatBDT(data.totalRevenue) },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="border border-gray-100 rounded-md p-5">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-md p-5">
          <h2 className="font-semibold mb-3">স্ট্যাটাস অনুযায়ী অর্ডার</h2>
          {data.ordersByStatus.map((s) => (
            <div key={s.status} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span>{STATUS_LABELS_BN[s.status] ?? s.status}</span>
              <span className="font-medium">{s.count}</span>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-md p-5">
          <h2 className="font-semibold mb-3">কম স্টক প্রোডাক্ট</h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400">সব প্রোডাক্টের স্টক পর্যাপ্ত।</p>
          ) : (
            data.lowStockProducts.map((p) => (
              <div key={p.id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <span>{p.name}</span>
                <span className="text-sale font-medium">{p.stock} বাকি</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border border-gray-100 rounded-md p-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">সাম্প্রতিক অর্ডার</h2>
          <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">সব দেখুন</Link>
        </div>
        {data.recentOrders.map((o) => (
          <div key={o.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
            <span>{o.orderNumber}</span>
            <span className="text-gray-500">{STATUS_LABELS_BN[o.status] ?? o.status}</span>
            <span className="font-medium">{formatBDT(o.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
