"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, downloadMyInvoice } from "@/lib/api";
import { formatBDT, STATUS_LABELS_BN } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function AccountPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (token) {
      apiFetch<{ orders: Order[] }>("/orders", { token }).then((d) => setOrders(d.orders)).catch(() => {});
    }
  }, [token]);

  if (loading || !user) return <p className="py-10 text-center text-gray-500">লোড হচ্ছে...</p>;

  async function handleDownloadInvoice(order: Order) {
    if (!token) return;
    try {
      await downloadMyInvoice(order.id, token, `invoice-${order.orderNumber}.pdf`);
    } catch {
      alert("ইনভয়েস ডাউনলোড করতে সমস্যা হয়েছে");
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <button onClick={logout} className="text-sm text-sale">লগ আউট</button>
      </div>

      <h2 className="font-semibold mb-3">আমার অর্ডারসমূহ</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">এখনো কোনো অর্ডার নেই।</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-100 rounded-md p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("bn-BD")}</p>
                <button onClick={() => handleDownloadInvoice(order)} className="text-xs text-brand-600 hover:underline mt-1">
                  📄 ইনভয়েস ডাউনলোড
                </button>
              </div>
              <div className="text-right">
                <p className="text-brand-600 font-medium">{STATUS_LABELS_BN[order.status]}</p>
                <p className="text-sm text-gray-600">{formatBDT(order.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
