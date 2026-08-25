"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { formatBDT, STATUS_LABELS_BN } from "@/lib/format";
import type { Order } from "@/lib/types";

const STATUSES = ["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!token) return;
    const params = status ? `?status=${status}` : "";
    apiFetch<{ orders: Order[] }>(`/admin/orders${params}`, { token }).then((d) => setOrders(d.orders)).catch(() => {});
  }, [token, status]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">অর্ডার</h1>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-gray-200 px-3 py-2 text-sm mb-4">
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s ? STATUS_LABELS_BN[s] : "সব স্ট্যাটাস"}</option>
        ))}
      </select>

      <table className="w-full text-sm border border-gray-100 rounded-md overflow-hidden">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-2.5">অর্ডার নম্বর</th>
            <th className="text-left px-4 py-2.5">গ্রাহক</th>
            <th className="text-left px-4 py-2.5">স্ট্যাটাস</th>
            <th className="text-left px-4 py-2.5">মোট</th>
            <th className="text-left px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-gray-50">
              <td className="px-4 py-2.5">{o.orderNumber}</td>
              <td className="px-4 py-2.5 text-gray-500">{o.fullName}</td>
              <td className="px-4 py-2.5">{STATUS_LABELS_BN[o.status]}</td>
              <td className="px-4 py-2.5">{formatBDT(o.total)}</td>
              <td className="px-4 py-2.5">
                <Link href={`/admin/orders/${o.id}`} className="text-brand-600 hover:underline">দেখুন</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="text-gray-500 mt-4">কোনো অর্ডার পাওয়া যায়নি।</p>}
    </div>
  );
}
